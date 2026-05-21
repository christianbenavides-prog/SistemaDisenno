import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  DataTable,
  GeozonaCard,
  Icon,
  Input,
  TableLayout,
  type DataTableColumn,
} from "../../../lib/design-system/components";
import "../styles/geofences.css";

type GeofenceStatus = "Activa" | "Pausada" | "Alerta";

interface GeofenceRow {
  id: number;
  name: string;
  type: string;
  vehicles: number;
  status: GeofenceStatus;
  updatedAt: string;
}

const geofences: GeofenceRow[] = [
  { id: 1, name: "Zona Norte", type: "Poligono", vehicles: 18, status: "Activa", updatedAt: "21/05/2026 09:32" },
  { id: 2, name: "Bodega Central", type: "Circular", vehicles: 6, status: "Activa", updatedAt: "21/05/2026 08:48" },
  { id: 3, name: "Cliente Chapinero", type: "Poligono", vehicles: 3, status: "Alerta", updatedAt: "20/05/2026 17:12" },
  { id: 4, name: "Autopista", type: "Corredor", vehicles: 11, status: "Pausada", updatedAt: "19/05/2026 14:20" },
];

function badgeFor(status: GeofenceStatus) {
  if (status === "Activa") return <Badge color="success">{status}</Badge>;
  if (status === "Alerta") return <Badge color="error">{status}</Badge>;
  return <Badge color="secondary">{status}</Badge>;
}

export function GeofencesPage() {
  const [query, setQuery] = useState("");

  const filteredGeofences = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return geofences;
    return geofences.filter((item) =>
      [item.name, item.type, item.status].some((value) =>
        value.toLowerCase().includes(needle),
      ),
    );
  }, [query]);

  const columns = useMemo<DataTableColumn<GeofenceRow>[]>(
    () => [
      { id: "name", header: "Geocerca", render: (row) => row.name },
      { id: "type", header: "Tipo", render: (row) => row.type },
      { id: "vehicles", header: "Vehiculos", render: (row) => row.vehicles },
      { id: "status", header: "Estado", render: (row) => badgeFor(row.status) },
      { id: "updatedAt", header: "Actualizacion", render: (row) => row.updatedAt },
    ],
    [],
  );

  return (
    <div className="geofences-page">
      <section className="geofences-page__toolbar">
        <Input
          placeholder="Buscar geocerca"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          leftIcon={<Icon name="search" size={16} />}
        />
        <Button size="sm" leftIcon={<Icon name="plus" size={16} />}>
          Nueva
        </Button>
      </section>

      <section className="geofences-page__cards" aria-label="Resumen de geocercas">
        {filteredGeofences.map((item) => (
          <GeozonaCard
            key={item.id}
            title={item.name}
            subtitle={item.type}
            accent={item.status === "Alerta" ? "error" : item.status === "Pausada" ? "neutral" : "success"}
            icon={<Icon name="map-pin" size={20} />}
            meta={[
              { icon: <Icon name="cmd-car" size={14} />, text: `${item.vehicles} vehiculos` },
              { icon: <Icon name="clock" size={14} />, text: item.updatedAt },
            ]}
            actions={
              <>
                <Button variant="ghost" size="xs" aria-label={`Editar ${item.name}`}>
                  <Icon name="edit" size={16} />
                </Button>
                <Button variant="ghost" size="xs" aria-label={`Ver ${item.name}`}>
                  <Icon name="eye" size={16} />
                </Button>
              </>
            }
          />
        ))}
      </section>

      <section className="geofences-page__table">
        <TableLayout>
          <DataTable
            columns={columns}
            rows={filteredGeofences}
            getRowKey={(row) => row.id}
            emptyState="No hay geocercas con esos filtros."
          />
        </TableLayout>
      </section>
    </div>
  );
}
