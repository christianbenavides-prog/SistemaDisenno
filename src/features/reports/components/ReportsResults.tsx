import {
  DataTable,
  Pagination,
  TableLayout,
} from "../../../lib/design-system/components";
import type { ReportRow, ReportTableColumn } from "./reportTypes";

interface ReportsResultsProps {
  columns: ReportTableColumn[];
  rows: ReportRow[];
  filteredRowCount: number;
  filtersApplied: boolean;
  currentPage: number;
  totalPages: number;
  selectedRowIds: Set<number>;
  onPageChange: (page: number) => void;
}

export function ReportsResults({
  columns,
  rows,
  filteredRowCount,
  filtersApplied,
  currentPage,
  totalPages,
  selectedRowIds,
  onPageChange,
}: ReportsResultsProps) {
  return (
    <TableLayout
      className="reports-table-shell"
      rowCount={filtersApplied ? `Resultados ${rows.length} de ${filteredRowCount}` : undefined}
      pagination={
        filtersApplied
          ? <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
          : undefined
      }
    >
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        rowClassName={(row) => (selectedRowIds.has(row.id) ? "reports-row--selected" : "")}
        minWidth="53.125rem"
        emptyState="Usa los filtros para realizar tu primera consulta."
      />
    </TableLayout>
  );
}
