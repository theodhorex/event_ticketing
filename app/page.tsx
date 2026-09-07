import Link from "next/link";
import { Header } from "@/components/ui/header-3";
import { CalendarIcon, TicketIcon, QrCodeIcon, BarChartIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h1 className="text-6xl font-semibold tracking-tight text-neutral-900 mb-6">
          Event Ticketing
          <br />
          Made Simple
        </h1>
        <p className="text-xl text-neutral-500 mb-10 max-w-xl mx-auto">
          Create events, sell tickets, and check-in attendees with QR codes.
          All in one platform built for organizers.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-lg font-medium px-8 py-3 rounded-full transition-all"
          >
            Get Started
          </Link>
          <Link
            href="/events"
            className="border border-neutral-300 hover:border-neutral-400 active:scale-95 text-neutral-700 text-lg font-medium px-8 py-3 rounded-full transition-all"
          >
            Browse Events
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-neutral-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-4xl font-semibold tracking-tight text-neutral-900 text-center mb-16">
            Everything you need
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Create Events
              </h3>
              <p className="text-sm text-neutral-500">
                Set up events with multiple ticket tiers, pricing, and quotas in minutes.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <TicketIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Sell Tickets
              </h3>
              <p className="text-sm text-neutral-500">
                Let buyers purchase tickets with secure checkout and instant confirmation.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <QrCodeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                QR Check-in
              </h3>
              <p className="text-sm text-neutral-500">
                Scan tickets at the door with QR codes. Prevent duplicates automatically.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BarChartIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Dashboard
              </h3>
              <p className="text-sm text-neutral-500">
                Track sales, check-in rates, and revenue in real-time from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-neutral-900 mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-neutral-500 mb-10">
            Join thousands of organizers using Event Ticketing.
          </p>
          <Link
            href="/register"
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-lg font-medium px-8 py-3 rounded-full transition-all"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <p className="text-center text-sm text-neutral-400">
            © 2026 Event Ticketing. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
