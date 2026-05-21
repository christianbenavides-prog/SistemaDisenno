import { DeviceList } from "./traccar/DeviceList";

export function DevicesSidebar({
  keyword,
  selectedDeviceId,
  onSelectDevice,
  onShowDetail,
}: Readonly<{
  keyword: string;
  selectedDeviceId: number | null;
  onSelectDevice: (deviceId: number | null) => void;
  onShowDetail: (deviceId: number) => void;
}>) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-hidden">
        <DeviceList
          keyword={keyword}
          selectedDeviceId={selectedDeviceId}
          onSelectDevice={(id) => onSelectDevice(id)}
          onShowDetail={onShowDetail}
        />
      </div>

      <div className="scada-pagination">
        <div className="flex w-full items-center justify-center gap-1">
          <button type="button" className="scada-pagination__btn" aria-label="Anterior">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 3l-5 5 5 5" />
            </svg>
          </button>
          <button type="button" className="scada-pagination__btn scada-pagination__btn--active">1</button>
          <button type="button" className="scada-pagination__btn">2</button>
          <button type="button" className="scada-pagination__btn">3</button>
          <span className="px-1 text-[11px] text-text-muted">…</span>
          <button type="button" className="scada-pagination__btn" aria-label="Siguiente">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3l5 5-5 5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
