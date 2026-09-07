import { db } from "@/db";
import { events, users, ticketTiers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { format, formatCurrency } from "@/lib/utils";
import { EventBookingClient } from "./EventBookingClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getEvent(eventId: string) {
  const [event] = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      location: events.location,
      startsAt: events.startsAt,
      endsAt: events.endsAt,
      organizerId: events.organizerId,
      organizerName: users.name,
    })
    .from(events)
    .innerJoin(users, eq(events.organizerId, users.id))
    .where(eq(events.id, eventId));

  return event;
}

async function getTicketTiers(eventId: string) {
  return db
    .select({
      id: ticketTiers.id,
      name: ticketTiers.name,
      description: ticketTiers.description,
      priceInCents: ticketTiers.priceInCents,
      quota: ticketTiers.quota,
      soldCount: ticketTiers.soldCount,
    })
    .from(ticketTiers)
    .where(eq(ticketTiers.eventId, eventId));
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  const tiers = await getTicketTiers(id);

  return (
    <div className="min-h-screen bg-parchment">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-ink mb-2">{event.title}</h1>
          <p className="text-muted-foreground">Organized by {event.organizerName}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">About This Event</h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-muted-foreground mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-muted-foreground mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-muted-foreground">
                      {format(event.startsAt, "EEEE, MMMM d, yyyy")}
                    </p>
                    <p className="text-muted-foreground">
                      {format(event.startsAt, "h:mm a")} - {format(event.endsAt, "h:mm a")}
                    </p>
                  </div>
                </div>
              </div>

              {event.description && (
                <div className="prose prose-sm max-w-none">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-foreground/70 whitespace-pre-wrap">{event.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-xl border bg-card p-6 shadow-sm sticky top-20">
              <h2 className="text-lg font-semibold mb-4">Select Tickets</h2>

              <EventBookingClient tiers={tiers} eventId={id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
