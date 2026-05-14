import type { DeviceLite } from "../../types";

/* ── Chip icon components ── */
function IconPanic() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 1L1 11h10L6 1Z" />
      <path d="M6 5v2" />
      <circle cx="6" cy="9" r="0.5" fill="currentColor" />
    </svg>
  );
}

function IconSpeed() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 1a5 5 0 0 0-4.5 7" />
      <path d="M6 1a5 5 0 0 1 4.5 7" />
      <path d="M6 6l2-3" />
      <circle cx="6" cy="6" r="0.7" fill="currentColor" />
    </svg>
  );
}

function IconBattery() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="9" height="6" rx="1" />
      <path d="M11 5v2" />
      <path d="M3 5l2 2 3-3" />
    </svg>
  );
}

function IconGeofence() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="5" r="4" />
      <path d="M6 9v2" />
      <path d="M3 11h6" />
    </svg>
  );
}

function IconMovement() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 6h10" />
      <path d="M8 3l3 3-3 3" />
    </svg>
  );
}

function IconSignal() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 2l8 8" />
      <path d="M4 6a3 3 0 0 1 2-1" />
      <circle cx="6" cy="9" r="0.7" fill="currentColor" />
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
  const d = Math.floor(h / 24);
  return `Hace ${d} d`;
}

const ALARM_EVENT_MAP: Record<string, { label: string; icon: () => JSX.Element }> = {
  sos: { label: "Botón de pánico", icon: IconPanic },
  panic: { label: "Botón de pánico", icon: IconPanic },
  overspeed: { label: "Exceso de velocidad", icon: IconSpeed },
  powerCut: { label: "Desconexión de batería", icon: IconBattery },
  lowBattery: { label: "Batería baja", icon: IconBattery },
  geofenceEnter: { label: "Entrada a geocerca", icon: IconGeofence },
  geofenceExit: { label: "Salida de geocerca", icon: IconGeofence },
  movement: { label: "En movimiento", icon: IconMovement },
};

function getEventInfo(device: DeviceLite, statusKey: string) {
  const attrs: any = device.attributes ?? {};
  const alarm = attrs.alarm ?? attrs.lastAlarm;

  if (alarm && typeof alarm === "string" && ALARM_EVENT_MAP[alarm]) {
    const ev = ALARM_EVENT_MAP[alarm];
    return { label: ev.label, Icon: ev.icon, chip: "scada-chip--danger" };
  }

  if (statusKey === "online") {
    return { label: "En movimiento", Icon: IconMovement, chip: "scada-chip--success" };
  }
  if (statusKey === "offline") {
    return { label: "Sin señal", Icon: IconSignal, chip: "scada-chip--muted" };
  }
  return { label: "Sin señal", Icon: IconSignal, chip: "scada-chip--muted" };
}

export function DeviceRow({
  device,
  selected,
  onSelect,
}: Readonly<{
  device: DeviceLite;
  selected: boolean;
  onSelect: () => void;
}>) {
  const plate = typeof device.attributes?.plate === "string" ? device.attributes.plate : "";
  const name = plate || device.name || device.uniqueId || `#${device.id}`;
  const statusKey = normalizeStatus((device as any).status);

  let ui: {
    barClass: string;
    statusClass: string;
    statusLabel: string;
  };
  if (statusKey === "online") {
    ui = {
      barClass: "bg-success",
      statusClass: "text-success",
      statusLabel: "Estado en ruta",
    };
  } else if (statusKey === "offline") {
    ui = {
      barClass: "bg-error",
      statusClass: "text-error",
      statusLabel: "Estado alarmado",
    };
  } else {
    ui = {
      barClass: "bg-[color:color-mix(in_oklab,var(--color-text-muted)_55%,transparent)]",
      statusClass: "text-text-muted",
      statusLabel: "Estado desconocido",
    };
  }

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
        selected ? "border-[color-mix(in_oklab,var(--color-primary)_55%,var(--color-border-subtle))] shadow-sm" : "",
      ].join(" ")}
    >
      <span
        className={[
          "absolute left-2 top-3 bottom-3 w-1 rounded-full",
          ui.barClass,
        ].join(" ")}
        aria-hidden="true"
      />

      <div className="scada-device-card__top pl-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="scada-device-card__title truncate">{name}</div>
            </div>
            <div className={["scada-device-card__status shrink-0", ui.statusClass].join(" ")}>
              {ui.statusLabel}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className={["scada-chip", eventInfo.chip].join(" ")}>
              <eventInfo.Icon />
              <span>{eventInfo.label}</span>
            </div>
            <div className="scada-device-card__time">{ago ?? "—"}</div>
          </div>
        </div>
      </div>
    </button>
  );
}
