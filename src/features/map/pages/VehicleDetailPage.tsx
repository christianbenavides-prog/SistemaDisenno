import { useState, useMemo, useCallback } from "react";
import { Button } from "../../../lib/design-system/components/Button";
import { Input } from "../../../lib/design-system/components/Input";
import { Icon } from "../../../lib/design-system/icons";
import { useScada } from "../../../app/remote/ScadaProvider";
import type { DeviceLite, PositionLite } from "../types";
import "./VehicleDetailPage.css";

function safeStr(v: unknown): string {
  return typeof v === "string" && v.trim() ? v.trim() : "—";
}

function safeNum(v: unknown): string {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? String(n) : "—";
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
  const secs = pad(d.getSeconds());
  const ampm = hours >= 12 ? "P.M." : "A.M.";
  hours = hours % 12 || 12;
  return `${day}/${mon}/${year} ${pad(hours)}:${mins}:${secs} ${ampm}`;
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: Readonly<{
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}>) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="vehicle-detail__collapsible">
      <div className="vehicle-detail__collapsible-header">
        <span className="vehicle-detail__collapsible-title">{title}</span>
        <button
          type="button"
          className={`vehicle-detail__collapsible-toggle${!open ? " vehicle-detail__collapsible-toggle--collapsed" : ""}`}
          onClick={() => setOpen(!open)}
          aria-label={open ? "Colapsar" : "Expandir"}
        >
          <Icon name="chevron-up" size={20} />
        </button>
      </div>
      {open && children}
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return <Input label={label} value={value} readOnly />;
}

