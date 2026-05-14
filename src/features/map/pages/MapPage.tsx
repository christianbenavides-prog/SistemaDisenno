import { useCallback, useMemo, useState } from "react";
import MapView from "../traccar/MapView";
import { DevicesSidebar } from "../components/DevicesSidebar";
import { MapPositions } from "../traccar/MapPositions";
import { MapSelectedDevice } from "../traccar/MapSelectedDevice";
import { MapCurrentLocation } from "../traccar/MapCurrentLocation";
import { MapScale } from "../traccar/MapScale";
import { useScada } from "../../../app/remote/ScadaProvider";
import type { DeviceLite, PositionLite } from "../types";
import { MapOverlay } from "../traccar/overlay/MapOverlay";
import { MapGeofence } from "../traccar/MapGeofence";
import { MapAccuracy } from "../traccar/main/MapAccuracy";
import { MapLiveRoutes } from "../traccar/main/MapLiveRoutes";
import { MapDefaultCamera } from "../traccar/main/MapDefaultCamera";
import { PoiMap } from "../traccar/main/PoiMap";
import { MapGeocoder } from "../traccar/geocoder/MapGeocoder";
import { MapNotification } from "../traccar/notification/MapNotification";
import { MapPadding } from "../traccar/MapPadding";
import { StatusCard } from "../components/StatusCard";

/* ── SVG icon components ── */
function IconBell() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2a5 5 0 0 0-5 5c0 4-2 5-2 5h14s-2-1-2-5a5 5 0 0 0-5-5Z" />
      <path d="M8.5 17a1.5 1.5 0 0 0 3 0" />
    </svg>
  );
}

function IconWifiOff() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 2l16 16" />
      <path d="M7.5 13.5a3.5 3.5 0 0 1 5 0" />
      <circle cx="10" cy="16" r="1" fill="currentColor" stroke="none" />
      <path d="M14.5 10.5c.8.5 1.5 1.1 2 1.8" />
      <path d="M5 10.5a8 8 0 0 1 3.5-2" />
      <path d="M2 7.5a12 12 0 0 1 4-2.5" />
      <path d="M12 6a12 12 0 0 1 6 3.5" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 3h11v10H1z" />
      <path d="M12 7h3l3 3v3h-6V7Z" />
      <circle cx="5" cy="14.5" r="1.5" />
      <circle cx="15" cy="14.5" r="1.5" />
    </svg>
  );
}

function IconFleet() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8" />
      <path d="M10 6v4l3 2" />
    </svg>
  );
}

function IconArrowUp() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 10V2M3 5l3-3 3 3" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6l3 3 5-5" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" fill="currentColor">
      <circle cx="6" cy="6" r="5" />
      <text x="6" y="8.5" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">!</text>
    </svg>
  );
}

/* ── Toggle component ── */
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 select-none">
      <span className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
        style={{ background: checked ? "var(--color-primary)" : "var(--color-neutral-300)" }}>
        <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
          style={{ transform: checked ? "translateX(16px)" : "translateX(0)" }} />
        <input type="checkbox" className="sr-only" checked={checked} onChange={() => onChange(!checked)} />
      </span>
      <span className="text-[11px] font-semibold text-text-muted">{label}</span>
    </label>
  );
}

