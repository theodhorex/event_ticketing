import { db } from "@/db";
import { orders, orderItems, tickets, ticketTiers, events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { CheckoutPaymentClient } from "./CheckoutPaymentClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getOrder(orderId: string, userId: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId));

  if (!order || order.buyerId !== userId) {
    return null;
  }

  const items = await db
    .select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      unitPriceInCents: orderItems.unitPriceInCents,
      subtotalInCents: orderItems.subtotalInCents,
      tierName: ticketTiers.name,
      tierId: ticketTiers.id,
      eventId: ticketTiers.eventId,
      eventTitle: events.title,
    })
    .from(orderItems)
    .innerJoin(ticketTiers, eq(orderItems.ticketTierId, ticketTiers.id))
    .innerJoin(events, eq(ticketTiers.eventId, events.id))
    .where(eq(orderItems.orderId, orderId));

  const orderTickets = await db
    .select({
      id: tickets.id,
      qrData: tickets.qrData,
    })
    .from(tickets)
    .where(eq(tickets.orderId, orderId));

  return { order, items, tickets: orderTickets };
}

export default async function CheckoutPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground">Please sign in to view your order.</p>
        </div>
      </div>
    );
  }

  const orderData = await getOrder(id, session.user.id);

  if (!orderData) {
    notFound();
  }

  const { order, items, tickets } = orderData;

  if (order.status === "paid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2">Payment Complete!</h1>
          <p className="text-muted-foreground mb-6">
            Your order has been confirmed. You can view your tickets in your dashboard.
          </p>
          <a href="/dashboard/tickets" className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
            View My Tickets
          </a>
        </div>
      </div>
    );
  }

  const isExpired = new Date(order.reservedUntil) < new Date();

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2">Reservation Expired</h1>
          <p className="text-muted-foreground mb-6">
            Your reservation has expired. Please try ordering again.
          </p>
          <a href="/events" className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
            Browse Events
          </a>
        </div>
      </div>
    );
  }

  const minutesLeft = Math.ceil((new Date(order.reservedUntil).getTime() - Date.now()) / 60000);

  return (
    <div className="min-h-screen bg-parchment">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-ink mb-2">Complete Your Payment</h1>
          <p className="text-muted-foreground">
            Order #{order.id.slice(0, 8)}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <div>
              <p className="text-sm text-muted-foreground">Time remaining</p>
              <p className="text-2xl font-semibold text-primary">{minutesLeft} min</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold">{formatCurrency(order.totalInCents)}</p>
            </div>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.tierName}</p>
                  <p className="text-sm text-muted-foreground">{item.eventTitle}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(item.subtotalInCents)}</p>
                  <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="font-semibold mb-4">Your Tickets ({tickets.length})</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tickets will be available after payment is confirmed.
          </p>

          <CheckoutPaymentClient
            orderId={order.id}
            snapToken=""
            tickets={tickets}
          />
        </div>
      </div>
    </div>
  );
}
