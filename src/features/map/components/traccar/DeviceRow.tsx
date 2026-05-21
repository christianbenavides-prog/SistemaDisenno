import type { ReactNode } from "react";
import type { DeviceLite } from "../../types";
import { Badge } from "../../../../lib/design-system/components/Badge";
import { Button } from "../../../../lib/design-system/components/Button";

function IconMovement() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 6h10" /><path d="M8 3l3 3-3 3" />
    </svg>
  );
}

function IconSignal() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 2l8 8" /><path d="M4 6a3 3 0 0 1 2-1" /><circle cx="6" cy="9" r="0.7" fill="currentColor" />
    </svg>
  );
}

function IconPanic() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 1L1 11h10L6 1Z" /><path d="M6 5v2" /><circle cx="6" cy="9" r="0.5" fill="currentColor" />
    </svg>
  );
}

function IconSpeed() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 1a5 5 0 0 0-4.5 7" /><path d="M6 1a5 5 0 0 1 4.5 7" /><path d="M6 6l2-3" /><circle cx="6" cy="6" r="0.7" fill="currentColor" />
    </svg>
  );
}

function IconBattery() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="9" height="6" rx="1" /><path d="M11 5v2" /><path d="M3 5l2 2 3-3" />
    </svg>
  );
}

function IconGeofence() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="5" r="4" /><path d="M6 9v2" /><path d="M3 11h6" />
    </svg>
  );
}

function normalizeStatus(status: unknown) {
  if (typeof status !== "string") return "unknown";
  const s = status.toLowerCase();
  if (s === "online" || s === "offline" || s === "unknown") return s;
  return "unknown";
}

function safeIsoString(v: unknown) {
  return typeof v === "string" && v.length > 10 ? v : null;
}

function formatAgo(isoMaybe: string | null) {
  if (!isoMaybe) return null;
  const ms = Date.parse(isoMaybe);
  if (!Number.isFinite(ms)) return null;
  const diff = Date.now() - ms;
  if (!Number.isFinite(diff) || diff < 0) return null;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Hace < 1 min";
  if (min < 60) return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Hace ${h} h`;
  return `Hace ${Math.floor(h / 24)} d`;
}

type EventColor = "error" | "warning" | "success" | "secondary";

const ALARM_EVENT_MAP: Record<string, { label: string; icon: () => ReactNode; color: EventColor }> = {
  sos:           { label: "Botón de pánico",        icon: IconPanic,    color: "error" },
  panic:         { label: "Botón de pánico",        icon: IconPanic,    color: "error" },
  overspeed:     { label: "Exceso de velocidad",    icon: IconSpeed,    color: "error" },
  powerCut:      { label: "Desconexión de batería", icon: IconBattery,  color: "error" },
  lowBattery:    { label: "Batería baja",           icon: IconBattery,  color: "warning" },
  geofenceEnter: { label: "Entrada a geocerca",     icon: IconGeofence, color: "secondary" },
  geofenceExit:  { label: "Salida de geocerca",     icon: IconGeofence, color: "secondary" },
  movement:      { label: "En movimiento",          icon: IconMovement, color: "success" },
};

function getEventInfo(device: DeviceLite, statusKey: string): { label: string; Icon: () => ReactNode; color: EventColor } {
  const attrs: any = device.attributes ?? {};
  const alarm = attrs.alarm ?? attrs.lastAlarm;
  if (alarm && typeof alarm === "string" && ALARM_EVENT_MAP[alarm]) {
    const ev = ALARM_EVENT_MAP[alarm];
    return { label: ev.label, Icon: ev.icon, color: ev.color };
  }
  if (statusKey === "online") {
    return { label: "En movimiento", Icon: IconMovement, color: "success" };
  }
  return { label: "Sin señal", Icon: IconSignal, color: "secondary" };
}

export function DeviceRow({
  device,
  selected,
  onSelect,
  onShowDetail,
}: Readonly<{
  device: DeviceLite;
  selected: boolean;
  onSelect: () => void;
  onShowDetail?: () => void;
}>) {
  const plate = typeof device.attributes?.plate === "string" ? device.attributes.plate : "";
  const name = plate || device.name || device.uniqueId || `#${device.id}`;
  const statusKey = normalizeStatus((device as any).status);
  const statusBadgeColor = statusKey === "online" ? "success" : statusKey === "offline" ? "error" : "secondary";
  const statusLabel = statusKey === "online" ? "En ruta" : statusKey === "offline" ? "Sin señal" : "Desconocido";

  const eventInfo = getEventInfo(device, statusKey);

  const lastUpdate =
    safeIsoString((device as any)?.lastUpdate) ??
    safeIsoString((device as any)?.attributes?.lastUpdate) ??
    safeIsoString((device as any)?.attributes?.lastUpdateTime) ??
    null;
  const ago = formatAgo(lastUpdate);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "scada-device-card w-full text-left relative transition",
        selected ? "scada-device-card--selected" : "",
      ].join(" ")}
    >
      <div className="scada-device-card__top">
        <div className="min-w-0 flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="scada-device-card__title truncate">{name}</span>
            <Badge color={statusBadgeColor} shape="rounded" className="shrink-0 text-[10px]">
              {statusLabel}
            </Badge>
          </div>

          <div className="flex items-center justify-between gap-2">
            <Badge color={eventInfo.color} shape="rounded" icon={<eventInfo.Icon />}>
              {eventInfo.label}
            </Badge>
            <span className="scada-device-card__time shrink-0">{ago ?? "—"}</span>
          </div>
        </div>
      </div>

      {selected && onShowDetail && (
        <div className="mt-3 pt-2 border-t border-border-subtle">
          <Button
            type="button"
            variant="principal"
            size="sm"
            className="w-full"
            onClick={(e) => { e.stopPropagation(); onShowDetail(); }}
          >
            Ver detalles
          </Button>
        </div>
      )}
    </button>
  );
}
