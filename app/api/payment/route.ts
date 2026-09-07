import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import mysql from "mysql2/promise";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "event_ticketing",
    });

    try {
      const [rows] = await connection.query<mysql.RowDataPacket[]>(
        "SELECT * FROM orders WHERE id = ?",
        [orderId]
      );

      if (rows.length === 0) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      const order = rows[0];

      if (order.buyer_id !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (order.status === "pending" && new Date(order.reserved_until) < new Date()) {
        await connection.query(
          "UPDATE orders SET status = 'expired', updated_at = NOW() WHERE id = ?",
          [orderId]
        );
        order.status = "expired";
      }

      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

      if (order.status === "paid") {
        return NextResponse.redirect(new URL(`${baseUrl}/dashboard/orders?success=true&orderId=${orderId}`));
      } else if (order.status === "expired" || order.status === "cancelled") {
        return NextResponse.redirect(new URL(`${baseUrl}/dashboard/orders?cancelled=true&orderId=${orderId}`));
      }

      const snapToken = `mock-snap-token-${orderId}`;

      return NextResponse.json({
        orderId: order.id,
        status: order.status,
        totalInCents: order.total_in_cents,
        reservedUntil: order.reserved_until,
        snapToken,
      });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Payment status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
