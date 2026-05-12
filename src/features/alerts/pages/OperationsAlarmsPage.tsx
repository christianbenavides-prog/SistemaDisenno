import { useMemo, useRef, useState } from "react";
import { useScada } from "../../../app/remote/ScadaProvider";
import {
  Badge,
  Button,
  DataTable,
  Icon,
  Input,
  Modal,
  ModuleTemplate,
  Pagination,
  Select,
  TextArea,
  type DataTableColumn,
  type ThemeMode,
} from "../../../lib/design-system/components";
import { SimonLogo } from "../../../lib/design-system/components/SimonLogo";
import {
  HIST_ALARM_TYPE_OPTS,
  TIPIFICACION_OPTS,
} from "../constants/alarmConstants";
import {
  type AlarmRow,
  useOperationsAlarmsData,
} from "../hooks/useOperationsAlarmsData";
import "../styles/alarm-manager.css";

type AlarmPriority = "Critica" | "Advertencia";

type ManagedAlarmRow = AlarmRow & {
  alarmAge: string;
  receptionTime: string;
  positionText: string;
  priority: AlarmPriority;
};

const DEMO_ALARMS: ManagedAlarmRow[] = [
  ["VHS 365", "Boton de panico", "Critica"],
  ["UIO 432", "Boton de panico", "Critica"],
  ["ZXC 451", "Boton de panico", "Critica"],
  ["VBN 987", "Ralenti (ON/Detenido)", "Critica"],
  ["LKJ 234", "Ralenti (ON/Detenido)", "Critica"],
  ["KDG 325", "Remolque/Manipulacion", "Critica"],
  ["SWT 356", "Bateria baja", "Critica"],
  ["FWE 678", "Bateria baja", "Critica"],
  ["GFV 656", "Desconexion GPRS", "Critica"],
  ["RTY 321", "Exceso de velocidad", "Critica"],
  ["UDE 678", "Conduccion agresiva", "Critica"],
  ["POI 890", "Mantenimiento de odometro", "Critica"],
  ["ASD 543", "Conexion / Desconexion GPRS", "Critica"],
  ["FGH 765", "Entrada a geocerca", "Advertencia"],
  ["HDO 348", "Salida de geocerca", "Advertencia"],
  ["DOF 324", "Encendido / Apagado", "Advertencia"],
].map(([plate, alarm, priority], index) => ({
  id: `demo-${index + 1}`,
  deviceId: 985 + index,
  plate,
  alarm,
  fixTime: "2026-03-20T10:19:52-05:00",
  latitude: 4.6097,
  longitude: -74.0817,
  operators: ["Sin operador"],
  alarmAge: index < 13 ? "02:34" : "00:48",
  receptionTime: index < 9 ? "20/03/2026 10:19:52" : "19/03/2026 16:24:12",
  positionText: "4.6097, -74.0817",
  priority: priority as AlarmPriority,
}));

