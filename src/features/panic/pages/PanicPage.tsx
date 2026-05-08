import { useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  DataTable,
  type DataTableColumn,
  Icon,
  type IconName,
  Input,
  ModuleTemplate,
  type ModuleNavItem,
  Pagination,
  Select,
  TableLayout,
  type ThemeMode,
} from "../../../lib/design-system/components";
import { SimonLogo, SimonWatermark } from "../../../shared/brand";
import { appHeaderUser } from "../../../shared/lib/appHeaderUser";
import "../styles/panic.css";

type AlarmPriority = "Alta" | "Media" | "Baja";
type AlarmStatus = "Sin asignar" | "En gestión" | "Gestionada";

interface AlarmRow {
  id: number;
  priority: AlarmPriority;
  plate: string;
  event: string;
  receivedAt: string;
  operator: string;
  status: AlarmStatus;
  imei: string;
  phone: string;
  contact: string;
  location: string;
}

const alarmRows: AlarmRow[] = [
  {
    id: 1,
    priority: "Alta",
    plate: "VHS 365",
    event: "Botón de Pánico",
    receivedAt: "20/03/2026 10:42:51",
    operator: "Pendiente",
    status: "Sin asignar",
    imei: "865456721470360",
    phone: "+57 312 456 7890",
    contact: "Leydi Viviana",
    location: "4.6097, -74.0817",
  },
  {
    id: 2,
    priority: "Alta",
    plate: "GHJ 567",
    event: "Botón de Pánico",
    receivedAt: "20/03/2026 10:41:18",
    operator: "Pendiente",
    status: "Sin asignar",
    imei: "863238070764560",
    phone: "+57 321 394 6648",
    contact: "Adriana Valdes",
    location: "4.6161, -74.0890",
  },
  {
    id: 3,
    priority: "Media",
    plate: "ABC 123",
    event: "Botón de Pánico",
    receivedAt: "20/03/2026 10:38:09",
    operator: "Carlos Mendez",
    status: "En gestión",
    imei: "763218495731245",
    phone: "+57 321 394 6649",
    contact: "Marco Antonio",
    location: "4.6218, -74.0750",
  },
  {
    id: 4,
    priority: "Media",
    plate: "MNO 789",
    event: "Botón de Pánico",
    receivedAt: "20/03/2026 10:35:44",
    operator: "Pendiente",
    status: "Sin asignar",
    imei: "653184920648731",
    phone: "+57 321 394 6650",
    contact: "Lucía Fernández",
    location: "4.6045, -74.0812",
  },
  {
    id: 5,
    priority: "Baja",
    plate: "DEF 901",
    event: "Botón de Pánico",
    receivedAt: "20/03/2026 10:31:20",
    operator: "Sofía Ramos",
    status: "Gestionada",
    imei: "543197842013256",
    phone: "+57 321 394 6651",
    contact: "Diego Pérez",
    location: "4.5988, -74.0942",
  },
  {
    id: 6,
    priority: "Alta",
    plate: "STU 345",
    event: "Botón de Pánico",
    receivedAt: "20/03/2026 10:28:02",
    operator: "Pendiente",
    status: "Sin asignar",
    imei: "432109876543210",
    phone: "+57 321 394 6652",
    contact: "Sofía Ramos",
    location: "4.6120, -74.0675",
  },
  {
    id: 7,
    priority: "Media",
    plate: "VWX 098",
    event: "Botón de Pánico",
    receivedAt: "20/03/2026 10:24:37",
    operator: "Pendiente",
    status: "Sin asignar",
    imei: "321098765432109",
    phone: "+57 321 394 6653",
    contact: "Carlos Mendez",
    location: "4.6191, -74.1013",
  },
  {
    id: 8,
    priority: "Baja",
    plate: "PQR 876",
    event: "Botón de Pánico",
    receivedAt: "20/03/2026 10:20:15",
    operator: "Patricia López",
    status: "En gestión",
    imei: "210987654321098",
    phone: "+57 321 394 6654",
    contact: "Patricia López",
    location: "4.5890, -74.0844",
  },
];

