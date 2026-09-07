import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, tickets, ticketTiers, events } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import mysql from "mysql2/promise";
import { createSnapToken } from "@/lib/midtrans";

const RESERVATION_MINUTES = 10;

function generateQrData(ticketId: string, orderId: string): string {
  const payload = JSON.stringify({ ticketId, orderId });
  const hash = crypto
    .createHmac("sha256", process.env.AUTH_SECRET || "secret")
    .update(payload)
    .digest("hex")
    .slice(0, 16);
  return Buffer.from(JSON.stringify({ ticketId, orderId, hash })).toString("base64");
}

export async function POST(req: NextRequest) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "event_ticketing",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items } = body as { items: Array<{ ticketTierId: string; quantity: number }> };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    }

    for (const item of items) {
      if (!item.ticketTierId || !item.quantity || item.quantity < 1) {
        return NextResponse.json({ error: "Invalid item format" }, { status: 400 });
      }
    }

    const ticketTierIds = items.map((i) => i.ticketTierId);

    const tiersData = await db
      .select({
        id: ticketTiers.id,
        name: ticketTiers.name,
        priceInCents: ticketTiers.priceInCents,
        quota: ticketTiers.quota,
        soldCount: ticketTiers.soldCount,
        eventId: ticketTiers.eventId,
        eventTitle: events.title,
        isPublished: events.isPublished,
      })
      .from(ticketTiers)
      .innerJoin(events, eq(ticketTiers.eventId, events.id))
      .where(inArray(ticketTiers.id, ticketTierIds));

    if (tiersData.length !== ticketTierIds.length) {
      return NextResponse.json({ error: "Some ticket tiers not found" }, { status: 404 });
    }

    for (const item of items) {
      const tier = tiersData.find((t) => t.id === item.ticketTierId);
      if (!tier) {
        return NextResponse.json({ error: "Ticket tier not found" }, { status: 404 });
      }
      if (tier.isPublished === 0) {
        return NextResponse.json({ error: `Event ${tier.name} is not available` }, { status: 400 });
      }
      const available = tier.quota - tier.soldCount;
      if (available < item.quantity) {
        return NextResponse.json(
          { error: `Not enough tickets for ${tier.name}. Available: ${available}` },
          { status: 400 }
        );
      }
    }

    await connection.beginTransaction();

    try {
      const [lockedRows] = await connection.query<mysql.RowDataPacket[]>(
        `SELECT id, quota, sold_count, price_in_cents, name FROM ticket_tiers WHERE id IN (${ticketTierIds.map(() => "?").join(",")}) FOR UPDATE`,
        ticketTierIds
      );

      for (const item of items) {
        const tier = lockedRows.find((t: mysql.RowDataPacket) => t.id === item.ticketTierId);
        if (!tier) {
          await connection.rollback();
          return NextResponse.json({ error: "Ticket tier not found" }, { status: 404 });
        }
        if ((tier.quota - tier.sold_count) < item.quantity) {
          await connection.rollback();
          return NextResponse.json(
            { error: `Not enough tickets for ${tier.name}. Available: ${tier.quota - tier.sold_count}` },
            { status: 400 }
          );
        }
      }

      for (const item of items) {
        await connection.query(
          "UPDATE ticket_tiers SET sold_count = sold_count + ? WHERE id = ?",
          [item.quantity, item.ticketTierId]
        );
      }

      let totalInCents = 0;
      for (const item of items) {
        const tier = lockedRows.find((t: mysql.RowDataPacket) => t.id === item.ticketTierId);
        if (!tier) {
          await connection.rollback();
          return NextResponse.json({ error: "Ticket tier not found" }, { status: 404 });
        }
        totalInCents += tier.price_in_cents * item.quantity;
      }

      const orderId = uuidv4();
      const reservedUntil = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000);

      await connection.query(
        `INSERT INTO orders (id, buyer_id, status, total_in_cents, reserved_until, created_at, updated_at)
         VALUES (?, ?, 'pending', ?, ?, NOW(), NOW())`,
        [orderId, session.user.id, totalInCents, reservedUntil]
      );

      const createdOrderItems: Array<{
        id: string;
        ticketTierId: string;
        quantity: number;
        unitPriceInCents: number;
        subtotalInCents: number;
      }> = [];

      for (const item of items) {
        const tier = lockedRows.find((t: mysql.RowDataPacket) => t.id === item.ticketTierId)!;
        const orderItemId = uuidv4();
        const subtotal = tier.price_in_cents * item.quantity;

        await connection.query(
          `INSERT INTO order_items (id, order_id, ticket_tier_id, quantity, unit_price_in_cents, subtotal_in_cents, created_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [orderItemId, orderId, item.ticketTierId, item.quantity, tier.price_in_cents, subtotal]
        );

        createdOrderItems.push({
          id: orderItemId,
          ticketTierId: item.ticketTierId,
          quantity: item.quantity,
          unitPriceInCents: tier.price_in_cents,
          subtotalInCents: subtotal,
        });
      }

      const createdTickets: Array<{ id: string; qrData: string }> = [];

      for (const orderItem of createdOrderItems) {
        for (let i = 0; i < orderItem.quantity; i++) {
          const ticketId = uuidv4();
          const qrData = generateQrData(ticketId, orderId);

          await connection.query(
            `INSERT INTO tickets (id, order_id, order_item_id, ticket_tier_id, qr_data, is_used, created_at)
             VALUES (?, ?, ?, ?, ?, 0, NOW())`,
            [ticketId, orderId, orderItem.id, orderItem.ticketTierId, qrData]
          );

          createdTickets.push({ id: ticketId, qrData });
        }
      }

      await connection.commit();

      const user = session.user as { email?: string; name?: string };
      const userName = user.name || "Customer";
      const [firstName, ...rest] = userName.split(" ");

      let snapToken = "";
      try {
        snapToken = await createSnapToken({
          transaction_details: {
            order_id: orderId,
            gross_amount: totalInCents / 100,
          },
          customer_details: {
            first_name: firstName,
            last_name: rest.join(" "),
            email: user.email,
          },
          callbacks: {
            finish: `${process.env.NEXTAUTH_URL}/dashboard/orders?orderId=${orderId}`,
          },
        });
      } catch (midtransError) {
        console.warn("Midtrans token creation failed, using mock:", midtransError);
        snapToken = `mock-snap-token-${orderId}`;
      }

      return NextResponse.json({
        orderId,
        status: "pending",
        reservedUntil,
        totalInCents,
        snapToken,
        orderItems: createdOrderItems,
        tickets: createdTickets,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await connection.end();
  }
}
