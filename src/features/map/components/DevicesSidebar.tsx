import { useEffect, useState } from "react";
import { useScada } from "../../../app/remote/ScadaProvider";
import { MainToolbar } from "./traccar/MainToolbar";
import { DeviceList } from "./traccar/DeviceList";

export function DevicesSidebar({
  selectedDeviceId,
  onSelectDevice,
}: Readonly<{
  selectedDeviceId: number | null;
  onSelectDevice: (deviceId: number | null) => void;
}>) {
  useScada();
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedKeyword(keyword.trim()), 500);
    return () => clearTimeout(id);
  }, [keyword]);

  return (
    <aside className="scada-right-panel flex h-full w-[360px] shrink-0 flex-col">
      <div className="flex h-full flex-col">
        <div className="scada-right-panel__header">
          <MainToolbar keyword={keyword} setKeyword={setKeyword} />
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          <DeviceList
            keyword={debouncedKeyword}
            selectedDeviceId={selectedDeviceId}
            onSelectDevice={(id) => onSelectDevice(id)}
          />
        </div>

        {/* Pagination */}
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
            <button type="button" className="scada-pagination__btn">20</button>
            <button type="button" className="scada-pagination__btn">21</button>
            <button type="button" className="scada-pagination__btn">22</button>
            <button type="button" className="scada-pagination__btn" aria-label="Siguiente">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3l5 5-5 5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
