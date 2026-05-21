import type { DeviceLite } from "../../types";
import { VehicleCard } from "../../../../lib/design-system/components/VehicleCard";
import { Badge } from "../../../../lib/design-system/components/Badge";
import { Button } from "../../../../lib/design-system/components/Button";
import { Icon } from "../../../../lib/design-system/icons";

function normalizeStatus(status: unknown) {
  if (typeof status !== "string") return "unknown";
  const s = status.toLowerCase();
  if (s === "online" || s === "offline" || s === "unknown") return s;
  return "unknown";
}

function safeIsoString(v: unknown) {
  return typeof v === "string" && v.length > 10 ? v : null;
}

function formatDate(isoMaybe: string | null) {
  if (!isoMaybe) return "—";
  const d = new Date(isoMaybe);
  if (isNaN(d.getTime())) return "—";
  const pad = (n: number) => String(n).padStart(2, "0");
  const day = pad(d.getDate());
  const mon = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  let hours = d.getHours();
  const mins = pad(d.getMinutes());
  const ampm = hours >= 12 ? "p.m." : "a.m.";
  hours = hours % 12 || 12;
  return `${day}/${mon}/${year} ${pad(hours)}:${mins} ${ampm}`;
}

type EventInfo = { label: string; color: "success" | "error" | "warning" | "secondary"; accentColor: string };

function getEventInfo(device: DeviceLite, statusKey: string): EventInfo {
  const attrs: any = device.attributes ?? {};
  const alarm = attrs.alarm ?? attrs.lastAlarm;

  if (alarm && typeof alarm === "string") {
    const alarmMap: Record<string, EventInfo> = {
      sos: { label: "Botón de pánico", color: "error", accentColor: "var(--color-error-500, #d32f2f)" },
      panic: { label: "Botón de pánico", color: "error", accentColor: "var(--color-error-500, #d32f2f)" },
      overspeed: { label: "Exceso de velocidad", color: "error", accentColor: "var(--color-error-500, #d32f2f)" },
      powerCut: { label: "Desconexión de batería", color: "error", accentColor: "var(--color-error-500, #d32f2f)" },
      lowBattery: { label: "Batería baja", color: "warning", accentColor: "var(--color-warning-500)" },
      geofenceEnter: { label: "Entrada a geocerca", color: "secondary", accentColor: "var(--color-neutral-400)" },
      geofenceExit: { label: "Salida de geocerca", color: "secondary", accentColor: "var(--color-neutral-400)" },
      movement: { label: "En movimiento", color: "success", accentColor: "var(--color-success-500, #2e7d32)" },
    };
    if (alarmMap[alarm]) return alarmMap[alarm];
  }

  if (statusKey === "online") {
    return { label: "En movimiento", color: "success", accentColor: "var(--color-success-500, #2e7d32)" };
  }
  if (statusKey === "offline") {
    return { label: "Apagado", color: "secondary", accentColor: "var(--color-neutral-400)" };
  }
  return { label: "Desconocido", color: "secondary", accentColor: "var(--color-neutral-300)" };
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
  const attrs: any = device.attributes ?? {};
  const plate = typeof attrs.plate === "string" ? attrs.plate : "";
  const name = plate || device.name || device.uniqueId || `#${device.id}`;
  const statusKey = normalizeStatus((device as any).status);
  const eventInfo = getEventInfo(device, statusKey);

  const lastUpdate =
    safeIsoString((device as any)?.lastUpdate) ??
    safeIsoString(attrs.lastUpdate) ??
    safeIsoString(attrs.lastUpdateTime) ??
    null;
  const dateStr = formatDate(lastUpdate);

  const batteryVal = attrs.batteryLevel ?? attrs.battery;
  const batteryStr = batteryVal != null ? `${batteryVal} V` : "—";

  const sat = attrs.sat ?? attrs.satellites;
  const coverageVal = sat != null ? Number(sat) : null;
  const coverageLabel = coverageVal != null
    ? (coverageVal >= 5 ? "Buena" : coverageVal >= 3 ? "Regular" : "Débil")
    : "—";
  const coverageText = coverageVal != null ? `${coverageLabel} (${coverageVal})` : coverageLabel;
  const coverageColor: "success" | "warning" | "error" | undefined =
    coverageVal != null ? (coverageVal >= 5 ? "success" : coverageVal >= 3 ? "warning" : "error") : undefined;

  const dateRow = { icon: <Icon name="calendar" size={16} />, label: "Fecha", value: dateStr };
  const batteryRow = { icon: <Icon name="battery" size={16} />, label: "Batería", value: batteryStr };
  const coverageRow = {
    icon: <Icon name="signal" size={16} />,
    label: "Cobertura",
    value: <span style={coverageColor ? { color: coverageColor === "success" ? "var(--color-success-400, #66BB6A)" : coverageColor === "warning" ? "var(--color-warning-400, #FFA726)" : "var(--color-error-400, #EF5350)" } : undefined}>{coverageText}</span>,
  };

  const allInfoRows = [dateRow, batteryRow, coverageRow];
  const minInfoRows = [dateRow];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(); }}
      style={{ cursor: "pointer" }}
    >
      <VehicleCard
        variant="corporativo"
        name={name}
        selected={selected}
        accentColor={eventInfo.accentColor}
        statusBadge={
          <Badge color={eventInfo.color} shape="rounded">
            {eventInfo.label}
          </Badge>
        }
        infoRows={selected ? allInfoRows : minInfoRows}
        actions={
          <Button
            variant="link"
            size="sm"
            rightIcon={<Icon name="chevron-right" size={16} />}
            onClick={(e) => {
              e.stopPropagation();
              if (onShowDetail) onShowDetail();
            }}
          >
            Localizar
          </Button>
        }
      />
    </div>
  );
}
