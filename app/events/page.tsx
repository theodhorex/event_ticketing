import { db } from "@/db";
import { events, users, ticketTiers } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import Link from "next/link";
import { format } from "@/lib/utils";

async function getEvents() {
  const allEvents = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      location: events.location,
      startsAt: events.startsAt,
      endsAt: events.endsAt,
      isPublished: events.isPublished,
      organizerName: users.name,
    })
    .from(events)
    .innerJoin(users, eq(events.organizerId, users.id))
    .where(eq(events.isPublished, 1))
    .orderBy(desc(events.startsAt));

  return allEvents;
}

async function getEventTicketTiers(eventId: string) {
  const tiers = await db
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

  return tiers;
}

export default async function EventsPage() {
  const allEvents = await getEvents();

  return (
    <div className="min-h-screen bg-parchment">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-ink mb-2">Browse Events</h1>
          <p className="text-foreground/60">Find and book tickets for upcoming events</p>
        </div>

        {allEvents.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No events available yet.</p>
            <p className="text-muted-foreground/60 mt-2">Check back soon for upcoming events.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allEvents.map(async (event) => {
              const tiers = await getEventTicketTiers(event.id);
              const minPrice = tiers.length > 0
                ? Math.min(...tiers.map((t) => t.priceInCents))
                : 0;

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group block rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
                >
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {event.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">by {event.organizerName}</p>
                  </div>

                  {event.description && (
                    <p className="text-sm text-foreground/70 line-clamp-2 mb-4">
                      {event.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-foreground/60">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{event.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-foreground/60">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{format(event.startsAt, "MMMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                  </div>

                  {tiers.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">From</p>
                      <p className="text-xl font-semibold text-primary">
                        Rp {minPrice.toLocaleString("id-ID")}
                      </p>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
