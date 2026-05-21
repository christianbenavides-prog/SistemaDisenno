import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Checkbox,
  ChipInput,
  DataTable,
  type DataTableColumn,
  DatePicker,
  Icon,
  ModuleTemplate,
  type ModuleNavItem,
  Pagination,
  SpeedCard,
  TableLayout,
  type ThemeMode,
} from "../../../lib/design-system/components";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { SimonLogo, SimonWatermark } from "../../../shared/brand";
import { appHeaderUser } from "../../../shared/lib/appHeaderUser";
import "../styles/reports.css";

/* ── Types ── */

interface ReportRow {
  id: number;
  plate: string;
  reportedAt: string;
  latitude: string;
  longitude: string;
  altitude: string;
  speed: string;
  location: string;
  distance: string;
  properties: string;
}

/* ── Constants ── */

const ROWS_PER_PAGE = 20;
const REPLAY_INTERVAL_MS = 1500;

/* ── Mock data: tracking de vehiculos a lo largo del dia ── */
const rows: ReportRow[] = [
  { id: 1,  plate: "LFY 548", reportedAt: "08/02/2026 06:00 AM", latitude: "-4.563452", longitude: "3.567432", altitude: "1.345643", speed: "23 km/h",  location: "Zona Norte, Bogota",       distance: "0 km",     properties: "Ignicion activa" },
  { id: 2,  plate: "LFY 548", reportedAt: "08/02/2026 07:00 AM", latitude: "-4.563453", longitude: "3.567234", altitude: "1.345123", speed: "56 km/h",  location: "Autopista Norte Km 4",     distance: "4.2 km",   properties: "Movimiento" },
  { id: 3,  plate: "LFY 548", reportedAt: "08/02/2026 08:00 AM", latitude: "-4.563452", longitude: "3.567123", altitude: "1.345467", speed: "24 km/h",  location: "Calle 100 con 15",         distance: "8.7 km",   properties: "Movimiento" },
  { id: 4,  plate: "LFY 548", reportedAt: "08/02/2026 09:00 AM", latitude: "-5.563342", longitude: "4.567123", altitude: "2.345123", speed: "45 km/h",  location: "Chapinero, Cra 7",         distance: "14.1 km",  properties: "Ruta" },
  { id: 5,  plate: "LFY 548", reportedAt: "08/02/2026 10:00 AM", latitude: "-6.563234", longitude: "4.567545", altitude: "2.345456", speed: "68 km/h",  location: "Av Circunvalar",           distance: "22.3 km",  properties: "Movimiento" },
  { id: 6,  plate: "LFY 548", reportedAt: "08/02/2026 11:00 AM", latitude: "-6.563456", longitude: "4.567234", altitude: "2.345773", speed: "75 km/h",  location: "Usaquen, Cra 9",           distance: "31.5 km",  properties: "Movimiento" },
  { id: 7,  plate: "LFY 548", reportedAt: "08/02/2026 12:00 PM", latitude: "-7.563234", longitude: "5.567236", altitude: "3.345123", speed: "34 km/h",  location: "Calle 72 con Av Chile",    distance: "38.2 km",  properties: "Ruta" },
  { id: 8,  plate: "LFY 548", reportedAt: "08/02/2026 01:00 PM", latitude: "-7.563234", longitude: "5.567234", altitude: "3.345643", speed: "67 km/h",  location: "Av El Dorado, Cra 50",     distance: "45.9 km",  properties: "Movimiento" },
  { id: 9,  plate: "LFY 548", reportedAt: "08/02/2026 02:00 PM", latitude: "-7.563341", longitude: "5.567642", altitude: "3.345234", speed: "60 km/h",  location: "Modelia, Av Esperanza",    distance: "54.1 km",  properties: "Movimiento" },
  { id: 10, plate: "LFY 548", reportedAt: "08/02/2026 03:00 PM", latitude: "-8.563345", longitude: "6.567346", altitude: "4.345345", speed: "34 km/h",  location: "Salitre, Terminal",         distance: "60.8 km",  properties: "Ruta" },
  { id: 11, plate: "LFY 548", reportedAt: "08/02/2026 04:00 PM", latitude: "-8.563345", longitude: "6.567345", altitude: "4.345253", speed: "60 km/h",  location: "Kennedy, Av 1 Mayo",       distance: "68.4 km",  properties: "Movimiento" },
  { id: 12, plate: "LFY 548", reportedAt: "08/02/2026 05:00 PM", latitude: "-8.563234", longitude: "6.567457", altitude: "4.345123", speed: "54 km/h",  location: "Puente Aranda",            distance: "75.2 km",  properties: "Movimiento" },
  { id: 13, plate: "LFY 548", reportedAt: "08/02/2026 06:00 PM", latitude: "-8.663200", longitude: "6.667230", altitude: "4.445230", speed: "55 km/h",  location: "Fontibon, Calle 13",       distance: "80.1 km",  properties: "Movimiento" },
  { id: 14, plate: "LFY 548", reportedAt: "08/02/2026 07:00 PM", latitude: "-8.263450", longitude: "6.267560", altitude: "4.045670", speed: "0 km/h",   location: "San Cristobal, Cra 10",    distance: "84.6 km",  properties: "Parada" },
  { id: 15, plate: "LFY 548", reportedAt: "08/02/2026 08:00 PM", latitude: "-7.763230", longitude: "5.767340", altitude: "3.545450", speed: "65 km/h",  location: "Teusaquillo, Cra 17",      distance: "94.7 km",  properties: "Movimiento" },
  { id: 16, plate: "LFY 548", reportedAt: "08/02/2026 09:00 PM", latitude: "-6.963670", longitude: "4.967780", altitude: "2.745890", speed: "61 km/h",  location: "Calle 85, Zona Rosa",      distance: "112.4 km", properties: "Movimiento" },
  { id: 17, plate: "LFY 548", reportedAt: "08/02/2026 10:00 PM", latitude: "-6.163910", longitude: "4.167920", altitude: "1.945930", speed: "33 km/h",  location: "Colina Campestre",          distance: "126.3 km", properties: "Ruta" },
  { id: 18, plate: "LFY 548", reportedAt: "08/02/2026 11:00 PM", latitude: "-5.563940", longitude: "3.567950", altitude: "1.345960", speed: "62 km/h",  location: "Calle 80 con Av 68",       distance: "143.9 km", properties: "Movimiento" },
  { id: 19, plate: "LFY 548", reportedAt: "09/02/2026 12:00 AM", latitude: "-4.763980", longitude: "2.767990", altitude: "0.546000", speed: "29 km/h",  location: "Salitre, Centro Empresarial", distance: "157.8 km", properties: "Movimiento" },
  { id: 20, plate: "LFY 548", reportedAt: "09/02/2026 01:00 AM", latitude: "-4.564000", longitude: "2.568010", altitude: "0.346020", speed: "15 km/h",  location: "Teusaquillo, Cra 17",      distance: "165.4 km", properties: "Ignicion activa" },
  { id: 21, plate: "LFY 548", reportedAt: "09/02/2026 02:00 AM", latitude: "-4.563452", longitude: "3.567432", altitude: "1.345643", speed: "0 km/h",   location: "Zona Norte, Bogota",       distance: "172.1 km", properties: "Motor apagado" },
  { id: 22, plate: "TMR 221", reportedAt: "08/02/2026 06:00 AM", latitude: "-4.710989", longitude: "3.072092", altitude: "2.640000", speed: "18 km/h",  location: "Suba, Cra 91",             distance: "0 km",     properties: "Ignicion activa" },
  { id: 23, plate: "TMR 221", reportedAt: "08/02/2026 07:00 AM", latitude: "-4.648283", longitude: "3.107807", altitude: "2.580000", speed: "52 km/h",  location: "Av Boyaca con 63",         distance: "6.3 km",   properties: "Movimiento" },
  { id: 24, plate: "TMR 221", reportedAt: "08/02/2026 08:00 AM", latitude: "-4.628735", longitude: "3.064774", altitude: "2.600000", speed: "38 km/h",  location: "Parque Simon Bolivar",     distance: "13.1 km",  properties: "Ruta" },
  { id: 25, plate: "TMR 221", reportedAt: "08/02/2026 09:00 AM", latitude: "-4.644938", longitude: "3.062820", altitude: "2.625000", speed: "0 km/h",   location: "CAN, Av El Dorado",         distance: "13.1 km",  properties: "Parada" },
  { id: 26, plate: "TMR 221", reportedAt: "08/02/2026 10:00 AM", latitude: "-4.683191", longitude: "3.094020", altitude: "2.590000", speed: "64 km/h",  location: "Autopista Sur Km 5",       distance: "22.8 km",  properties: "Movimiento" },
  { id: 27, plate: "TMR 221", reportedAt: "08/02/2026 11:00 AM", latitude: "-4.598056", longitude: "3.076111", altitude: "2.610000", speed: "41 km/h",  location: "Kennedy, Av 1 Mayo",       distance: "30.4 km",  properties: "Ruta" },
  { id: 28, plate: "TMR 221", reportedAt: "08/02/2026 12:00 PM", latitude: "-4.715230", longitude: "3.030150", altitude: "2.645000", speed: "57 km/h",  location: "Fontibon, Av Centenario",  distance: "39.7 km",  properties: "Movimiento" },
  { id: 29, plate: "TMR 221", reportedAt: "08/02/2026 01:00 PM", latitude: "-4.655120", longitude: "3.112300", altitude: "2.575000", speed: "0 km/h",   location: "Bodega Central",           distance: "39.7 km",  properties: "Motor apagado" },
  { id: 30, plate: "TMR 221", reportedAt: "08/02/2026 02:00 PM", latitude: "-4.655120", longitude: "3.112300", altitude: "2.575000", speed: "22 km/h",  location: "Bodega Central",           distance: "41.2 km",  properties: "Ignicion activa" },
  { id: 31, plate: "TMR 221", reportedAt: "08/02/2026 03:00 PM", latitude: "-4.670320", longitude: "3.058900", altitude: "2.630000", speed: "48 km/h",  location: "Av Americas",              distance: "49.5 km",  properties: "Movimiento" },
  { id: 32, plate: "TMR 221", reportedAt: "08/02/2026 04:00 PM", latitude: "-4.599800", longitude: "3.081200", altitude: "2.605000", speed: "71 km/h",  location: "Av NQS, Calle 26",         distance: "58.3 km",  properties: "Movimiento" },
  { id: 33, plate: "TMR 221", reportedAt: "08/02/2026 05:00 PM", latitude: "-4.691400", longitude: "3.099100", altitude: "2.588000", speed: "35 km/h",  location: "Chapinero Alto",            distance: "65.1 km",  properties: "Ruta" },
  { id: 34, plate: "TMR 221", reportedAt: "08/02/2026 06:00 PM", latitude: "-4.608200", longitude: "3.069800", altitude: "2.618000", speed: "44 km/h",  location: "Calle 53, Av Caracas",     distance: "72.8 km",  properties: "Movimiento" },
  { id: 35, plate: "TMR 221", reportedAt: "08/02/2026 07:00 PM", latitude: "-4.632100", longitude: "3.071500", altitude: "2.602000", speed: "0 km/h",   location: "Suba, Cra 91",             distance: "72.8 km",  properties: "Motor apagado" },
  { id: 36, plate: "KLY 482", reportedAt: "08/02/2026 06:00 AM", latitude: "-4.722100", longitude: "3.035600", altitude: "2.650000", speed: "32 km/h",  location: "La Calera, via principal",  distance: "0 km",     properties: "Ignicion activa" },
  { id: 37, plate: "KLY 482", reportedAt: "08/02/2026 07:00 AM", latitude: "-4.660400", longitude: "3.105800", altitude: "2.578000", speed: "55 km/h",  location: "Av Circunvalar",           distance: "7.4 km",   properties: "Movimiento" },
  { id: 38, plate: "KLY 482", reportedAt: "08/02/2026 08:00 AM", latitude: "-4.586900", longitude: "3.090100", altitude: "2.598000", speed: "67 km/h",  location: "Calle 100 con Autopista",  distance: "16.2 km",  properties: "Movimiento" },
  { id: 39, plate: "KLY 482", reportedAt: "08/02/2026 09:00 AM", latitude: "-4.699800", longitude: "3.083400", altitude: "2.592000", speed: "0 km/h",   location: "Cedritos, Calle 140",      distance: "16.2 km",  properties: "Parada" },
  { id: 40, plate: "KLY 482", reportedAt: "08/02/2026 10:00 AM", latitude: "-4.612500", longitude: "3.063200", altitude: "2.615000", speed: "43 km/h",  location: "Usaquen, Cra 9",           distance: "23.8 km",  properties: "Ruta" },
  { id: 41, plate: "KLY 482", reportedAt: "08/02/2026 11:00 AM", latitude: "-4.659300", longitude: "3.060100", altitude: "2.622000", speed: "58 km/h",  location: "Chapinero, Cra 7",         distance: "32.5 km",  properties: "Movimiento" },
  { id: 42, plate: "KLY 482", reportedAt: "08/02/2026 12:00 PM", latitude: "-4.640200", longitude: "3.082700", altitude: "2.595000", speed: "72 km/h",  location: "Calle 72 con Av Chile",    distance: "42.1 km",  properties: "Movimiento" },
  { id: 43, plate: "KLY 482", reportedAt: "08/02/2026 01:00 PM", latitude: "-4.682400", longitude: "3.044900", altitude: "2.638000", speed: "0 km/h",   location: "Av El Dorado, Cra 50",     distance: "42.1 km",  properties: "Parada" },
  { id: 44, plate: "KLY 482", reportedAt: "08/02/2026 02:00 PM", latitude: "-4.718600", longitude: "3.041200", altitude: "2.647000", speed: "36 km/h",  location: "CAN, Av El Dorado",         distance: "48.9 km",  properties: "Ruta" },
  { id: 45, plate: "KLY 482", reportedAt: "08/02/2026 03:00 PM", latitude: "-4.663800", longitude: "3.098700", altitude: "2.582000", speed: "49 km/h",  location: "Modelia, Av Esperanza",    distance: "57.3 km",  properties: "Movimiento" },
  { id: 46, plate: "KLY 482", reportedAt: "08/02/2026 04:00 PM", latitude: "-4.705100", longitude: "3.078600", altitude: "2.595000", speed: "61 km/h",  location: "Kennedy, Av 1 Mayo",       distance: "66.8 km",  properties: "Movimiento" },
  { id: 47, plate: "KLY 482", reportedAt: "08/02/2026 05:00 PM", latitude: "-4.620800", longitude: "3.071100", altitude: "2.612000", speed: "28 km/h",  location: "Puente Aranda",            distance: "73.2 km",  properties: "Ruta" },
  { id: 48, plate: "KLY 482", reportedAt: "08/02/2026 06:00 PM", latitude: "-4.722100", longitude: "3.035600", altitude: "2.650000", speed: "0 km/h",   location: "La Calera, via principal",  distance: "80.6 km",  properties: "Motor apagado" },
];

