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
import { MapDevicePopup } from "../components/MapDevicePopup";
import { VehicleDetailPage } from "./VehicleDetailPage";
import { MapLayout } from "../../../lib/design-system/components/MapLayout";
import { Input } from "../../../lib/design-system/components/Input";
import { Button } from "../../../lib/design-system/components/Button";
import { Switch } from "../../../lib/design-system/components/Switch";
import { Icon } from "../../../lib/design-system/icons";

type ViewState = "list" | "detail";

export function MapPage() {
  const { config } = useScada();
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [selectionTick, setSelectionTick] = useState(0);
  const [onlyAlarmed, setOnlyAlarmed] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [popupDeviceId, setPopupDeviceId] = useState<number | null>(null);
  const [viewState, setViewState] = useState<ViewState>("list");
  const [detailDeviceId, setDetailDeviceId] = useState<number | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedKeyword(keyword.trim()), 500);
    return () => clearTimeout(id);
  }, [keyword]);

  const onSelectDevice = useCallback((deviceId: number | null) => {
    setSelectedDeviceId(deviceId);
    setSelectionTick((t) => t + 1);
    if (deviceId != null) {
      setPopupDeviceId(deviceId);
    } else {
      setPopupDeviceId(null);
    }
  }, []);

  const onClosePopup = useCallback(() => {
    setPopupDeviceId(null);
  }, []);

  const onViewDetails = useCallback((deviceId: number) => {
    setDetailDeviceId(deviceId);
    setViewState("detail");
    setPopupDeviceId(null);
  }, []);

  const onBackFromDetail = useCallback(() => {
    setViewState("list");
    setDetailDeviceId(null);
  }, []);

  const onShowDetail = useCallback((deviceId: number) => {
    setSelectedDeviceId(deviceId);
    setSelectionTick((t) => t + 1);
    setPopupDeviceId(deviceId);
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

  const popupDevice = popupDeviceId != null ? devicesById[String(popupDeviceId)] ?? null : null;
  const popupPosition = useMemo(() => {
    if (popupDeviceId == null) return null;
    return normalizedPositions.find((p) => Number(p.deviceId) === popupDeviceId) ?? null;
  }, [normalizedPositions, popupDeviceId]);

  if (viewState === "detail" && detailDeviceId != null) {
    return (
      <div className="flex flex-1 min-h-0 flex-col">
        <VehicleDetailPage deviceId={detailDeviceId} onBack={onBackFromDetail} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <MapLayout
        className="flex-1 min-h-0"
        panelWidth="26.5625rem"
        panelHeader={
          <div className="ds-map-layout__panel-controls">
            <Input
              placeholder="Buscar por placa o IMEI"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              leftIcon={<Icon name="search" size={16} />}
              className="ds-map-layout__panel-search"
            />
            <Button
              variant="secundario"
              size="sm"
              leftIcon={<Icon name="sliders-horizontal" size={16} />}
            />
          </div>
        }
        cards={
          <DevicesSidebar
            keyword={debouncedKeyword}
            selectedDeviceId={selectedDeviceId}
            onSelectDevice={onSelectDevice}
            onShowDetail={onShowDetail}
          />
        }
        overlay={
          <>
            <Icon name="alert-triangle" size={14} className="ds-map-layout__overlay-icon--warning" />
            <span className="ds-map-layout__overlay-label">Solo vehiculos alarmados</span>
            <Switch
              checked={onlyAlarmed}
              aria-label="Solo vehiculos alarmados"
              onChange={(event) => setOnlyAlarmed(event.target.checked)}
            />
          </>
        }
        map={
          <MapView>
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

            {popupDevice && popupDeviceId != null && (
              <MapDevicePopup
                device={popupDevice}
                position={popupPosition}
                onClose={onClosePopup}
                onViewDetails={() => onViewDetails(popupDeviceId)}
              />
            )}
          </MapView>
        }
      />
    </div>
  );
}
