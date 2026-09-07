import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import mysql from "mysql2/promise";
import { verifyNotification } from "@/lib/midtrans";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!verifyNotification(body)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const { order_id, transaction_status, payment_type } = body;

    if (!order_id || !transaction_status) {
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

      const [orders] = await connection.query<mysql.RowDataPacket[]>(
        "SELECT * FROM orders WHERE id = ? FOR UPDATE",
        [order_id]
      );

      if (orders.length === 0) {
        await connection.rollback();
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      const order = orders[0];

      if (order.status !== "pending") {
        await connection.commit();
        return NextResponse.json({ message: "Order already processed" });
      }

      if (transaction_status === "capture" || transaction_status === "settlement") {
        await connection.query(
          "UPDATE orders SET status = 'paid', paid_at = NOW(), updated_at = NOW() WHERE id = ?",
          [order_id]
        );
      } else if (transaction_status === "cancel" || transaction_status === "expire") {
        const [tiers] = await connection.query<mysql.RowDataPacket[]>(
          `SELECT oi.ticket_tier_id, oi.quantity FROM order_items oi WHERE oi.order_id = ?`,
          [order_id]
        );

        for (const item of tiers) {
          await connection.query(
            "UPDATE ticket_tiers SET sold_count = sold_count - ? WHERE id = ?",
            [item.quantity, item.ticket_tier_id]
          );
        }

        await connection.query(
          "UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?",
          [transaction_status === "cancel" ? "cancelled" : "expired", order_id]
        );
      }

      await connection.commit();
      return NextResponse.json({ message: "Notification processed" });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Payment notification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
