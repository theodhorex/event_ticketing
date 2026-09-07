import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, tickets } from "@/db/schema";
import { eq } from "drizzle-orm";
import mysql from "mysql2/promise";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status } = body as { orderId: string; status: string };

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "event_ticketing",
    });

    try {
      await connection.beginTransaction();

      const [orderRows] = await connection.query<mysql.RowDataPacket[]>(
        "SELECT * FROM orders WHERE id = ? FOR UPDATE",
        [orderId]
      );

      if (orderRows.length === 0) {
        await connection.rollback();
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      const order = orderRows[0];

      if (status === "paid") {
        await connection.query(
          "UPDATE orders SET status = 'paid', paid_at = NOW(), updated_at = NOW() WHERE id = ?",
          [orderId]
        );
      } else if (status === "expired") {
        const [items] = await connection.query<mysql.RowDataPacket[]>(
          "SELECT ticket_tier_id, quantity FROM order_items WHERE order_id = ?",
          [orderId]
        );

        for (const item of items) {
          await connection.query(
            "UPDATE ticket_tiers SET sold_count = sold_count - ? WHERE id = ?",
            [item.quantity, item.ticket_tier_id]
          );
        }

        await connection.query(
          "UPDATE orders SET status = 'expired', updated_at = NOW() WHERE id = ?",
          [orderId]
        );
      }

      await connection.commit();
      return NextResponse.json({ success: true, orderId, status });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Simulate payment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
