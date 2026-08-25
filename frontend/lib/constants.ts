export const DISPLAY_TIMEZONE = "Asia/Kolkata";
export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;
export const SEARCH_DEBOUNCE_MS = 400;

export const UNCATEGORIZED = "Uncategorized";

export const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "SUCCESS", label: "Success" },
  { value: "FAILED", label: "Failed" },
  { value: "PENDING", label: "Pending" },
] as const;
