import "maplibre-gl/dist/maplibre-gl.css";

import maplibregl, { type Map as MapLibreMap, type Marker } from "maplibre-gl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DeviceLite, PositionLite } from "../types";

import greenCar from "../../../../assets/green_car.png";
import redCar from "../../../../assets/red_car.png";
import greyCar from "../../../../assets/grey_car.png";

const DEFAULT_STYLE = "https://demotiles.maplibre.org/style.json";

function getCarImage(status?: string | null) {
  const s = String(status || "").toLowerCase();
  if (s === "online") return greenCar;
  if (s === "offline") return redCar;
  return greyCar;
}

export function MapCanvas({
  positions,
  devicesById,
  onSelectDevice,
}: Readonly<{
  positions: PositionLite[];
  devicesById: Record<number, DeviceLite>;
  onSelectDevice?: (deviceId: number) => void;
}>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  // Store markers by ID (device-ID or cluster-ID)
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const [mapError, setMapError] = useState<string | null>(null);
  // Keep track of the latest callbacks/data for the render loop
  const dataRef = useRef({ onSelectDevice });
  dataRef.current = { onSelectDevice };

  const hasPositions = positions.length > 0;

  const bounds = useMemo(() => {
    if (!hasPositions) return null;
    const b = new maplibregl.LngLatBounds();
    positions.forEach((p) => b.extend([p.longitude, p.latitude]));
    return b;
  }, [hasPositions, positions]);

  const updateMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.getSource("devices")) return;

    const features = map.querySourceFeatures("devices", { layers: ["devices-dummy"] });
    const currentIds = new Set<string>();

    features.forEach((feature) => {
      const coords = (feature.geometry as GeoJSON.Point).coordinates;
      const props = feature.properties;
      const isCluster = props?.cluster;
      const markerId = isCluster ? `cluster-${props.cluster_id}` : `device-${props.id}`;
      
      currentIds.add(markerId);

      let marker = markersRef.current.get(markerId);
      if (!marker) {
        const el = document.createElement("div");
        
        if (isCluster) {
          el.className = "scada-cluster-marker";
          const total = props.point_count;
          const online = props.online || 0;
          const offline = props.offline || 0;
          const other = props.other || 0;
          
          let gradient = "var(--color-neutral-400, #9ca3af)";
          if (total > 0) {
            const pOnline = (online / total) * 100;
            const pOffline = pOnline + (offline / total) * 100;
            const cSuccess = "var(--color-success, #10b981)";
            const cError = "var(--color-error, #ef4444)";
            const cNeutral = "var(--color-neutral-400, #9ca3af)";
            const parts = [];
            if (online > 0) parts.push(`${cSuccess} 0% ${pOnline}%`);
            if (offline > 0) parts.push(`${cError} ${pOnline}% ${pOffline}%`);
            if (other > 0) parts.push(`${cNeutral} ${pOffline}% 100%`);
            gradient = `conic-gradient(${parts.join(", ")})`;
          }

          el.style.width = "56px";
          el.style.height = "56px";
          el.style.borderRadius = "50%";
          el.style.background = "rgba(148, 163, 184, 0.3)";
          el.style.display = "flex";
          el.style.alignItems = "center";
          el.style.justifyContent = "center";
          el.style.cursor = "pointer";
          
          el.innerHTML = `
            <div style="width: 44px; height: 44px; border-radius: 50%; background: ${gradient}; display: flex; align-items: center; justify-content: center;">
              <div style="width: 36px; height: 36px; background: var(--ds-color-surface, #fff); color: var(--ds-color-text, #000); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                ${total >= 1000 ? Math.floor(total/1000) + 'k+' : total}
              </div>
            </div>
          `;

          el.addEventListener("click", () => {
             const source = map.getSource("devices") as maplibregl.GeoJSONSource;
             source.getClusterExpansionZoom(props.cluster_id, (err, zoom) => {
               if (err || !zoom) return;
               map.easeTo({ center: [coords[0], coords[1]], zoom: zoom + 1 });
             });
          });

          marker = new maplibregl.Marker({ element: el })
            .setLngLat([coords[0], coords[1]])
            .addTo(map);

        } else {
          el.className = "cursor-pointer transition-transform hover:scale-110";
          el.style.background = "transparent";
          el.style.border = "none";
          el.style.padding = "0";

          const imgSrc = getCarImage(props.status);
          const img = document.createElement("img");
          img.src = imgSrc;
          img.setAttribute("data-src", imgSrc);
          img.style.width = "24px";
          img.style.height = "auto";
          img.style.display = "block";
          el.appendChild(img);

          el.addEventListener("click", (e) => {
            e.preventDefault();
            dataRef.current.onSelectDevice?.(props.id);
          });

          marker = new maplibregl.Marker({ element: el, rotationAlignment: "map" })
            .setLngLat([coords[0], coords[1]])
            .addTo(map);

          if (typeof props.course === "number") {
            marker.setRotation(props.course);
          }
        }
        markersRef.current.set(markerId, marker);
      } else {
        // Update existing marker position
        marker.setLngLat([coords[0], coords[1]]);
        if (!isCluster) {
          if (typeof props.course === "number") {
            marker.setRotation(props.course);
          }
          const imgEl = marker.getElement().querySelector("img");
          const imgSrc = getCarImage(props.status);
          if (imgEl && imgEl.getAttribute("data-src") !== imgSrc) {
            imgEl.src = imgSrc;
            imgEl.setAttribute("data-src", imgSrc);
          }
        }
      }
    });

    // Remove markers that are no longer visible
    for (const [id, marker] of markersRef.current.entries()) {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: DEFAULT_STYLE,
      center: [-74.08175, 4.60971], // Bogotá
      zoom: 5,
      attributionControl: false,
    });

    const onError = (e: any) => {
      const message = e?.error?.message || e?.message || "Map error";
      setMapError(String(message));
    };
    map.on("error", onError);

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    map.on("load", () => {
      map.addSource("devices", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 60,
        clusterProperties: {
          online: ["+", ["case", ["==", ["get", "status"], "online"], 1, 0]],
          offline: ["+", ["case", ["==", ["get", "status"], "offline"], 1, 0]],
          other: ["+", ["case", ["!", ["in", ["get", "status"], ["literal", ["online", "offline"]]]], 1, 0]]
        }
      });
      map.addLayer({
        id: "devices-dummy",
        type: "circle",
        source: "devices",
        paint: { "circle-radius": 1, "circle-color": "transparent" }
      });
    });

    map.on("render", () => {
      if (map.isSourceLoaded("devices")) {
        updateMarkers();
      }
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      map.off("error", onError);
      map.remove();
      mapRef.current = null;
    };
  }, [updateMarkers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    
    const features: GeoJSON.Feature<GeoJSON.Point>[] = positions.map((p) => {
      const id = p.deviceId;
      const device = devicesById[id];
      const status = String((device as any)?.status || "unknown").toLowerCase();
      return {
        type: "Feature",
        geometry: { type: "Point", coordinates: [p.longitude, p.latitude] },
        properties: {
          id: id,
          course: p.course,
          status: status,
          title: device?.name ?? `#${id}`
        }
      };
    });

    const geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
      type: "FeatureCollection",
      features
    };

    if (map.isStyleLoaded()) {
      const source = map.getSource("devices") as maplibregl.GeoJSONSource;
      if (source) source.setData(geojson);
    } else {
      map.once("load", () => {
        const source = map.getSource("devices") as maplibregl.GeoJSONSource;
        if (source) source.setData(geojson);
      });
    }
  }, [devicesById, positions]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !bounds) return;
    if (!map.isStyleLoaded()) {
      const onLoad = () => {
        map.fitBounds(bounds, { padding: 40, duration: 0 });
      };
      map.once("load", onLoad);
      return () => {
        map.off("load", onLoad);
      };
    }
    map.fitBounds(bounds, { padding: 40, duration: 0 });
  }, [bounds]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {mapError && (
        <div className="pointer-events-none absolute left-3 top-3 max-w-[min(520px,calc(100%-24px))] rounded-xl border border-red-500/30 bg-red-950/30 px-3 py-2 text-xs text-red-200">
          No se pudo cargar el mapa: {mapError}
        </div>
      )}
    </div>
  );
}

