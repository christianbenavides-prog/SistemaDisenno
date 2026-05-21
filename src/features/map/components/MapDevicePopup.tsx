import { useState, useMemo } from "react";
import { Tab } from "../../../lib/design-system/components/Tab";
import { Badge } from "../../../lib/design-system/components/Badge";
import { Button } from "../../../lib/design-system/components/Button";
import { Icon } from "../../../lib/design-system/icons";
import type { DeviceLite, PositionLite } from "../types";
import "./MapDevicePopup.css";

type TabKey = "avl" | "vehiculo";

function safeStr(v: unknown): string {
  return typeof v === "string" && v.trim() ? v.trim() : "—";
}

function safeNum(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function formatDate(isoMaybe: unknown): string {
  if (typeof isoMaybe !== "string") return "—";
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

function formatDMS(decimal: number, isLat: boolean): string {
  const abs = Math.abs(decimal);
  const deg = Math.floor(abs);
  const minFull = (abs - deg) * 60;
  const min = Math.floor(minFull);
  const sec = ((minFull - min) * 60).toFixed(1);
  const dir = isLat ? (decimal >= 0 ? "N" : "S") : (decimal >= 0 ? "E" : "W");
  return `${deg}°${String(min).padStart(2, "0")}'${sec}"${dir}`;
}

export function MapDevicePopup({
  device,
  position,
  onClose,
  onViewDetails,
}: Readonly<{
  device: DeviceLite;
  position: PositionLite | null;
  onClose: () => void;
  onViewDetails: () => void;
}>) {
  const [activeTab, setActiveTab] = useState<TabKey>("avl");

  const view = useMemo(() => {
    const attrs: Record<string, unknown> = (device.attributes ?? {}) as Record<string, unknown>;
    const pAttrs: Record<string, unknown> = (position?.attributes ?? {}) as Record<string, unknown>;

    const imei = safeStr(device.uniqueId);
    const plate = safeStr(attrs.plate);
    const fixTime = position?.fixTime ?? null;
    const dateStr = formatDate(fixTime);

    const lat = safeNum(position?.latitude);
    const lng = safeNum(position?.longitude);
    const latStr = lat != null ? formatDMS(lat, true) : "—";
    const lngStr = lng != null ? formatDMS(lng, false) : "—";

    const speed = safeNum(position?.speed);
    const speedStr = speed != null ? `${speed.toFixed(0)} km/h` : "—";

    const moving = Boolean(pAttrs.motion) || (speed ?? 0) > 0.5;
    const eventLabel = moving ? "En movimiento" : "Detenido";
    const eventColor = moving ? "success" : "warning";

    const address = safeStr(pAttrs.address) || safeStr(pAttrs.formattedAddress) || "—";
    const odometer = safeNum(pAttrs.totalDistance) ?? safeNum(pAttrs.odometer);
    const odometerStr = odometer != null ? `${(odometer / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} km` : "—";

    const sat = safeNum(pAttrs.sat) ?? safeNum(pAttrs.satellites);
    const coverageVal = sat != null ? sat : null;
    const coverageLabel = coverageVal != null
      ? (coverageVal >= 5 ? "Buena" : coverageVal >= 3 ? "Regular" : "Débil")
      : "—";
    const coverageColor = coverageVal != null
      ? (coverageVal >= 5 ? "var(--color-success-700, #18631d)" : coverageVal >= 3 ? "var(--color-warning-700)" : "var(--color-error-700)")
      : undefined;
    const coverageText = coverageVal != null ? `${coverageLabel} (${coverageVal})` : coverageLabel;

    const vin = safeStr(attrs.vin);
    const brand = safeStr(attrs.brand) || safeStr(attrs.make);
    const line = safeStr(attrs.line) || safeStr(attrs.vehicleLine);
    const model = safeStr(attrs.model) || safeStr(attrs.deviceModel);
    const company = safeStr(attrs.company) || safeStr(attrs.companyName);
    const client = safeStr(attrs.client) || safeStr(attrs.contact) || safeStr(attrs.driver);

    const mapsQuery = lat != null && lng != null ? `${lat},${lng}` : null;

    return {
      imei, plate, dateStr, latStr, lngStr, speedStr,
      eventLabel, eventColor: eventColor as "success" | "warning",
      address, odometerStr, coverageText, coverageColor,
      vin, brand, line, model, company, client, mapsQuery,
    };
  }, [device, position]);

  const avlRows = [
    { label: "Placa", value: view.plate },
    { label: "Velocidad", value: view.speedStr },
    { label: "Ubicación", value: view.address },
    { label: "Latitud", value: view.latStr },
    { label: "Longitud", value: view.lngStr },
    { label: "Odómetro", value: view.odometerStr },
  ];

  const vehiculoRows = [
    { label: "VIN", value: view.vin },
    { label: "Marca", value: view.brand },
    { label: "Línea", value: view.line },
    { label: "Modelo", value: view.model },
    { label: "Compañía", value: view.company },
    { label: "Cliente", value: view.client },
  ];

  const rows = activeTab === "avl" ? avlRows : vehiculoRows;

  return (
    <div className="map-device-popup">
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button type="button" className="map-device-popup__close" onClick={onClose}>
          <span>Cerrar</span>
          <Icon name="x" size={20} />
        </button>

        <div className="map-device-popup__title">{view.imei}</div>

        <div className="map-device-popup__meta">
          <div className="map-device-popup__date">
            <span className="map-device-popup__date-value">{view.dateStr}</span>
            <span className="map-device-popup__date-label">Última actualización</span>
          </div>
          {view.mapsQuery && (
            <a
              className="map-device-popup__maps-link"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(view.mapsQuery)}`}
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="eye" size={20} />
              <span>Ver mapas</span>
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="map-device-popup__tabs">
        <Tab
          tabState={activeTab === "avl" ? "selected" : "enable"}
          onClick={() => setActiveTab("avl")}
        >
          AVL
        </Tab>
        <Tab
          tabState={activeTab === "vehiculo" ? "selected" : "enable"}
          onClick={() => setActiveTab("vehiculo")}
        >
          Vehículo
        </Tab>
      </div>

      {/* Info rows */}
      <div className="map-device-popup__rows">
        {activeTab === "avl" && (
          <div className="map-device-popup__row">
            <span className="map-device-popup__row-label">Evento</span>
            <Badge color={view.eventColor} shape="rounded">
              {view.eventLabel}
            </Badge>
          </div>
        )}
        {rows.map((row) => (
          <div key={row.label} className="map-device-popup__row">
            <span className="map-device-popup__row-label">{row.label}</span>
            <span className="map-device-popup__row-value">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Coverage */}
      {activeTab === "avl" && (
        <div className="map-device-popup__coverage">
          <span className="map-device-popup__coverage-icon">
            <Icon name="signal" size={16} />
          </span>
          <span className="map-device-popup__coverage-label">Cobertura</span>
          <span
            className="map-device-popup__coverage-value"
            style={view.coverageColor ? { color: view.coverageColor } : undefined}
          >
            {view.coverageText}
          </span>
        </div>
      )}

      {/* Ver detalles button */}
      <Button variant="principal" size="md" className="w-full" onClick={onViewDetails}>
        Ver detalles
      </Button>
    </div>
  );
}
