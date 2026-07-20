import type { EventStatus } from "@/types";

const labels: Record<EventStatus, string> = {
  open: "Open",
  closingSoon: "Sluit binnenkort",
  closed: "Gesloten",
  saved: "Opgeslagen",
};

export function StatusBadge({ status }: { status: EventStatus }) {
  return <span className={`status-badge status-badge--${status}`}>{labels[status]}</span>;
}
