import { CalendarDays, Clock, MapPin } from "lucide-react";
import { eventTypeLabel, formatDate, formatTime } from "@/lib/thanwy";
import { cn } from "@/lib/utils";

export type EventRow = {
  id: string;
  title: string;
  type: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  status: string;
};

export function EventCard({
  event,
  onSelect,
}: {
  event: EventRow;
  onSelect?: (e: EventRow) => void;
}) {
  const cancelled = event.status === "cancelled";
  return (
    <button
      type="button"
      onClick={() => onSelect?.(event)}
      className={cn(
        "press min-w-[190px] shrink-0 overflow-hidden rounded-2xl border border-border bg-card text-right",
        cancelled && "opacity-60",
      )}
    >
      <div className={cn("h-1 w-full", cancelled ? "bg-primary" : "bg-secondary")} />
      <div className="space-y-2 p-4">
        <span
          className={cn(
            "inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium",
            cancelled
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground",
          )}
        >
          {cancelled ? "ملغى" : eventTypeLabel(event.type)}
        </span>
        <p className="text-sm font-semibold text-foreground">{event.title}</p>
        <p className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
          {formatDate(event.event_date)} <CalendarDays className="h-3.5 w-3.5" />
        </p>
        {event.start_time && (
          <p className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
            {formatTime(event.start_time)}
            {event.end_time ? ` – ${formatTime(event.end_time)}` : ""}
            <Clock className="h-3.5 w-3.5" />
          </p>
        )}
        {event.location && (
          <p className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
            {event.location} <MapPin className="h-3.5 w-3.5" />
          </p>
        )}
      </div>
    </button>
  );
}