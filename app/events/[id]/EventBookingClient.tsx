"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

type TicketTier = {
  id: string;
  name: string;
  description: string | null;
  priceInCents: number;
  quota: number;
  soldCount: number;
};

type Props = {
  tiers: TicketTier[];
  eventId: string;
};

export function EventBookingClient({ tiers, eventId }: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const totalAmount = Object.entries(quantities).reduce((sum, [tierId, qty]) => {
    const tier = tiers.find((t) => t.id === tierId);
    return sum + (tier?.priceInCents || 0) * qty;
  }, 0);

  const totalTickets = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

  const handleQuantityChange = (tierId: string, delta: number) => {
    const tier = tiers.find((t) => t.id === tierId);
    if (!tier) return;

    const available = tier.quota - tier.soldCount;
    const current = quantities[tierId] || 0;
    const newQty = Math.max(0, Math.min(current + delta, available));

    setQuantities((prev) => ({
      ...prev,
      [tierId]: newQty,
    }));
  };

  const handleCheckout = async () => {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=/events/${eventId}`);
      return;
    }

    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([tierId, quantity]) => ({ ticketTierId: tierId, quantity }));

    if (items.length === 0) {
      setError("Please select at least one ticket");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      localStorage.setItem("pendingOrder", JSON.stringify(data));

      if (data.snapToken && !data.snapToken.startsWith("mock-")) {
        const midtransUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/v2?token=${data.snapToken}`;
        window.location.href = midtransUrl;
      } else {
        router.push(`/checkout/${data.orderId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (tiers.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No tickets available for this event.</p>
    );
  }

  return (
    <div className="space-y-4">
      {tiers.map((tier) => {
        const available = tier.quota - tier.soldCount;
        const qty = quantities[tier.id] || 0;

        return (
          <div key={tier.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">{tier.name}</h3>
                {tier.description && (
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                )}
              </div>
              <p className="font-semibold text-primary">
                {formatCurrency(tier.priceInCents)}
              </p>
            </div>

            <div className="flex items-center justify-between mt-3">
              <p className="text-sm text-muted-foreground">
                {available > 0 ? `${available} available` : "Sold out"}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleQuantityChange(tier.id, -1)}
                  disabled={qty === 0 || available === 0}
                >
                  -
                </Button>
                <span className="w-8 text-center font-medium">{qty}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleQuantityChange(tier.id, 1)}
                  disabled={qty >= available || available === 0}
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      {totalTickets > 0 && (
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-muted-foreground">Total</span>
            <span className="text-xl font-semibold">{formatCurrency(totalAmount)}</span>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleCheckout}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : `Checkout ${totalTickets} Ticket${totalTickets > 1 ? "s" : ""}`}
          </Button>
        </div>
      )}

      {status === "unauthenticated" && totalTickets === 0 && (
        <Button
          className="w-full"
          onClick={() => router.push(`/login?callbackUrl=/events/${eventId}`)}
        >
          Sign In to Book
        </Button>
      )}
    </div>
  );
}
