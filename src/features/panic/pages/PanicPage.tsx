import { useCallback, useMemo, useState } from "react";
import {
  Button,
  DataTable,
  type DataTableColumn,
  Icon,
  Input,
  ModuleTemplate,
  type ModuleNavItem,
  Pagination,
  Select,
  TableLayout,
  TextArea,
  type ThemeMode,
} from "../../../lib/design-system/components";
import { SimonLogo, SimonWatermark } from "../../../shared/brand";
import { appHeaderUser } from "../../../shared/lib/appHeaderUser";
import "../styles/panic.css";

type PanicStatus = "no-gestionadas" | "por-validar" | "gestionadas";

interface PanicRow {
  id: number;
  imei: string;
  plate: string;
  alerts: number;
  contact: string;
  phone: string;
  event: string;
  lastEventAt: string;
  location: string;
}

const panicRows: PanicRow[] = [
  {
    id: 1,
    imei: "862328070764560",
    plate: "GHI 567",
    alerts: 2,
    contact: "Adriana Valdes Wilches",
    phone: "3213946648",
    event: "Alarma de panico",
    lastEventAt: "08/02/2026 06:00 AM",
    location: "4.6097, -74.0817",
  },
  {
    id: 2,
    imei: "763218495731245",
    plate: "ABC 123",
    alerts: 5,
    contact: "Marco Antonio Rivera",
    phone: "3213946649",
    event: "Sistema de vigilancia",
    lastEventAt: "08/01/2026 07:00 AM",
    location: "4.6161, -74.0890",
  },
  {
    id: 3,
    imei: "653184920648731",
    plate: "MNO 789",
    alerts: 57,
    contact: "Lucia Fernandez",
    phone: "3213946650",
    event: "Sensor de movimiento",
    lastEventAt: "08/01/2026 07:15 AM",
    location: "4.6045, -74.0812",
  },
  {
    id: 4,
    imei: "543197842013256",
    plate: "DEF 901",
    alerts: 60,
    contact: "Diego Perez",
    phone: "3213946651",
    event: "Camara de seguridad",
    lastEventAt: "08/01/2026 07:30 AM",
    location: "4.5988, -74.0942",
  },
  {
    id: 5,
    imei: "432109876543210",
    plate: "STU 345",
    alerts: 84,
    contact: "Sofia Ramos",
    phone: "3213946652",
    event: "Control de acceso",
    lastEventAt: "08/01/2026 07:45 AM",
    location: "4.6120, -74.0675",
  },
  {
    id: 6,
    imei: "321098765432109",
    plate: "VWX 098",
    alerts: 10,
    contact: "Carlos Mendez",
    phone: "3213946653",
    event: "Iluminacion inteligente",
    lastEventAt: "08/01/2026 08:00 AM",
    location: "4.6191, -74.1013",
  },
  {
    id: 7,
    imei: "210987654321098",
    plate: "PQR 876",
    alerts: 24,
    contact: "Patricia Lopez",
    phone: "3213946654",
    event: "Alarma de incendio",
    lastEventAt: "08/01/2026 08:15 AM",
    location: "4.5890, -74.0844",
  },
  {
    id: 8,
    imei: "109876543210987",
    plate: "JKL 654",
    alerts: 7,
    contact: "Fernando Garcia",
    phone: "3213946655",
    event: "Sensor de temperatura",
    lastEventAt: "08/01/2026 08:30 AM",
    location: "4.6218, -74.0750",
  },
  {
    id: 9,
    imei: "098765432109876",
    plate: "CDE 213",
    alerts: 11,
    contact: "Valeria Torres",
    phone: "3213946656",
    event: "Cerraduras inteligentes",
    lastEventAt: "08/01/2026 08:45 AM",
    location: "4.6056, -74.0912",
  },
  {
    id: 10,
    imei: "987654321098765",
    plate: "FGH 432",
    alerts: 2,
    contact: "Javier Morales",
    phone: "3213946657",
    event: "Sistema anti-intrusion",
    lastEventAt: "08/01/2026 09:00 AM",
    location: "4.6138, -74.0801",
  },
];

const tabs: Array<{ id: PanicStatus; label: string; icon: "alert-triangle" | "circle-info" | "circle-check" }> = [
  { id: "no-gestionadas", label: "No gestionadas", icon: "alert-triangle" },
  { id: "por-validar", label: "Por validar", icon: "circle-info" },
  { id: "gestionadas", label: "Gestionadas", icon: "circle-check" },
];

const typificationOptions = [
  { value: "", label: "Selecciona la tipificacion" },
  { value: "fallas-boton", label: "Fallas boton de panico" },
  { value: "emergencia-real", label: "Emergencia real" },
  { value: "prueba-operativa", label: "Prueba operativa" },
  { value: "sin-contacto", label: "Sin contacto" },
];

const navItems: ModuleNavItem[] = [
  { id: "map", iconName: "map-pinned", label: "Mapa" },
  { id: "glovebox", iconName: "briefcase", label: "Guantera" },
  { id: "geofences", iconName: "map-pin", label: "Geocercas" },
  { id: "administrative", iconName: "settings-2", label: "Administrativo", expandable: true },
  { id: "reports", iconName: "chart-column", label: "Reportes", expandable: true },
  { id: "settings", iconName: "settings", label: "Ajustes", expandable: true },
  { id: "panic", iconName: "alert-triangle", label: "Boton de panico", selected: true },
];

