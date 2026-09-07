"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Ticket = {
  id: string;
  qrData: string;
};

type Props = {
  orderId: string;
  snapToken: string;
  tickets: Ticket[];
};

export function CheckoutPaymentClient({ orderId, snapToken, tickets }: Props) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayNow = async () => {
    setIsProcessing(true);

    try {
      const res = await fetch(`/api/payment?orderId=${orderId}`);
      const data = await res.json();

      if (data.snapToken && !data.snapToken.startsWith("mock-")) {
        window.location.href = `https://app.sandbox.midtrans.com/snap/v2/vtweb/v2?token=${data.snapToken}`;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        router.push(`/dashboard/orders?success=true&orderId=${orderId}`);
      }
    } catch {
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulatePayment = async () => {
    setIsProcessing(true);

    try {
      const res = await fetch("/api/payment/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: "paid" }),
      });

      if (res.ok) {
        router.push(`/dashboard/orders?success=true&orderId=${orderId}`);
      }
    } catch {
      alert("Simulation failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        className="w-full"
        size="lg"
        onClick={handlePayNow}
        disabled={isProcessing}
      >
        {isProcessing ? "Processing..." : "Pay Now with Midtrans"}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleSimulatePayment}
        disabled={isProcessing}
      >
        Simulate Payment (Dev Only)
      </Button>
    </div>
  );
}
