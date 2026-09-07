"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Header } from "@/components/ui/header-3";
import { CalendarIcon, TicketIcon, QrCodeIcon, ShoppingBagIcon } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <p className="text-neutral-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <p className="text-neutral-500">Please sign in to view your dashboard.</p>
      </div>
    );
  }

  const user = session.user as { name?: string; email?: string; role?: string };
  const isOrganizer = user.role === "organizer";

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-5xl font-semibold tracking-tight text-neutral-900 mb-2">
            Welcome back, {user.name || (isOrganizer ? "Organizer" : "Guest")}
          </h2>
          <p className="text-lg text-neutral-500">
            {isOrganizer
              ? "Manage your events and track ticket sales."
              : "Your tickets and purchase history."}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {isOrganizer ? (
            <>
              <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <p className="text-sm font-medium text-neutral-500 mb-1">Total Events</p>
                <p className="text-4xl font-semibold tracking-tight text-neutral-900">0</p>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <p className="text-sm font-medium text-neutral-500 mb-1">Tickets Sold</p>
                <p className="text-4xl font-semibold tracking-tight text-neutral-900">0</p>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <p className="text-sm font-medium text-neutral-500 mb-1">Total Revenue</p>
                <p className="text-4xl font-semibold tracking-tight text-neutral-900">$0</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <p className="text-sm font-medium text-neutral-500 mb-1">Upcoming Events</p>
                <p className="text-4xl font-semibold tracking-tight text-neutral-900">0</p>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <p className="text-sm font-medium text-neutral-500 mb-1">Tickets Owned</p>
                <p className="text-4xl font-semibold tracking-tight text-neutral-900">0</p>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <p className="text-sm font-medium text-neutral-500 mb-1">Events Attended</p>
                <p className="text-4xl font-semibold tracking-tight text-neutral-900">0</p>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isOrganizer ? (
              <>
                <Link
                  href="/dashboard/events/new"
                  className="bg-white border border-neutral-200 rounded-xl p-6 hover:border-blue-600 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-neutral-900 mb-1 group-hover:text-blue-600 transition-colors">
                        Create New Event
                      </h4>
                      <p className="text-sm text-neutral-500">
                        Set up a new event with ticket tiers and pricing.
                      </p>
                    </div>
                    <span className="text-blue-600 text-xl">+</span>
                  </div>
                </Link>

                <Link
                  href="/dashboard/events"
                  className="bg-white border border-neutral-200 rounded-xl p-6 hover:border-blue-600 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-neutral-900 mb-1 group-hover:text-blue-600 transition-colors">
                        Manage Events
                      </h4>
                      <p className="text-sm text-neutral-500">
                        View and edit your existing events.
                      </p>
                    </div>
                    <span className="text-blue-600 text-xl">→</span>
                  </div>
                </Link>

                <Link
                  href="/dashboard/checkin"
                  className="bg-white border border-neutral-200 rounded-xl p-6 hover:border-blue-600 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-neutral-900 mb-1 group-hover:text-blue-600 transition-colors">
                        Check-in Scanner
                      </h4>
                      <p className="text-sm text-neutral-500">
                        Scan QR codes to validate tickets.
                      </p>
                    </div>
                    <QrCodeIcon className="text-blue-600 h-5 w-5" />
                  </div>
                </Link>

                <Link
                  href="/dashboard/orders"
                  className="bg-white border border-neutral-200 rounded-xl p-6 hover:border-blue-600 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-neutral-900 mb-1 group-hover:text-blue-600 transition-colors">
                        Order History
                      </h4>
                      <p className="text-sm text-neutral-500">
                        View all ticket orders and payments.
                      </p>
                    </div>
                    <span className="text-blue-600 text-xl">≡</span>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/events"
                  className="bg-white border border-neutral-200 rounded-xl p-6 hover:border-blue-600 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-neutral-900 mb-1 group-hover:text-blue-600 transition-colors">
                        Browse Events
                      </h4>
                      <p className="text-sm text-neutral-500">
                        Find and purchase tickets for upcoming events.
                      </p>
                    </div>
                    <CalendarIcon className="text-blue-600 h-5 w-5" />
                  </div>
                </Link>

                <Link
                  href="/dashboard/tickets"
                  className="bg-white border border-neutral-200 rounded-xl p-6 hover:border-blue-600 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-neutral-900 mb-1 group-hover:text-blue-600 transition-colors">
                        My Tickets
                      </h4>
                      <p className="text-sm text-neutral-500">
                        View your purchased tickets with QR codes.
                      </p>
                    </div>
                    <TicketIcon className="text-blue-600 h-5 w-5" />
                  </div>
                </Link>

                <Link
                  href="/dashboard/orders"
                  className="bg-white border border-neutral-200 rounded-xl p-6 hover:border-blue-600 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-neutral-900 mb-1 group-hover:text-blue-600 transition-colors">
                        Order History
                      </h4>
                      <p className="text-sm text-neutral-500">
                        View your past purchases and receipts.
                      </p>
                    </div>
                    <ShoppingBagIcon className="text-blue-600 h-5 w-5" />
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-6">
            {isOrganizer ? "Recent Events" : "Your Tickets"}
          </h3>

          <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
            <p className="text-neutral-500 mb-4">
              {isOrganizer ? "No events yet" : "No tickets yet"}
            </p>
            {isOrganizer ? (
              <Link
                href="/dashboard/events/new"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all"
              >
                Create Your First Event
              </Link>
            ) : (
              <Link
                href="/events"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all"
              >
                Browse Events
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-xs text-neutral-400">
            © 2026 Event Ticketing. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