function buildColumns(onManage: (row: PanicRow) => void): DataTableColumn<PanicRow>[] {
  return [
    { id: "imei", header: "IMEI", render: (row) => row.imei },
    { id: "plate", header: "Placa", render: (row) => row.plate },
    { id: "alerts", header: "Alertas", render: (row) => row.alerts },
    { id: "contact", header: "Contacto", render: (row) => row.contact },
    { id: "phone", header: "Telefono", render: (row) => row.phone },
    { id: "event", header: "Evento", render: (row) => row.event },
    { id: "lastEventAt", header: "Fecha ultimo evento", render: (row) => row.lastEventAt },
    {
      id: "actions",
      header: "Gestionar",
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          className="panic-manage-button"
          leftIcon={<Icon name="bell-dot" size={14} />}
          onClick={() => onManage(row)}
        >
          Gestionar
        </Button>
      ),
    },
  ];
}

function buildCompactColumns(onManage: (row: PanicRow) => void): DataTableColumn<PanicRow>[] {
  return [
    { id: "imei", header: "IMEI", render: (row) => row.imei },
    { id: "plate", header: "Placa", render: (row) => row.plate },
    { id: "contact", header: "Contacto", render: (row) => row.contact },
    { id: "phone", header: "Telefono", render: (row) => row.phone },
    {
      id: "actions",
      header: "",
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          className="panic-icon-action"
          aria-label={`Gestionar ${row.plate}`}
          onClick={() => onManage(row)}
        >
          <Icon name="bell-dot" size={14} />
        </Button>
      ),
    },
  ];
}

export function PanicPage() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [activeTab, setActiveTab] = useState<PanicStatus>("no-gestionadas");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRow, setSelectedRow] = useState<PanicRow | null>(null);
  const [typification, setTypification] = useState("");
  const [notes, setNotes] = useState("");
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    if (!searchQuery) return panicRows;
    const q = searchQuery.toLowerCase();
    return panicRows.filter(
      (row) =>
        row.plate.toLowerCase().includes(q) ||
        row.imei.includes(q) ||
        row.contact.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const openManagement = useCallback((row: PanicRow) => {
    setSelectedRow(row);
    setTypification("");
    setNotes("");
  }, []);

  const columns = useMemo(() => buildColumns(openManagement), [openManagement]);
  const compactColumns = useMemo(() => buildCompactColumns(openManagement), [openManagement]);

  const handleApply = () => {
    setPage(1);
    setSelectedRow(null);
  };

  const activeRow = selectedRow ?? filteredRows[0] ?? panicRows[0];

  return (
    <ModuleTemplate
      className="panic-module"
      themeMode={themeMode}
      onThemeModeChange={setThemeMode}
      user={appHeaderUser}
      title="Boton de panico"
      navItems={navItems}
      logo={<SimonLogo variant={themeMode === "dark" ? "dark" : "light"} />}
      watermark={<SimonWatermark />}
    >
      <section className="panic-view">
        <header className="panic-filters" aria-label="Filtros de panico">
          <nav className="panic-tabs" aria-label="Estados de panico">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`panic-tab ${activeTab === tab.id ? "panic-tab--active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon name={tab.icon} size={12} />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="panic-filter-row">
            <Input
              className="panic-search"
              placeholder="Buscar por IMEI, Placa..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <Button variant="ghost" size="sm" className="panic-clear-button" onClick={() => setSearchQuery("")}>
              Borrar todo
            </Button>
            <Button variant="principal" size="sm" className="panic-apply-button" onClick={handleApply}>
              Aplicar
            </Button>
          </div>
        </header>

        <div className={`panic-content ${selectedRow ? "panic-content--with-panel" : ""}`}>
          <article className="panic-table-card">
            <h2>{tabs.find((tab) => tab.id === activeTab)?.label}</h2>
            <TableLayout>
              <DataTable
                columns={selectedRow ? compactColumns : columns}
                rows={filteredRows}
                getRowKey={(row) => row.id}
                emptyState="No hay alarmas para mostrar."
                emptyColSpan={1}
                minWidth={selectedRow ? "620px" : "1080px"}
                maxHeight={selectedRow ? "calc(100vh - 520px)" : "calc(100vh - 450px)"}
                rowClassName={(row) => (activeRow.id === row.id ? "panic-row--selected" : "")}
              />
            </TableLayout>
          </article>

          {selectedRow && (
            <aside className="panic-management" aria-label="Gestionar alarma">
              <div className="panic-map">
                <iframe
                  title={`Ubicacion de ${activeRow.plate}`}
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-74.1,4.58,-74.05,4.64&layer=mapnik&marker=4.6097,-74.0817"
                  loading="lazy"
                />
              </div>

              <form className="panic-management-card">
                <div className="panic-management-card__heading">
                  <div>
                    <h3>Gestionar alarmas</h3>
                    <p>Evidencia el motivo por el cual se valida el registro seleccionado</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="panic-icon-action"
                    aria-label="Cerrar gestion"
                    onClick={() => setSelectedRow(null)}
                  >
                    <Icon name="x" size={16} />
                  </Button>
                </div>

                <Select
                  label="Tipificacion"
                  required
                  options={typificationOptions}
                  value={typification}
                  onChange={setTypification}
                />
                <TextArea
                  label="Observaciones"
                  required
                  placeholder="Describe los motivos"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />

                <div className="panic-selected-summary">
                  <span>
                    <Icon name="map-pin" size={16} />
                    {activeRow.location}
                  </span>
                  <strong>{activeRow.plate}</strong>
                </div>

                <footer className="panic-management-card__actions">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedRow(null)}>
                    Cancelar
                  </Button>
                  <Button type="button" variant="principal" size="sm" disabled={!typification}>
                    Actualizar
                  </Button>
                </footer>
              </form>
            </aside>
          )}
        </div>

        <footer className="panic-footer">
          <span>Resultados {filteredRows.length} de 48</span>
          <Pagination currentPage={page} totalPages={4} onPageChange={setPage} />
        </footer>
      </section>
    </ModuleTemplate>
  );
}
