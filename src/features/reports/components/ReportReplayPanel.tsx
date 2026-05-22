import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { Button, Icon, SpeedCard } from "../../../lib/design-system/components";
import type { ReportRow } from "./reportTypes";

const REPLAY_INTERVAL_MS = 1500;

interface ReportReplayPanelProps {
  rows: ReportRow[];
  onClose: () => void;
}

export function ReportReplayPanel({ rows: panelRows, onClose }: ReportReplayPanelProps) {
  const [step, setStep] = useState(1);
  const [playing, setPlaying] = useState(false);
  const total = panelRows.length;
  const current = panelRows[step - 1];
  const speedValue = current ? Number.parseInt(current.speed, 10) || 0 : 0;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStep((currentStep) => {
        if (currentStep >= total) {
          setPlaying(false);
          return currentStep;
        }
        return currentStep + 1;
      });
    }, REPLAY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [playing, total]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [-74.08, 4.65],
      zoom: 11,
    });
    map.addControl(new maplibregl.NavigationControl(), "top-left");
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    for (const marker of markersRef.current) marker.remove();
    markersRef.current = [];

    const visibleRows = panelRows.slice(0, step);
    const bounds = new maplibregl.LngLatBounds();

    visibleRows.forEach((row, index) => {
      const lat = Number.parseFloat(row.latitude);
      const lng = Number.parseFloat(row.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return;

      const markerElement = document.createElement("div");
      markerElement.className = index === visibleRows.length - 1
        ? "reports-map-marker reports-map-marker--active"
        : "reports-map-marker";

      const marker = new maplibregl.Marker({ element: markerElement }).setLngLat([lng, lat]).addTo(map);
      markersRef.current.push(marker);
      bounds.extend([lng, lat]);
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 40, maxZoom: 14, duration: 300 });
    }
  }, [panelRows, step]);

  return (
    <aside className="reports-replay-panel" aria-label="Reproduccion de ruta">
      <button type="button" className="reports-replay-panel__close" onClick={onClose} aria-label="Cerrar mapa">
        <Icon name="x" size={18} />
      </button>

      <div className="reports-replay-panel__map" ref={mapContainerRef} />

      <div className="reports-replay-panel__controls">
        <input
          className="reports-replay-panel__slider"
          type="range"
          min="1"
          max={total}
          value={step}
          onChange={(event) => setStep(Number(event.target.value))}
          aria-label="Avance de reproduccion"
        />
        <div className="reports-replay-panel__control-row">
          <Button variant="ghost" size="xs" aria-label="Retroceder" onClick={() => { setPlaying(false); setStep((value) => Math.max(1, value - 1)); }}>
            <Icon name="rewind" size={20} />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            aria-label={playing ? "Pausar" : "Reproducir"}
            onClick={() => setPlaying((value) => !value)}
          >
            <Icon name={playing ? "circle-pause" : "circle-play"} size={20} />
          </Button>
          <Button variant="ghost" size="xs" aria-label="Avanzar" onClick={() => { setPlaying(false); setStep((value) => Math.min(total, value + 1)); }}>
            <Icon name="fast-forward" size={20} />
          </Button>
        </div>
        <div className="reports-replay-panel__meta">
          <span>{step}/{total}</span>
          <span>{current?.reportedAt ?? ""}</span>
        </div>
        <SpeedCard speed={speedValue} maxSpeed={120} unit="km/h" />
      </div>
    </aside>
  );
}
