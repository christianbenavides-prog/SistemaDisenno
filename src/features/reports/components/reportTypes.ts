import type { DataTableColumn } from "../../../lib/design-system/components";

export interface ReportRow {
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

export interface ReportColumnDef {
  id: string;
  header: string;
  render: (row: ReportRow) => string;
}

export type ReportTableColumn = DataTableColumn<ReportRow>;