function formatDateTime(value: unknown) {
  const raw =
    typeof value === "string" || typeof value === "number" ? String(value) : "";
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function getAlarmAge(value: unknown) {
  const raw =
    typeof value === "string" || typeof value === "number" ? String(value) : "";
  const date = raw ? new Date(raw) : null;
  if (!date || Number.isNaN(date.getTime())) return "00:00";
  const diffMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function normalizeAlarm(row: AlarmRow): ManagedAlarmRow {
  const hasCoordinates =
    typeof row.latitude === "number" && typeof row.longitude === "number";
  const alarmName = row.alarm.toLowerCase();

  return {
    ...row,
    alarmAge: getAlarmAge(row.fixTime),
    receptionTime: formatDateTime(row.fixTime) || "Sin fecha",
    positionText: hasCoordinates
      ? `${row.latitude?.toFixed(4)}, ${row.longitude?.toFixed(4)}`
      : "Sin ubicacion",
    priority:
      alarmName.includes("panic") || alarmName.includes("panico")
        ? "Critica"
        : "Advertencia",
  };
}

function PriorityBadge({ value }: Readonly<{ value: AlarmPriority | "Crítica" }>) {
  return (
    <Badge color={value === "Advertencia" ? "warning" : "error"} shape="square">
      {value}
    </Badge>
  );
}

export function OperationsAlarmsPage() {
  const { config } = useScada();
  const { alarms, loading, error } = useOperationsAlarmsData();
  const [themeMode, setThemeMode] = useState<ThemeMode>(
    (config.themeMode ?? "light") as ThemeMode,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [alarmType, setAlarmType] = useState("");
  const [operatorFilter, setOperatorFilter] = useState("");
  const [typification, setTypification] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolutionOpen, setResolutionOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [detailWidth, setDetailWidth] = useState(420);
  const dragStartRef = useRef<{ x: number; width: number } | null>(null);

  const rows = useMemo(() => {
    const normalized = alarms.map(normalizeAlarm);
    return normalized.length ? normalized : DEMO_ALARMS;
  }, [alarms]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      const operator = row.operators[0] ?? "Sin operador";
      const matchesSearch =
        !query ||
        row.plate.toLowerCase().includes(query) ||
        row.alarm.toLowerCase().includes(query) ||
        String(row.deviceId).includes(query);
      const matchesType = !alarmType || row.alarm === alarmType;
      const matchesOperator =
        !operatorFilter ||
        (operatorFilter === "unassigned"
          ? operator === "Sin operador"
          : operator === operatorFilter);
      return matchesSearch && matchesType && matchesOperator;
    });
  }, [alarmType, operatorFilter, rows, search]);

  const selected = selectedId
    ? rows.find((row) => row.id === selectedId) ?? null
    : null;

  const alarmTypes = useMemo(
    () => Array.from(new Set(rows.map((row) => row.alarm))).sort(),
    [rows],
  );

  const operatorOptions = useMemo(() => {
    const labels = Array.from(
      new Set(rows.map((row) => row.operators[0] ?? "Sin operador")),
    ).sort();
    return [
      { value: "", label: "Operador" },
      { value: "unassigned", label: "Sin operador" },
      ...labels
        .filter((label) => label !== "Sin operador")
        .map((label) => ({ value: label, label })),
    ];
  }, [rows]);

  const columns = useMemo<DataTableColumn<ManagedAlarmRow>[]>(
    () => [
      {
        id: "priority",
        header: "Prioridad",
        render: (row) => <PriorityBadge value={row.priority} />,
      },
      { id: "age", header: "TAC", render: (row) => row.alarmAge },
      {
        id: "plate",
        header: "Placa",
        render: (row) => (
          <Button
            type="button"
            size="sm"
            variant="link"
            onClick={() => setSelectedId(row.id)}
          >
            {row.plate}
          </Button>
        ),
      },
      { id: "alarm", header: "Tipo de Alarma", render: (row) => row.alarm },
      { id: "date", header: "Recepción", render: (row) => row.receptionTime },
      {
        id: "operator",
        header: "Operador",
        render: (row) => row.operators[0] ?? "Sin operador",
      },
      {
        id: "action",
        header: "Acciones",
        render: (row) => (
          <Button
            type="button"
            size="sm"
            variant="secundario"
            onClick={() => setSelectedId(row.id)}
          >
            Asignar
          </Button>
        ),
      },
    ],
    [],
  );

  const finishDisabled = !typification || !resolutionNote.trim();
  const minDetailWidth = 420;
  const maxDetailWidth = Math.round(minDetailWidth * 1.7);

  const stopResize = () => {
    dragStartRef.current = null;
    window.removeEventListener("pointermove", resizeDetail);
    window.removeEventListener("pointerup", stopResize);
  };

  const resizeDetail = (event: PointerEvent) => {
    const start = dragStartRef.current;
    if (!start) return;
    const nextWidth = start.width + (start.x - event.clientX);
    setDetailWidth(Math.min(maxDetailWidth, Math.max(minDetailWidth, nextWidth)));
  };

  const startResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    dragStartRef.current = { x: event.clientX, width: detailWidth };
    window.addEventListener("pointermove", resizeDetail);
    window.addEventListener("pointerup", stopResize);
  };

  return (
    <ModuleTemplate
      className="alarm-manager"
      title="Gestor de Alarmas"
      themeMode={themeMode}
      onThemeModeChange={setThemeMode}
      user={{ name: "Mario Rojas", role: "Administrador" }}
      logo={<SimonLogo variant={themeMode === "dark" ? "dark" : "light"} />}
      footer="Version 1.0.0"
      navItems={[
        { id: "map", label: "Mapa", iconName: "map-pinned" },
        { id: "vehicles", label: "Vehiculos", iconName: "cmd-car" },
        { id: "avl", label: "Configuracion AVL", iconName: "settings-2" },
        {
          id: "alerts",
          label: "Gestor de Alarmas",
          iconName: "bell-dot",
          selected: true,
        },
        { id: "reports", label: "Reportes", iconName: "chart-column" },
        { id: "commands", label: "Comandos", iconName: "cmd-speedometer" },
        { id: "geofences", label: "Geocercas", iconName: "map-pin" },
        { id: "admin", label: "Administrativo", iconName: "user" },
        { id: "settings", label: "Preferencias", iconName: "settings" },
      ]}
    >
      <div
        className={`alarm-manager__layout ${selected ? "" : "alarm-manager__layout--table-only"}`}
        style={{ "--alarm-detail-width": `${detailWidth}px` } as React.CSSProperties}
      >
        {error ? <div className="alarm-manager__error">{error}</div> : null}

        <section className="ds-app-shell__panel ds-app-shell__panel--flex alarm-manager__queue">
          <div className="alarm-manager__section-header">
            <h2>Alarmas en Cola</h2>
          </div>

          <div className="alarm-manager__filters">
            <Input
              placeholder="Buscar por placa, IMEI o ICCID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              leftIcon={<Icon name="search" size={16} />}
            />
            <Select
              value={alarmType}
              placeholder="Tipo de alarma"
              options={[
                { value: "", label: "Tipo de alarma" },
                ...alarmTypes.map((type) => ({ value: type, label: type })),
              ]}
              onChange={setAlarmType}
            />
            <Select
              value={operatorFilter}
              placeholder="Operador"
              options={operatorOptions}
              onChange={setOperatorFilter}
            />
          </div>

          <DataTable
            columns={columns}
            rows={filteredRows}
            getRowKey={(row) => row.id}
            rowClassName={(row) =>
              row.id === selected?.id ? "alarm-manager__row--selected" : ""
            }
            emptyState={loading ? "Cargando alarmas..." : "No hay alarmas disponibles"}
            minWidth={980}
          />

          <div className="alarm-manager__pagination">
            <span>Resultados 14 de 24</span>
            <Pagination currentPage={page} totalPages={4} onPageChange={setPage} />
          </div>
        </section>

        {selected ? (
          <aside className="ds-app-shell__panel ds-app-shell__panel--fixed alarm-manager__detail">
            <button
              type="button"
              className="alarm-manager__resize-handle"
              aria-label="Cambiar ancho del panel de detalle"
              onPointerDown={startResize}
            />
            <div className="alarm-manager__detail-header">
              <div className="alarm-manager__plate-block">
                <span>Placa</span>
                <h2>{selected.plate}</h2>
                <Button
                  type="button"
                  size="xs"
                  variant="link"
                  leftIcon={<Icon name="eye" size={14} />}
                >
                  Ver Mas Detalles
                </Button>
              </div>
              <div className="alarm-manager__detail-actions-top">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-label="Cerrar panel de detalle"
                  onClick={() => setSelectedId(null)}
                >
                  <Icon name="x" size={20} />
                </Button>
              </div>
            </div>

            <dl className="alarm-manager__facts">
              <div className="alarm-manager__fact">
                <span className="alarm-manager__fact-icon alarm-manager__fact-icon--danger">
                  <Icon name="alert-triangle" size={22} />
                </span>
                <span>
                  <dt>Estado del vehiculo</dt>
                  <dd className="alarm-manager__danger">Alarmado</dd>
                </span>
              </div>
              <div className="alarm-manager__fact">
                <span className="alarm-manager__fact-icon">
                  <Icon name="calendar" size={22} />
                </span>
                <span>
                  <dt>Fecha del incidente</dt>
                  <dd>{selected.receptionTime}</dd>
                </span>
              </div>
              <div className="alarm-manager__fact">
                <span className="alarm-manager__fact-icon alarm-manager__fact-icon--danger">
                  <Icon name="bell" size={22} />
                </span>
                <span>
                  <dt>Tipo de alarma</dt>
                  <dd className="alarm-manager__danger">{selected.alarm}</dd>
                </span>
              </div>
              <div className="alarm-manager__fact">
                <span className="alarm-manager__fact-icon">
                  <Icon name="phone" size={22} />
                </span>
                <span>
                  <dt>Telefono</dt>
                  <dd className="alarm-manager__danger">+57 312 456 7890</dd>
                </span>
              </div>
              <div className="alarm-manager__fact">
                <span className="alarm-manager__fact-icon">
                  <Icon name="microchip" size={22} />
                </span>
                <span>
                  <dt>AVL</dt>
                  <dd>865456721470360</dd>
                </span>
              </div>
              <div className="alarm-manager__fact">
                <span className="alarm-manager__fact-icon">
                  <Icon name="user" size={22} />
                </span>
                <span>
                  <dt>Contacto</dt>
                  <dd>Leydi Viviana</dd>
                </span>
              </div>
            </dl>

            <div className="alarm-manager__map-row">
              <span>
                <Icon name="map-pin" size={16} />
                {selected.positionText}
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  className="alarm-manager__copy-action"
                  aria-label="Copiar coordenadas"
                >
                  <Icon name="copy" size={14} />
                </Button>
              </span>
              <span>
                <Icon name="google-maps" size={22} />
                <Icon name="message-square" size={22} />
              </span>
            </div>

            <section className="alarm-manager__history">
              <h3>Ultimo evento del Historial de Placa</h3>
              {["Exceso de Velocidad", "Remolque"].map((item) => (
                <article key={item}>
                  <div>
                    <Icon
                      name={item === "Remolque" ? "cmd-car" : "cmd-speedometer"}
                      size={16}
                    />
                    <strong>{item}</strong>
                    <PriorityBadge value="Crítica" />
                  </div>
                  <p>
                    <Icon name="clock" size={14} />
                    Inicio: 20 Mar, 10:42:51
                  </p>
                  <p>
                    <Icon name="map-pin" size={14} />
                    4.6097, -74.0817
                  </p>
                </article>
              ))}
              <Button
                type="button"
                size="md"
                variant="secundario"
                leftIcon={<Icon name="refresh-cw" size={18} />}
              >
                Ver Historial de Placa
              </Button>
            </section>

            <section className="alarm-manager__resolution">
              <h3>Resolucion de Alarma</h3>
              <Select
                label="Tipificacion del evento"
                required
                value={typification}
                placeholder="Selecciona un estado"
                options={TIPIFICACION_OPTS.map((option) => ({
                  value: option.value,
                  label: option.label || "Selecciona un estado",
                }))}
                onChange={setTypification}
              />
              <Button
                type="button"
                size="md"
                variant="principal"
                leftIcon={<Icon name="plus" size={18} />}
                onClick={() => setResolutionOpen(true)}
              >
                Agregar Detalles
              </Button>
            </section>

            <div className="alarm-manager__sticky-actions">
              <Button
                type="button"
                size="md"
                variant="principal"
                className="alarm-manager__finish-button"
                disabled={finishDisabled}
                leftIcon={<Icon name="bell" size={18} />}
                onClick={() => setResolutionOpen(true)}
              >
                Finalizar Gestion
              </Button>
            </div>
          </aside>
        ) : null}
      </div>

      {resolutionOpen && selected ? (
        <div className="alarm-manager__modal-layer">
          <button
            type="button"
            className="alarm-manager__modal-backdrop"
            aria-label="Cerrar"
            onClick={() => setResolutionOpen(false)}
          />
          <Modal
            className="alarm-manager__modal"
            title={`Resolucion de Alarma - ${selected.plate}`}
            primaryLabel="Guardar"
            secondaryLabel="Cancelar"
            onClose={() => setResolutionOpen(false)}
            onSecondaryClick={() => setResolutionOpen(false)}
            onPrimaryClick={() => {
              if (finishDisabled) return;
              setResolutionOpen(false);
              setResolutionNote("");
            }}
          >
            <div className="alarm-manager__modal-form">
              <Select
                label="Tipo de resolucion"
                value={typification}
                options={TIPIFICACION_OPTS.map((option) => ({
                  value: option.value,
                  label: option.label || "Seleccionar",
                }))}
                onChange={setTypification}
              />
              <TextArea
                label="Describe el motivo"
                placeholder="Escribe observaciones para el cierre de la alarma."
                value={resolutionNote}
                onChange={(event) => setResolutionNote(event.target.value)}
              />
              <Select
                label="Historico asociado"
                value=""
                options={HIST_ALARM_TYPE_OPTS}
              />
            </div>
          </Modal>
        </div>
      ) : null}
    </ModuleTemplate>
  );
}