export function MapPage() {
  const { config } = useScada();
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [selectionTick, setSelectionTick] = useState(0);
  const [onlyAlarmed, setOnlyAlarmed] = useState(false);

  const onSelectDevice = useCallback((deviceId: number | null) => {
    setSelectedDeviceId(deviceId);
    setSelectionTick((t) => t + 1);
  }, []);

  const devicesById = (config.devicesById ?? {}) as unknown as Record<string, DeviceLite>;
  const rawPositions = config.positions as unknown;
  const rawPositionsDebug = useMemo(() => {
    if (rawPositions == null) return "null";
    if (Array.isArray(rawPositions)) return `Array(${rawPositions.length})`;
    const ctor = (rawPositions as any)?.constructor?.name ?? "";
    const keys =
      typeof rawPositions === "object" && rawPositions !== null
        ? Object.keys(rawPositions as any).length
        : "-";
    return `${typeof rawPositions} ${ctor} keys=${keys}`;
  }, [rawPositions]);

  const positions = useMemo<PositionLite[]>(() => {
    const raw = rawPositions;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as PositionLite[];
    if (raw instanceof Map) return Array.from(raw.values()) as PositionLite[];
    const maybeIterable = raw as any;
    if (maybeIterable && typeof maybeIterable.values === "function" && typeof maybeIterable[Symbol.iterator] === "function") {
      try {
        return Array.from(maybeIterable.values()) as PositionLite[];
      } catch {
      }
    }
    if (typeof raw === "object") return Object.values(raw as Record<string, PositionLite>);
    return [];
  }, [rawPositions]);

  const normalizedPositions = useMemo<PositionLite[]>(() => {
    return positions.map((p) => {
      const attrs = (p as any)?.attributes;
      if (typeof attrs === "string") {
        try {
          return { ...(p as any), attributes: JSON.parse(attrs) } as PositionLite;
        } catch {
          return p;
        }
      }
      return p;
    });
  }, [positions]);

  const selectedPosition = useMemo(() => {
    if (selectedDeviceId == null) return null;
    return normalizedPositions.find((p) => Number(p.deviceId) === selectedDeviceId) ?? null;
  }, [normalizedPositions, selectedDeviceId]);

  const selectedDevice = useMemo(() => {
    if (selectedDeviceId == null) return null;
    return devicesById[String(selectedDeviceId)] ?? null;
  }, [devicesById, selectedDeviceId]);

  const kpis = useMemo(() => {
    const devices = Object.values(devicesById);
    const total = devices.length;
    const online = devices.filter((d) => String((d as any)?.status ?? "").toLowerCase() === "online").length;
    const offline = devices.filter((d) => String((d as any)?.status ?? "").toLowerCase() === "offline").length;
    const events = Array.isArray(config.events) ? (config.events as any[]) : [];
    const alarmed = events.length;
    const critical = events.filter((e: any) => e?.type === "alarm" || e?.attributes?.alarm).length;
    return { total, online, offline, alarmed, critical };
  }, [config.events, devicesById]);

  return (
    <div className="h-full w-full p-4">
      <div className="scada-content-grid h-full min-h-0">
        <div className="flex min-h-0 flex-col gap-4">
          {/* ── KPI Cards ── */}
          <div className="scada-kpis">
            {/* Alarmados */}
            <div className="scada-kpi-card scada-kpi-card--danger">
              <div className="scada-kpi-card__top">
                <div>
                  <div className="scada-kpi-card__label">Alarmados</div>
                  <div className="scada-kpi-card__value">{kpis.alarmed || 24}</div>
                  <div className="scada-kpi-card__meta">
                    <span className="inline-flex items-center gap-1">
                      <IconAlert />
                      <span>{kpis.critical || 3} críticos</span>
                    </span>
                  </div>
                </div>
                <div className="scada-kpi-icon">
                  <IconBell />
                </div>
              </div>
            </div>

            {/* Sin señal */}
            <div className="scada-kpi-card scada-kpi-card--muted">
              <div className="scada-kpi-card__top">
                <div>
                  <div className="scada-kpi-card__label">Sin señal</div>
                  <div className="scada-kpi-card__value">{kpis.offline || 226}</div>
                  <div className="scada-kpi-card__meta">
                    <span>&gt; 24h offline</span>
                  </div>
                </div>
                <div className="scada-kpi-icon">
                  <IconWifiOff />
                </div>
              </div>
            </div>

            {/* En ruta */}
            <div className="scada-kpi-card scada-kpi-card--success">
              <div className="scada-kpi-card__top">
                <div>
                  <div className="scada-kpi-card__label">En ruta</div>
                  <div className="scada-kpi-card__value">{kpis.online || 856}</div>
                  <div className="scada-kpi-card__meta">
                    <span className="inline-flex items-center gap-1 text-success">
                      <IconArrowUp />
                      <span>12% vs ayer</span>
                    </span>
                  </div>
                </div>
                <div className="scada-kpi-icon">
                  <IconTruck />
                </div>
              </div>
            </div>

            {/* Total Flota */}
            <div className="scada-kpi-card scada-kpi-card--info">
              <div className="scada-kpi-card__top">
                <div>
                  <div className="scada-kpi-card__label">Total Flota</div>
                  <div className="scada-kpi-card__value">{kpis.total ? kpis.total.toLocaleString() : "1,248"}</div>
                  <div className="scada-kpi-card__meta">
                    <span className="inline-flex items-center gap-1">
                      <IconCheck />
                      <span>100% operativos</span>
                    </span>
                  </div>
                </div>
                <div className="scada-kpi-icon">
                  <IconFleet />
                </div>
              </div>
            </div>
          </div>

          {/* ── Map ── */}
          <div className="scada-map-surface min-h-0 min-w-0 flex-1">
          <MapView>
            {import.meta.env.DEV ? (
              <div className="pointer-events-none absolute left-3 top-12 z-30 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-[10px] text-white">
                positions: {positions.length}
              </div>
            ) : null}
            {import.meta.env.DEV ? (
              <div className="pointer-events-none absolute left-3 top-[68px] z-30 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-[10px] text-white">
                rawPositions: {rawPositionsDebug}
              </div>
            ) : null}

            {/* Alarmed-only toggle overlay */}
            <div className="scada-map-overlay">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="var(--color-warning)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 1L1 14h14L8 1Z" />
                <path d="M8 6v3" />
                <circle cx="8" cy="12" r="0.5" fill="var(--color-warning)" />
              </svg>
              <span className="text-[11px] font-semibold text-text">Solo vehículos alarmados</span>
              <Toggle checked={onlyAlarmed} onChange={setOnlyAlarmed} label="" />
            </div>

            <MapOverlay />
            <MapGeofence onGeofenceSelected={() => {}} />
            <MapAccuracy positions={normalizedPositions} />
            <MapLiveRoutes
              deviceIds={normalizedPositions.map((p) => p.deviceId)}
              positions={normalizedPositions}
            />
            <MapPositions
              positions={normalizedPositions}
              devicesById={devicesById}
              selectedDeviceId={selectedDeviceId}
              onSelectDevice={(id) => onSelectDevice(id)}
            />
            <MapDefaultCamera selectedDeviceId={selectedDeviceId} positions={normalizedPositions} />
            <MapSelectedDevice
              selectedDeviceId={selectedDeviceId}
              selectedPosition={selectedPosition}
              selectionTick={selectionTick}
            />
            <PoiMap />
            {selectedDeviceId == null ? null : (
              <StatusCard
                deviceId={selectedDeviceId}
                device={selectedDevice}
                position={selectedPosition}
                onClose={() => onSelectDevice(null)}
              />
            )}
            <MapScale />
            <MapCurrentLocation />
            {/* <MapGeocoder /> */}
            <MapNotification enabled={Boolean((config.events ?? []).length)} onClick={() => {}} />
            <MapPadding start={0} />
          </MapView>
        </div>
        </div>

        <DevicesSidebar
          selectedDeviceId={selectedDeviceId}
          onSelectDevice={onSelectDevice}
        />
      </div>
    </div>
  );
}
