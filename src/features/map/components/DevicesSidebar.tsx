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
      <DeviceList
        keyword={keyword}
        selectedDeviceId={selectedDeviceId}
        onSelectDevice={(id) => onSelectDevice(id)}
        onShowDetail={onShowDetail}
      />
    </div>
  );
}