/* ── Column definitions ── */

interface ColumnDef {
  id: string;
  header: string;
  render: (row: ReportRow) => string;
}

const ALL_DATA_COLUMNS: ColumnDef[] = [
  { id: "plate",      header: "Placa",            render: (row) => row.plate },
  { id: "reportedAt", header: "Fecha del Reporte", render: (row) => row.reportedAt },
  { id: "latitude",   header: "Latitud",          render: (row) => row.latitude },
  { id: "longitude",  header: "Longitud",         render: (row) => row.longitude },
  { id: "altitude",   header: "Altitud",          render: (row) => row.altitude },
  { id: "speed",      header: "Velocidad",        render: (row) => row.speed },
  { id: "location",   header: "Ubicacion",        render: (row) => row.location },
  { id: "distance",   header: "Distancia",        render: (row) => row.distance },
  { id: "properties", header: "Propiedades",      render: (row) => row.properties },
];

const TOGGLEABLE_COLUMN_IDS = ["latitude", "longitude", "altitude", "speed", "location", "distance"];

const navItems: ModuleNavItem[] = [
  { id: "map", iconName: "map-pinned", label: "Mapa" },
  { id: "vehicles", iconName: "cmd-car", label: "Vehiculos" },
  { id: "avl", iconName: "microchip", label: "Configuracion AVL" },
  { id: "alerts", iconName: "bell", label: "Gestor de Alarmas" },
  { id: "reports", iconName: "chart-column", label: "Reportes", selected: true },
  { id: "commands", iconName: "settings-2", label: "Comandos" },
  { id: "geofences", iconName: "map-pin", label: "Geocercas" },
  { id: "administrative", iconName: "user", label: "Administrativo" },
  { id: "settings", iconName: "settings", label: "Preferencias" },
];

