import crypto from "crypto";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || "";
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";
const MIDTRANS_BASE_URL = MIDTRANS_IS_PRODUCTION
  ? "https://api.midtrans.com"
  : "https://api.sandbox.midtrans.com";

function getAuthString(): string {
  return Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64");
}

export type SnapTransaction = {
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_status: string;
  transaction_time: string;
};

export type SnapTokenRequest = {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  customer_details?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
  item_details?: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
  callbacks?: {
    finish?: string;
  };
};

export async function createSnapToken(request: SnapTokenRequest): Promise<string> {
  const response = await fetch(`${MIDTRANS_BASE_URL}/v2/snap/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${getAuthString()}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Midtrans API error: ${error}`);
  }

  const data = await response.json();
  return data.token as string;
}

export async function getTransactionStatus(orderId: string): Promise<SnapTransaction> {
  const response = await fetch(`${MIDTRANS_BASE_URL}/v2/${orderId}/status`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${getAuthString()}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Midtrans API error: ${error}`);
  }

  return response.json();
}

export function verifyNotification(notification: Record<string, unknown>): boolean {
  const signatureKey = notification.signature_key as string;
  if (!signatureKey) return false;

  const orderId = notification.order_id as string;
  const statusCode = notification.status_code as string;
  const grossAmount = notification.gross_amount as string;

  if (!orderId || !statusCode || !grossAmount) return false;

  const input = `${orderId}${statusCode}${grossAmount}${MIDTRANS_SERVER_KEY}`;
  const expectedSignature = crypto.createHash("sha512").update(input).digest("hex");

  return signatureKey === expectedSignature;
}

export { MIDTRANS_CLIENT_KEY, MIDTRANS_IS_PRODUCTION, MIDTRANS_BASE_URL };
