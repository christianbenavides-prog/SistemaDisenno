import { useCallback, useEffect, useMemo, useState } from "react";
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
import { MapNotification } from "../traccar/notification/MapNotification";
import { MapPadding } from "../traccar/MapPadding";
import { StatusCard } from "../components/StatusCard";
import { MapLayout } from "../../../lib/design-system/components/MapLayout";
import { Input } from "../../../lib/design-system/components/Input";
import { Icon } from "../../../lib/design-system/icons";

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
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [detailDeviceId, setDetailDeviceId] = useState<number | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedKeyword(keyword.trim()), 500);
    return () => clearTimeout(id);
  }, [keyword]);

  const onSelectDevice = useCallback((deviceId: number | null) => {
    setSelectedDeviceId(deviceId);
    setSelectionTick((t) => t + 1);
    if (deviceId == null) setDetailDeviceId(null);
  }, []);

  const onShowDetail = useCallback((deviceId: number) => {
    setDetailDeviceId(deviceId);
  }, []);

  const onCloseDetail = useCallback(() => {
    setDetailDeviceId(null);
  }, []);

  const devicesById = (config.devicesById ?? {}) as unknown as Record<string, DeviceLite>;
  const rawPositions = config.positions as unknown;

  const positions = useMemo<PositionLite[]>(() => {
    const raw = rawPositions;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as PositionLite[];
    if (raw instanceof Map) return Array.from(raw.values()) as PositionLite[];
    const maybeIterable = raw as any;
    if (maybeIterable && typeof maybeIterable.values === "function" && typeof maybeIterable[Symbol.iterator] === "function") {
      try { return Array.from(maybeIterable.values()) as PositionLite[]; } catch {}
    }
    if (typeof raw === "object") return Object.values(raw as Record<string, PositionLite>);
    return [];
  }, [rawPositions]);

  const normalizedPositions = useMemo<PositionLite[]>(() => {
    return positions.map((p) => {
      const attrs = (p as any)?.attributes;
      if (typeof attrs === "string") {
        try { return { ...(p as any), attributes: JSON.parse(attrs) } as PositionLite; } catch { return p; }
      }
      return p;
    });
  }, [positions]);

  const selectedPosition = useMemo(() => {
    if (selectedDeviceId == null) return null;
    return normalizedPositions.find((p) => Number(p.deviceId) === selectedDeviceId) ?? null;
  }, [normalizedPositions, selectedDeviceId]);

  const detailDevice = useMemo(() => {
    if (detailDeviceId == null) return null;
    return devicesById[String(detailDeviceId)] ?? null;
  }, [devicesById, detailDeviceId]);

  const detailPosition = useMemo(() => {
    if (detailDeviceId == null) return null;
    return normalizedPositions.find((p) => Number(p.deviceId) === detailDeviceId) ?? null;
  }, [normalizedPositions, detailDeviceId]);

  const showDetail = detailDeviceId != null;

  return (
    <div className="h-full w-full p-4 flex flex-col">
      <MapLayout
        className="flex-1 min-h-0"
        panelWidth="360px"
        panelHeader={
          showDetail ? (
            <button
              type="button"
              className="flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-text transition"
              onClick={onCloseDetail}
            >
              <Icon name="chevron-left" size={16} />
              <span>Detalles del vehículo</span>
            </button>
          ) : (
            <Input
              placeholder="Buscar por placa o IMEI"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              leftIcon={<Icon name="search" size={16} />}
            />
          )
        }
        cards={
          showDetail ? (
            <StatusCard
              variant="inline"
              deviceId={detailDeviceId!}
              device={detailDevice}
              position={detailPosition}
              onClose={onCloseDetail}
            />
          ) : (
            <DevicesSidebar
              keyword={debouncedKeyword}
              selectedDeviceId={selectedDeviceId}
              onSelectDevice={onSelectDevice}
              onShowDetail={onShowDetail}
            />
          )
        }
        map={
          <MapView>
            {import.meta.env.DEV && (
              <div className="pointer-events-none absolute left-3 top-12 z-30 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-[10px] text-white">
                positions: {positions.length}
              </div>
            )}

            <div className="scada-map-overlay">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="var(--color-warning)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 1L1 14h14L8 1Z" /><path d="M8 6v3" /><circle cx="8" cy="12" r="0.5" fill="var(--color-warning)" />
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
            <MapScale />
            <MapCurrentLocation />
            <MapNotification enabled={Boolean((config.events ?? []).length)} onClick={() => {}} />
            <MapPadding start={0} />
          </MapView>
        }
      />
    </div>
  );
}