/* ════════════════════════════════════════════════
 *  ReportsPage
 * ════════════════════════════════════════════════ */

export function ReportsPage() {
  const navigate = useNavigate();
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");

  /* ── Filters ── */
  const [selectedPlates, setSelectedPlates] = useState<string[]>([]);
  const [period, setPeriod] = useState("");
  const [filtersApplied, setFiltersApplied] = useState(false);

  /* ── Table ── */
  const [page, setPage] = useState(1);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set());
  const [visibleColumnIds, setVisibleColumnIds] = useState<Set<string>>(new Set(TOGGLEABLE_COLUMN_IDS));
  const [columnsOpen, setColumnsOpen] = useState(false);
  const columnsRef = useRef<HTMLDivElement>(null);

  /* ── Map panel ── */
  const [mapOpen, setMapOpen] = useState(true);

  const hasPendingFilter = selectedPlates.length > 0 || period.trim() !== "";

  /* ── Filtered rows ── */
  const filteredRows = useMemo(() => {
    if (!filtersApplied) return [];
    let result = rows;
    if (selectedPlates.length > 0) {
      const set = new Set(selectedPlates);
      result = result.filter((r) => set.has(r.plate));
    }
    if (period.trim()) {
      result = result.filter((r) => r.reportedAt.startsWith(period));
    }
    return result;
  }, [filtersApplied, selectedPlates, period]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ROWS_PER_PAGE));
  const visibleRows = useMemo(
    () => filteredRows.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE),
    [filteredRows, page],
  );

  /* ── Build table columns ── */
  const tableColumns = useMemo(() => {
    const cols: DataTableColumn<ReportRow>[] = [];
    if (filtersApplied) {
      cols.push({
        id: "selection",
        header: "",
        render: (row) => (
          <Checkbox
            checked={selectedRowIds.has(row.id)}
            onChange={() => toggleRow(row.id)}
            aria-label={`Seleccionar ${row.plate}`}
          />
        ),
      });
    }
    for (const col of ALL_DATA_COLUMNS) {
      if (!filtersApplied || col.id === "plate" || col.id === "reportedAt" || visibleColumnIds.has(col.id)) {
        cols.push({ id: col.id, header: col.header, render: col.render });
      }
    }
    return cols;
  }, [filtersApplied, visibleColumnIds, selectedRowIds]);

  /* ── Handlers ── */
  const toggleRow = useCallback((id: number) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (next.size > 0) setMapOpen(true);
      return next;
    });
  }, []);

  const toggleColumn = useCallback((colId: string) => {
    setVisibleColumnIds((prev) => {
      const next = new Set(prev);
      if (next.has(colId)) next.delete(colId);
      else next.add(colId);
      return next;
    });
  }, []);

  const toggleAllColumns = useCallback(() => {
    setVisibleColumnIds((prev) =>
      prev.size === TOGGLEABLE_COLUMN_IDS.length ? new Set() : new Set(TOGGLEABLE_COLUMN_IDS),
    );
  }, []);

  const clearFilters = () => {
    setSelectedPlates([]);
    setPeriod("");
    setFiltersApplied(false);
    setSelectedRowIds(new Set());
    setPage(1);
  };

  const applyFilters = () => {
    setFiltersApplied(true);
    setSelectedRowIds(new Set());
    setPage(1);
    setMapOpen(false);
  };

  /* ── Close columns dropdown on outside click ── */
  useEffect(() => {
    if (!columnsOpen) return;
    const handler = (e: MouseEvent) => {
      if (columnsRef.current && !columnsRef.current.contains(e.target as Node)) {
        setColumnsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [columnsOpen]);

  const showMap = filtersApplied && mapOpen;

  return (
    <ModuleTemplate
      className="reports-module"
      themeMode={themeMode}
      onThemeModeChange={setThemeMode}
      user={appHeaderUser}
      title="Reportes"
      navItems={navItems}
      logo={<SimonLogo variant={themeMode === "dark" ? "dark" : "light"} />}
      watermark={<SimonWatermark />}
      onNavItemSelect={(item) => {
        if (item.id === "map") navigate("/scada/map");
        if (item.id === "alerts") navigate("/scada/alerts");
        if (item.id === "commands") navigate("/scada/commands/center");
        if (item.id === "geofences") navigate("/scada/geofences");
      }}
    >
      {/* ── Toolbar ── */}
      <section className="reports-toolbar">
        <div className="reports-toolbar__filters">
          <ChipInput
            label="Placas"
            placeholder="Escribir placa y presionar Enter"
            value={selectedPlates}
            onChange={setSelectedPlates}
            icon={<Icon name="search" size={20} />}
          />
          <DatePicker
            placeholder="Periodo de tiempo"
            value={period}
            onChange={(formatted) => setPeriod(formatted)}
            icon={<Icon name="calendar" size={20} />}
          />
        </div>

        <div className="reports-toolbar__actions">
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Borrar todo
          </Button>
          <Button size="xs" disabled={!hasPendingFilter} onClick={applyFilters}>
            Aplicar
          </Button>

          {/* Columns dropdown */}
          <div ref={columnsRef} className="reports-columns-wrapper">
            <Button
              variant={filtersApplied ? "secundario" : "ghost"}
              size="sm"
              rightIcon={<Icon name="settings" size={16} />}
              disabled={!filtersApplied}
              onClick={() => setColumnsOpen((o) => !o)}
            >
              Columnas
            </Button>
            {columnsOpen && (
              <div className="reports-columns-dropdown">
                <button type="button" className="reports-columns-dropdown__item" onClick={toggleAllColumns}>
                  <span className={`reports-columns-dropdown__check ${visibleColumnIds.size === TOGGLEABLE_COLUMN_IDS.length ? "reports-columns-dropdown__check--on" : ""}`}>
                    {visibleColumnIds.size === TOGGLEABLE_COLUMN_IDS.length && <CheckSmall />}
                  </span>
                  Todas
                </button>
                {TOGGLEABLE_COLUMN_IDS.map((colId) => {
                  const col = ALL_DATA_COLUMNS.find((c) => c.id === colId)!;
                  const on = visibleColumnIds.has(colId);
                  return (
                    <button key={colId} type="button" className="reports-columns-dropdown__item" onClick={() => toggleColumn(colId)}>
                      <span className={`reports-columns-dropdown__check ${on ? "reports-columns-dropdown__check--on" : ""}`}>
                        {on && <CheckSmall />}
                      </span>
                      {col.header}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Button variant="secundario" size="sm" rightIcon={<Icon name="download" size={16} />} disabled={!filtersApplied}>
            Exportar
          </Button>
        </div>
      </section>

      {/* ── Content ── */}
      <section className={showMap ? "reports-content reports-content--with-map" : "reports-content"}>
        <TableLayout
          className="reports-table-shell"
          rowCount={filtersApplied ? `Resultados ${visibleRows.length} de ${filteredRows.length}` : undefined}
          pagination={filtersApplied ? <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /> : undefined}
        >
          <DataTable
            columns={tableColumns}
            rows={visibleRows}
            getRowKey={(row) => row.id}
            rowClassName={(row) => (selectedRowIds.has(row.id) ? "reports-row--selected" : "")}
            minWidth="53.125rem"
            emptyState="Usa los filtros para realizar tu primera consulta."
          />
        </TableLayout>

        {showMap && <ReportReplayPanel rows={filteredRows} onClose={() => setMapOpen(false)} />}
      </section>
    </ModuleTemplate>
  );
}

/* ════════════════════════════════════════════════
 *  ReportReplayPanel — mapa + controles de reproduccion
 * ════════════════════════════════════════════════ */

function ReportReplayPanel({ rows: panelRows, onClose }: { rows: ReportRow[]; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [playing, setPlaying] = useState(false);
  const total = panelRows.length;
  const current = panelRows[step - 1];
  const speedValue = current ? Number.parseInt(current.speed, 10) || 0 : 0;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  /* ── Auto-play ── */
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= total) { setPlaying(false); return s; }
        return s + 1;
      });
    }, REPLAY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [playing, total]);

  /* ── Init map ── */
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
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  /* ── Update markers on step change ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    for (const m of markersRef.current) m.remove();
    markersRef.current = [];

    const visibleRows = panelRows.slice(0, step);
    const bounds = new maplibregl.LngLatBounds();

    visibleRows.forEach((r, i) => {
      const lat = Number.parseFloat(r.latitude);
      const lng = Number.parseFloat(r.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return;

      const isLast = i === visibleRows.length - 1;
      const el = document.createElement("div");
      el.style.width = isLast ? "14px" : "8px";
      el.style.height = isLast ? "14px" : "8px";
      el.style.borderRadius = "50%";
      el.style.background = isLast ? "#00F1C7" : "#00F1C780";
      el.style.border = isLast ? "2px solid #fff" : "none";
      el.style.boxShadow = isLast ? "0 0 6px rgba(0,241,199,0.6)" : "none";

      const marker = new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
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
          onChange={(e) => setStep(Number(e.target.value))}
          aria-label="Avance de reproduccion"
        />
        <div className="reports-replay-panel__control-row">
          <Button variant="ghost" size="xs" aria-label="Retroceder" onClick={() => { setPlaying(false); setStep((s) => Math.max(1, s - 1)); }}>
            <Icon name="rewind" size={20} />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            aria-label={playing ? "Pausar" : "Reproducir"}
            onClick={() => setPlaying((p) => !p)}
          >
            <Icon name={playing ? "circle-pause" : "circle-play"} size={20} />
          </Button>
          <Button variant="ghost" size="xs" aria-label="Avanzar" onClick={() => { setPlaying(false); setStep((s) => Math.min(total, s + 1)); }}>
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

/* ── Inline tiny check icon ── */
function CheckSmall() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