export function VehicleDetailPage({
  deviceId,
  onBack,
}: Readonly<{
  deviceId: number;
  onBack: () => void;
}>) {
  const { config } = useScada();
  const devicesById = (config.devicesById ?? {}) as unknown as Record<string, DeviceLite>;
  const rawPositions = config.positions as unknown;

  const positions = useMemo<PositionLite[]>(() => {
    if (!rawPositions) return [];
    if (Array.isArray(rawPositions)) return rawPositions;
    if (rawPositions instanceof Map) return Array.from(rawPositions.values());
    if (typeof rawPositions === "object") return Object.values(rawPositions as Record<string, PositionLite>);
    return [];
  }, [rawPositions]);

  const device = devicesById[String(deviceId)] ?? null;
  const position = useMemo(
    () => positions.find((p) => Number(p.deviceId) === deviceId) ?? null,
    [positions, deviceId],
  );

  const attrs = useMemo<Record<string, unknown>>(
    () => ((device?.attributes ?? {}) as Record<string, unknown>),
    [device],
  );
  const pAttrs = useMemo<Record<string, unknown>>(
    () => ((position?.attributes ?? {}) as Record<string, unknown>),
    [position],
  );

  const handleBack = useCallback(() => onBack(), [onBack]);

  if (!device) {
    return (
      <div className="vehicle-detail">
        <div className="vehicle-detail__header">
          <Button variant="secundario" size="sm" leftIcon={<Icon name="chevron-left" size={16} />} onClick={handleBack} />
          <div className="vehicle-detail__header-info">
            <span className="vehicle-detail__title">Dispositivo no encontrado</span>
          </div>
        </div>
      </div>
    );
  }

  const plate = safeStr(attrs.plate);
  const modelVeh = safeStr(attrs.model) || safeStr(attrs.deviceModel);
  const imei = safeStr(device.uniqueId);
  const company = safeStr(attrs.company) || safeStr(attrs.companyName);
  const contact = safeStr(attrs.contact) || safeStr(attrs.driver);
  const phone = safeStr(attrs.phone) || safeStr(attrs.telephone);
  const email = safeStr(attrs.email);
  const category = safeStr(device.category);
  const status = safeStr(device.status);
  const lastUpdate = formatDate(position?.fixTime ?? (device as any)?.lastUpdate);

  const iccid = safeStr(pAttrs.iccid);
  const manufacturer = safeStr(pAttrs.manufacturer) || safeStr(attrs.manufacturer);
  const analogInput1 = safeNum(pAttrs.adc1) || safeNum(pAttrs.analogInput1);
  const btState = safeNum(pAttrs.bleTemp1) || safeNum(pAttrs.btState);
  const gnssState = safeNum(pAttrs.gnssState) || safeNum(pAttrs.gpsStatus);
  const hdop = safeNum(pAttrs.hdop);
  const pdop = safeNum(pAttrs.pdop);
  const ignition = safeNum(pAttrs.ignition) || (pAttrs.ignition === true ? "1" : pAttrs.ignition === false ? "0" : "—");
  const sleepMode = safeNum(pAttrs.sleepMode);
  const motion = safeNum(pAttrs.motion) || (pAttrs.motion === true ? "1" : pAttrs.motion === false ? "0" : "—");
  const batteryLevel = safeStr(pAttrs.batteryLevel != null ? `${pAttrs.batteryLevel}%` : undefined);
  const odometerKm = safeNum(pAttrs.totalDistance) !== "—"
    ? `${(Number(pAttrs.totalDistance) / 1000).toFixed(2)} km`
    : safeNum(pAttrs.odometer) !== "—"
      ? `${(Number(pAttrs.odometer) / 1000).toFixed(2)} km`
      : "—";
  const gsmOperator = safeStr(pAttrs.operator) || safeNum(pAttrs.mcc);
  const reference = safeStr(attrs.reference) || safeStr(pAttrs.deviceModel);
  const digitalOutput1 = safeNum(pAttrs.out1) || safeNum(pAttrs.digitalOutput1);
  const satellites = safeNum(pAttrs.sat) || safeNum(pAttrs.satellites);
  const gsmSignal = safeNum(pAttrs.rssi) || safeNum(pAttrs.gsmSignal);
  const networkType = safeNum(pAttrs.networkType);

  const user = safeStr(attrs.contact) || safeStr(attrs.driver);
  const speed = position?.speed != null ? `${Number(position.speed).toFixed(2)} km/h` : "—";
  const extVoltage = pAttrs.power != null ? `${Number(pAttrs.power).toFixed(2)} V` : "—";
  const intVoltage = pAttrs.battery != null ? `${Number(pAttrs.battery).toFixed(2)} V` : "—";
  const alarm = safeStr(pAttrs.alarm);
  const distance = pAttrs.distance != null ? `${(Number(pAttrs.distance) / 1000).toFixed(2)} km` : "—";
  const moving = Boolean(pAttrs.motion) || (Number(position?.speed ?? 0) > 0.5);
  const movingText = moving ? "Sí" : "No";
  const totalDistance = pAttrs.totalDistance != null ? `${(Number(pAttrs.totalDistance) / 1000).toFixed(2)} km` : "—";

  return (
    <div className="vehicle-detail">
      {/* Header */}
      <div className="vehicle-detail__header">
        <Button
          variant="secundario"
          size="sm"
          leftIcon={<Icon name="chevron-left" size={16} />}
          onClick={handleBack}
        />
        <div className="vehicle-detail__header-info">
          <span className="vehicle-detail__title">Detalles del vehículo</span>
          <div className="vehicle-detail__breadcrumb">
            <span className="vehicle-detail__breadcrumb-item">Mapa</span>
            <span className="vehicle-detail__breadcrumb-sep">/</span>
            <span className="vehicle-detail__breadcrumb-current">Detalles del vehículo</span>
          </div>
        </div>
      </div>

      {/* Datos básicos */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <span className="vehicle-detail__section-title">Datos básicos</span>
        <div className="vehicle-detail__grid">
          <ReadOnlyField label="Placa" value={plate} />
          <ReadOnlyField label="Modelo vehículo" value={modelVeh} />
          <ReadOnlyField label="Identificador IMEI" value={imei} />
          <ReadOnlyField label="Compañía" value={company} />
          <ReadOnlyField label="Contacto" value={contact} />
          <ReadOnlyField label="Teléfono" value={phone} />
          <ReadOnlyField label="Correo electrónico" value={email} />
          <ReadOnlyField label="Categoría" value={category} />
          <ReadOnlyField label="Estado" value={status} />
          <ReadOnlyField label="Última actualización" value={lastUpdate} />
        </div>
      </div>

      {/* Información del dispositivo */}
      <CollapsibleSection title="Información del dispositivo">
        <div className="vehicle-detail__grid">
          <ReadOnlyField label="ICCID (Identificador de SIM)" value={iccid} />
          <ReadOnlyField label="Fabricante" value={manufacturer} />
          <ReadOnlyField label="Entrada analógica 1" value={analogInput1} />
          <ReadOnlyField label="Estado BT" value={btState} />
          <ReadOnlyField label="Estado GNSS" value={gnssState} />
          <ReadOnlyField label="GNSS HDOP" value={hdop} />
          <ReadOnlyField label="GNSS PDOP" value={pdop} />
          <ReadOnlyField label="Ignición" value={ignition} />
          <ReadOnlyField label="Modo sueño" value={sleepMode} />
          <ReadOnlyField label="Movimiento" value={motion} />
          <ReadOnlyField label="Nivel de batería" value={batteryLevel} />
          <ReadOnlyField label="Odómetro (Km)" value={odometerKm} />
          <ReadOnlyField label="Operador GSM Activo" value={gsmOperator} />
          <ReadOnlyField label="Referencia" value={reference} />
          <ReadOnlyField label="Salida digital 1" value={digitalOutput1} />
          <ReadOnlyField label="Satélites" value={satellites} />
          <ReadOnlyField label="Señal GSM" value={gsmSignal} />
          <ReadOnlyField label="Tipo de red" value={networkType} />
        </div>
      </CollapsibleSection>

      {/* Información del vehículo */}
      <CollapsibleSection title="Información del vehículo">
        <div className="vehicle-detail__grid">
          <ReadOnlyField label="Usuario" value={user} />
          <ReadOnlyField label="Velocidad" value={speed} />
          <ReadOnlyField label="Voltaje batría externo" value={extVoltage} />
          <ReadOnlyField label="Voltaje batería interno" value={intVoltage} />
          <ReadOnlyField label="Alarma" value={alarm} />
          <ReadOnlyField label="Distancia" value={distance} />
          <ReadOnlyField label="En movimiento" value={movingText} />
          <ReadOnlyField label="Distancia total" value={totalDistance} />
        </div>
      </CollapsibleSection>
    </div>
  );
}
