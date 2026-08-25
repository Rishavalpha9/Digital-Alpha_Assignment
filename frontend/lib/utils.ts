import { DISPLAY_TIMEZONE } from "./constants";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatINR(value: number | string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(value));
}

export function formatCoins(value: number | string) {
  return new Intl.NumberFormat("en-IN").format(Number(value));
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: DISPLAY_TIMEZONE,
  }).format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: DISPLAY_TIMEZONE,
    timeZoneName: "short",
  }).format(new Date(iso));
}

export function formatMonthLabel(month: string) {
  const [year, monthPart] = month.split("-");
  const date = new Date(Date.UTC(Number(year), Number(monthPart) - 1, 1));
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function categoryLabel(category: string | null | undefined) {
  return category?.trim() ? category : "Uncategorized";
}

export function monthDateRange(month: string) {
  const [year, monthPart] = month.split("-").map(Number);
  const lastDay = new Date(year, monthPart, 0).getDate();
  const pad = (value: number) => String(value).padStart(2, "0");
  return {
    from_date: `${year}-${pad(monthPart)}-01`,
    to_date: `${year}-${pad(monthPart)}-${pad(lastDay)}`,
  };
}
