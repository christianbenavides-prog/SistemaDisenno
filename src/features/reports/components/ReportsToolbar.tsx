import {
  Button,
  Checkbox,
  ChipInput,
  DatePicker,
  Dropdown,
  Icon,
} from "../../../lib/design-system/components";
import type { ReportColumnDef } from "./reportTypes";

interface ReportsToolbarProps {
  selectedPlates: string[];
  period: string;
  filtersOpen: boolean;
  columnsOpen: boolean;
  filtersApplied: boolean;
  hasPendingFilter: boolean;
  visibleColumnIds: Set<string>;
  toggleableColumnIds: string[];
  columns: ReportColumnDef[];
  onFiltersOpenChange: (open: boolean) => void;
  onColumnsOpenChange: (open: boolean) => void;
  onSelectedPlatesChange: (plates: string[]) => void;
  onPeriodChange: (period: string) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  onToggleColumn: (columnId: string) => void;
  onToggleAllColumns: () => void;
}

export function ReportsToolbar({
  selectedPlates,
  period,
  filtersOpen,
  columnsOpen,
  filtersApplied,
  hasPendingFilter,
  visibleColumnIds,
  toggleableColumnIds,
  columns,
  onFiltersOpenChange,
  onColumnsOpenChange,
  onSelectedPlatesChange,
  onPeriodChange,
  onClearFilters,
  onApplyFilters,
  onToggleColumn,
  onToggleAllColumns,
}: ReportsToolbarProps) {
  return (
    <section className="reports-toolbar">
      <button
        type="button"
        className="reports-toolbar__summary"
        aria-expanded={filtersOpen}
        onClick={() => onFiltersOpenChange(!filtersOpen)}
      >
        <span>Filtros</span>
        <Icon name={filtersOpen ? "chevron-up" : "chevron-down"} size={18} />
      </button>

      <div className={`reports-toolbar__body ${filtersOpen ? "reports-toolbar__body--open" : ""}`}>
        <div className="reports-toolbar__filters">
          <ChipInput
            label="Placas"
            placeholder="Escribir placa y presionar Enter"
            value={selectedPlates}
            onChange={onSelectedPlatesChange}
            icon={<Icon name="search" size={20} />}
          />
          <DatePicker
            placeholder="Periodo de tiempo"
            value={period}
            onChange={(formatted) => onPeriodChange(formatted)}
            icon={<Icon name="calendar" size={20} />}
          />
        </div>

        <div className="reports-toolbar__actions">
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Borrar todo
          </Button>
          <Button size="xs" disabled={!hasPendingFilter} onClick={onApplyFilters}>
            Aplicar
          </Button>

          <Dropdown
            open={columnsOpen}
            onOpenChange={onColumnsOpenChange}
            trigger={
              <Button
                variant={filtersApplied ? "secundario" : "ghost"}
                size="sm"
                rightIcon={<Icon name="settings" size={16} />}
                disabled={!filtersApplied}
              >
                Columnas
              </Button>
            }
          >
            <Checkbox
              checked={visibleColumnIds.size === toggleableColumnIds.length}
              onChange={onToggleAllColumns}
              label="Todas"
            />
            {toggleableColumnIds.map((columnId) => {
              const column = columns.find((item) => item.id === columnId);
              if (!column) return null;
              return (
                <Checkbox
                  key={columnId}
                  checked={visibleColumnIds.has(columnId)}
                  onChange={() => onToggleColumn(columnId)}
                  label={column.header}
                />
              );
            })}
          </Dropdown>

          <Button
            variant="secundario"
            size="sm"
            rightIcon={<Icon name="download" size={16} />}
            disabled={!filtersApplied}
          >
            Exportar
          </Button>
        </div>
      </div>
    </section>
  );
}
