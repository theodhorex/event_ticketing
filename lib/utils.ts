import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function format(date: Date | string, formatStr: string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const pad = (n: number) => n.toString().padStart(2, "0");

  const hour12 = d.getHours() % 12 || 12;
  const ampm = d.getHours() >= 12 ? "PM" : "AM";

  let result = formatStr;
  result = result.replace("MMMM", months[d.getMonth()]);
  result = result.replace("MM", pad(d.getMonth() + 1));
  result = result.replace("yyyy", d.getFullYear().toString());
  result = result.replace("yy", d.getFullYear().toString().slice(-2));
  result = result.replace("dd", pad(d.getDate()));
  result = result.replace("d", d.getDate().toString());
  result = result.replace("HH", pad(d.getHours()));
  result = result.replace("h", hour12.toString());
  result = result.replace("mm", pad(d.getMinutes()));
  result = result.replace("a", ampm);
  return result;
}

export function formatCurrency(cents: number): string {
  return `Rp ${(cents / 100).toLocaleString("id-ID", { minimumFractionDigits: 0 })}`;
}