const resolutionOptions = [
  { value: "", label: "Selecciona la resolución" },
  { value: "emergencia-real", label: "Emergencia real" },
  { value: "falsa-alarma", label: "Falsa alarma" },
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
  { id: "panic", iconName: "alert-triangle", label: "Botón de pánico", selected: true },
];

function priorityColor(priority: AlarmPriority) {
  if (priority === "Alta") return "error";
  if (priority === "Media") return "warning";
  return "secondary";
}

function statusColor(status: AlarmStatus) {
  if (status === "Gestionada") return "success";
  if (status === "En gestión") return "primary";
  return "secondary";
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <div className="panic-detail-item">
      <span className="panic-detail-item__icon">
        <Icon name={icon} size={18} />
      </span>
      <span className="panic-detail-item__copy">
        <span>{label}</span>
        <strong>{value}</strong>
      </span>
    </div>
  );
}

function buildColumns(onAssign: (row: AlarmRow) => void): DataTableColumn<AlarmRow>[] {
  return [
    {
      id: "priority",
      header: "Prioridad",
      render: (row) => <Badge color={priorityColor(row.priority)}>{row.priority}</Badge>,
    },
    { id: "plate", header: "Placa", render: (row) => row.plate },
    { id: "event", header: "Evento", render: (row) => row.event },
    { id: "receivedAt", header: "Fecha de Recepción", render: (row) => row.receivedAt },
    { id: "operator", header: "Operador", render: (row) => row.operator },
    {
      id: "status",
      header: "Estado",
      render: (row) => <Badge color={statusColor(row.status)}>{row.status}</Badge>,
    },
    {
      id: "actions",
      header: "Acciones",
      render: (row) => (
        <Button
          variant={row.status === "Gestionada" ? "secundario" : "principal"}
          size="sm"
          disabled={row.status === "Gestionada"}
          onClick={() => onAssign(row)}
        >
          Asignar
        </Button>
      ),
    },
  ];
}

function buildCompactColumns(onAssign: (row: AlarmRow) => void): DataTableColumn<AlarmRow>[] {
  return [
    {
      id: "priority",
      header: "Prioridad",
      render: (row) => <Badge color={priorityColor(row.priority)}>{row.priority}</Badge>,
    },
    { id: "plate", header: "Placa", render: (row) => row.plate },
    { id: "event", header: "Evento", render: (row) => row.event },
    { id: "receivedAt", header: "Recepción", render: (row) => row.receivedAt },
    { id: "operator", header: "Operador", render: (row) => row.operator },
    {
      id: "actions",
      header: "Acciones",
      render: (row) => (
        <Button
          variant={row.status === "Gestionada" ? "secundario" : "principal"}
          size="sm"
          disabled={row.status === "Gestionada"}
          onClick={() => onAssign(row)}
        >
          Asignar
        </Button>
      ),
    },
  ];
}

