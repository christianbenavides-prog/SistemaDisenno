import { useCallback, useEffect, useMemo, useRef } from "react";
import { DeviceRow } from "./DeviceRow";
import { usePagedDevices } from "../../hooks/usePagedDevices";

export function DeviceList({
  keyword,
  selectedDeviceId,
  onSelectDevice,
  onShowDetail,
}: Readonly<{
  keyword: string;
  selectedDeviceId: number | null;
  onSelectDevice: (deviceId: number) => void;
  onShowDetail?: (deviceId: number) => void;
}>) {
  const { items, initialLoading, loading, error, hasMore, loadMore } = usePagedDevices(keyword);
  const listRef = useRef<HTMLDivElement | null>(null);

  const onNearBottom = useCallback(() => {
    if (!hasMore || loading) return;
    loadMore();
  }, [hasMore, loadMore, loading]);

  useEffect(() => {
    const container = listRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight < 400) onNearBottom();
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [onNearBottom]);

  const rows = useMemo(() => items, [items]);

  if (initialLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="scada-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 text-sm text-error">{error}</div>
    );
  }

  if (!loading && rows.length === 0) {
    return (
      <div className="p-3 text-sm text-text-muted">Sin dispositivos aún</div>
    );
  }

  return (
    <div
      ref={listRef}
      className="scada-scrollbar flex h-full flex-col gap-3 overflow-y-auto"
    >
      {rows.map((d) => (
        <DeviceRow
          key={String(d.id)}
          device={d}
          selected={selectedDeviceId === Number(d.id)}
          onSelect={() => onSelectDevice(Number(d.id))}
          onShowDetail={onShowDetail ? () => onShowDetail(Number(d.id)) : undefined}
        />
      ))}
      {loading && hasMore && (
        <div className="flex items-center justify-center py-6">
          <span className="scada-spinner" />
        </div>
      )}
    </div>
  );
}