export function PanicPage() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRow, setSelectedRow] = useState<AlarmRow | null>(null);
  const [resolution, setResolution] = useState("");
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    if (!searchQuery) return alarmRows;
    const q = searchQuery.toLowerCase();
    return alarmRows.filter(
      (row) =>
        row.plate.toLowerCase().includes(q) ||
        row.imei.includes(q) ||
        row.contact.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const columns = useMemo(
    () => buildColumns((row) => {
      setSelectedRow(row);
      setResolution("");
    }),
    [],
  );
  const compactColumns = useMemo(
    () => buildCompactColumns((row) => {
      setSelectedRow(row);
      setResolution("");
    }),
    [],
  );

  const activeAlarm = selectedRow ?? filteredRows[0] ?? alarmRows[0];
  const highPriorityCount = filteredRows.filter((row) => row.priority === "Alta").length;

  return (
    <ModuleTemplate
      themeMode={themeMode}
      onThemeModeChange={setThemeMode}
      user={appHeaderUser}
      title="Gestor de Alarmas"
      navItems={navItems}
      logo={<SimonLogo variant={themeMode === "dark" ? "dark" : "light"} />}
      watermark={<SimonWatermark />}
    >
      <section className="panic-queue">
        <header className="panic-queue__header">
          <div className="panic-queue__title">
            <div className="panic-queue__heading">
              <h2>Alarmas en Cola</h2>
              <Badge color="error">{highPriorityCount} críticas</Badge>
            </div>
            <Input
              leftIcon={<Icon name="search" size={18} />}
              placeholder="Buscar por placa, IMEI o contacto"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="panic-auto-assignment">
            <Button variant="secundario" size="sm">
              Asignación Automática en:
            </Button>
            <div className="panic-countdown" aria-label="Tiempo para asignación automática">
              0:59
            </div>
          </div>
        </header>

        <div className={`panic-queue__content ${selectedRow ? "panic-queue__content--detail" : ""}`.trim()}>
          <div className="panic-queue__table">
            <TableLayout>
              <DataTable
                columns={selectedRow ? compactColumns : columns}
                rows={filteredRows}
                getRowKey={(row) => row.id}
                emptyState="No hay alarmas en cola."
                emptyColSpan={1}
                minWidth={selectedRow ? "812px" : "1320px"}
                maxHeight={selectedRow ? "calc(100vh - 430px)" : "calc(100vh - 360px)"}
                rowClassName={(row) => (selectedRow?.id === row.id ? "panic-row--selected" : "")}
              />
            </TableLayout>
          </div>

          {selectedRow && (
            <aside className="panic-detail" aria-label="Detalle de alarma asignada">
              <div className="panic-map-stage">
                <iframe
                  title="Ubicación de la alarma"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-74.1,4.58,-74.05,4.64&layer=mapnik&marker=4.6097,-74.0817"
                  loading="lazy"
                />
              </div>

              <section className="panic-alarm-card">
                <header className="panic-alarm-card__header">
                  <div>
                    <h3>Placa {activeAlarm.plate}</h3>
                    <Badge color={priorityColor(activeAlarm.priority)}>{activeAlarm.priority}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Cerrar detalle"
                    onClick={() => setSelectedRow(null)}
                  >
                    <Icon name="x" size={18} />
                  </Button>
                </header>

                <div className="panic-location">
                  <Icon name="map-pin" size={18} />
                  <span>{activeAlarm.location}</span>
                  <Button variant="ghost" size="sm" aria-label="Copiar coordenadas">
                    <Icon name="copy" size={14} />
                  </Button>
                </div>

                <div className="panic-detail-grid">
                  <DetailItem icon="bell-dot" label="Tipo de alarma" value={activeAlarm.event} />
                  <DetailItem icon="settings-2" label="AVL" value={activeAlarm.imei} />
                  <DetailItem icon="calendar" label="Fecha del incidente" value={activeAlarm.receivedAt} />
                  <DetailItem icon="message-square" label="Teléfono" value={activeAlarm.phone} />
                  <DetailItem icon="user" label="Contacto" value={activeAlarm.contact} />
                  <DetailItem icon="circle-info" label="Estado del vehículo" value="Alarmado" />
                </div>
              </section>

              <section className="panic-history">
                <h4>Último evento del Historial de Placa</h4>
                <Alert
                  color="neutral"
                  title="Exceso de Velocidad"
                  description="4.6097, -74.0817 · Inicio: 20 Mar, 10:42:51"
                  leftIcon={<Icon name="cmd-speedometer" size={20} />}
                  showCloseIcon={false}
                />
                <Button variant="secundario" size="sm" leftIcon={<Icon name="clock" size={16} />}>
                  Ver Historial de Placa
                </Button>
              </section>

              <section className="panic-resolution">
                <h4>Resolución de Alarma</h4>
                <Select
                  label="Resultado de gestión"
                  required
                  options={resolutionOptions}
                  value={resolution}
                  onChange={setResolution}
                />
                <Button
                  variant="principal"
                  size="sm"
                  leftIcon={<Icon name="bell" size={16} />}
                  disabled={!resolution}
                  onClick={() => setSelectedRow(null)}
                >
                  Finalizar Gestión
                </Button>
              </section>
            </aside>
          )}
        </div>

        <footer className="panic-queue__footer">
          <span>Resultados {filteredRows.length} de 24</span>
          <Pagination currentPage={page} totalPages={4} onPageChange={setPage} />
        </footer>
      </section>
    </ModuleTemplate>
  );
}
