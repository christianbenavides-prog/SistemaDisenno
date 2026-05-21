import { Navigate, Route, Routes } from "react-router-dom";
import ScadaModule from "./remote/ScadaModule";

const mockDevices: Record<number, any> = {
  1: {
    id: 1, name: "DEF 123", uniqueId: "860123456789012", status: "online", category: "car",
    lastUpdate: "2026-03-05T11:30:00Z",
    attributes: { plate: "DEF 123", alarm: "movement", company: "TransCol S.A.", contact: "Carlos Pérez", phone: "+57 310 555 1234", email: "carlos@transcol.co", model: "Chevrolet N300", manufacturer: "Queclink", batteryLevel: 85, sat: 7, battery: "13.342" },
  },
  2: {
    id: 2, name: "XYZ 456", uniqueId: "860234567890123", status: "online", category: "car",
    lastUpdate: "2026-03-05T11:30:00Z",
    attributes: { plate: "XYZ 456", alarm: "powerCut", company: "LogiFlota Ltda.", contact: "Ana Martínez", phone: "+57 311 555 5678", email: "ana@logiflota.co", model: "Renault Kangoo", manufacturer: "Teltonika", batteryLevel: 62, sat: 5, battery: "12.800" },
  },
  3: {
    id: 3, name: "JKL 154", uniqueId: "860345678901234", status: "offline", category: "car",
    lastUpdate: "2026-03-05T11:30:00Z",
    attributes: { plate: "JKL 154", company: "Envíos Rápidos", contact: "Luis Gómez", phone: "+57 312 555 9012", email: "luis@enviosrapidos.co", model: "Kia Bongo", manufacturer: "Concox", batteryLevel: 40, sat: 3, battery: "11.950" },
  },
  4: {
    id: 4, name: "QRS 101", uniqueId: "860456789012345", status: "online", category: "car",
    lastUpdate: "2026-03-05T11:30:00Z",
    attributes: { plate: "QRS 101", alarm: "movement", company: "MotoExpress", contact: "María López", phone: "+57 313 555 3456", email: "maria@motoexpress.co", model: "NKR", manufacturer: "Queclink", batteryLevel: 95, sat: 3, battery: "13.342" },
  },
  5: {
    id: 5, name: "WRE 547", uniqueId: "860567890123456", status: "offline", category: "car",
    lastUpdate: "2026-03-05T11:30:00Z",
    attributes: { plate: "WRE 547", company: "TransCol S.A.", contact: "Pedro Ruiz", phone: "+57 314 555 7890", email: "pedro@transcol.co", model: "Hyundai HD65", manufacturer: "Teltonika", batteryLevel: 20, sat: 0, battery: "10.200" },
  },
  6: {
    id: 6, name: "ABC 789", uniqueId: "860678901234567", status: "online", category: "car",
    lastUpdate: "2026-03-05T10:15:00Z",
    attributes: { plate: "ABC 789", alarm: "overspeed", company: "LogiFlota Ltda.", contact: "Diego Herrera", phone: "+57 315 555 2345", email: "diego@logiflota.co", model: "Chevrolet NHR", manufacturer: "Queclink", batteryLevel: 78, sat: 8, battery: "14.100" },
  },
  7: {
    id: 7, name: "MNO 321", uniqueId: "860789012345678", status: "online", category: "car",
    lastUpdate: "2026-03-05T09:45:00Z",
    attributes: { plate: "MNO 321", alarm: "geofenceExit", company: "Envíos Rápidos", contact: "Sandra Gil", phone: "+57 316 555 6789", email: "sandra@enviosrapidos.co", model: "Renault Master", manufacturer: "Concox", batteryLevel: 55, sat: 6, battery: "12.500" },
  },
  8: {
    id: 8, name: "TUV 654", uniqueId: "860890123456789", status: "offline", category: "car",
    lastUpdate: "2026-03-04T22:30:00Z",
    attributes: { plate: "TUV 654", company: "MotoExpress", contact: "Jorge Díaz", phone: "+57 317 555 0123", email: "jorge@motoexpress.co", model: "Fuso Canter", manufacturer: "Teltonika", batteryLevel: 10, sat: 0, battery: "9.800" },
  },
  9: {
    id: 9, name: "GHI 987", uniqueId: "860901234567890", status: "online", category: "car",
    lastUpdate: "2026-03-05T11:28:00Z",
    attributes: { plate: "GHI 987", alarm: "sos", company: "TransCol S.A.", contact: "Valentina Soto", phone: "+57 318 555 4567", email: "valentina@transcol.co", model: "Chevrolet NPR", manufacturer: "Queclink", batteryLevel: 90, sat: 9, battery: "13.800" },
  },
  10: {
    id: 10, name: "PLM 246", uniqueId: "861012345678901", status: "online", category: "car",
    lastUpdate: "2026-03-05T11:25:00Z",
    attributes: { plate: "PLM 246", alarm: "lowBattery", company: "LogiFlota Ltda.", contact: "Camilo Torres", phone: "+57 319 555 8901", email: "camilo@logiflota.co", model: "Hino Dutro", manufacturer: "Concox", batteryLevel: 15, sat: 4, battery: "11.200" },
  },
};

const mockPositions = [
  { deviceId: 1, latitude: 4.6580, longitude: -74.0936, speed: 45, fixTime: "2026-03-05T11:30:00Z", attributes: { totalDistance: 125400, distance: 1200, motion: true, ignition: true, power: 13.342, battery: 4.15, sat: 7, hdop: 0.9, rssi: 22, operator: "Claro" } },
  { deviceId: 2, latitude: 4.7110, longitude: -74.0723, speed: 0, fixTime: "2026-03-05T11:30:00Z", attributes: { totalDistance: 89200, distance: 0, motion: false, ignition: false, power: 12.800, battery: 3.90, alarm: "powerCut", sat: 5, hdop: 1.2, rssi: 18, operator: "Movistar" } },
  { deviceId: 3, latitude: 4.5890, longitude: -74.1542, speed: 0, fixTime: "2026-03-05T11:30:00Z", attributes: { totalDistance: 201000, distance: 0, motion: false, ignition: false, power: 11.950, battery: 3.70, sat: 3, hdop: 2.1, rssi: 12, operator: "Tigo" } },
  { deviceId: 4, latitude: 4.6320, longitude: -74.0651, speed: 32, fixTime: "2026-03-05T11:30:00Z", attributes: { totalDistance: 67800, distance: 800, motion: true, ignition: true, power: 13.342, battery: 4.20, sat: 3, hdop: 1.8, rssi: 25, operator: "Claro" } },
  { deviceId: 5, latitude: 4.5421, longitude: -74.1200, speed: 0, fixTime: "2026-03-05T11:30:00Z", attributes: { totalDistance: 340500, distance: 0, motion: false, ignition: false, power: 10.200, battery: 3.20, sat: 0, hdop: 0, rssi: 5, operator: "Movistar" } },
  { deviceId: 6, latitude: 4.6780, longitude: -74.0480, speed: 95, fixTime: "2026-03-05T10:15:00Z", attributes: { totalDistance: 156700, distance: 3400, motion: true, ignition: true, power: 14.100, battery: 4.30, alarm: "overspeed", sat: 8, hdop: 0.7, rssi: 28, operator: "Claro" } },
  { deviceId: 7, latitude: 4.7450, longitude: -74.0300, speed: 60, fixTime: "2026-03-05T09:45:00Z", attributes: { totalDistance: 98400, distance: 2100, motion: true, ignition: true, power: 12.500, battery: 3.85, alarm: "geofenceExit", sat: 6, hdop: 1.0, rssi: 20, operator: "Tigo" } },
  { deviceId: 8, latitude: 4.5100, longitude: -74.1800, speed: 0, fixTime: "2026-03-04T22:30:00Z", attributes: { totalDistance: 278900, distance: 0, motion: false, ignition: false, power: 9.800, battery: 2.90, sat: 0, hdop: 0, rssi: 3, operator: "Movistar" } },
  { deviceId: 9, latitude: 4.6950, longitude: -74.0550, speed: 28, fixTime: "2026-03-05T11:28:00Z", attributes: { totalDistance: 112300, distance: 600, motion: true, ignition: true, power: 13.800, battery: 4.25, alarm: "sos", sat: 9, hdop: 0.6, rssi: 30, operator: "Claro" } },
  { deviceId: 10, latitude: 4.6200, longitude: -74.1100, speed: 15, fixTime: "2026-03-05T11:25:00Z", attributes: { totalDistance: 45600, distance: 400, motion: true, ignition: true, power: 11.200, battery: 3.50, alarm: "lowBattery", sat: 4, hdop: 1.5, rssi: 14, operator: "Tigo" } },
];

export function App() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <Routes>
        <Route path="/" element={<Navigate to="/scada/commands/center" replace />} />
        <Route path="/scada/*" element={<ScadaModule config={{
          themeMode: "dark",
          positions: mockPositions,
          devicesById: mockDevices,
        }} />} />
        <Route path="*" element={<Navigate to="/scada/map" replace />} />
      </Routes>
    </div>
  );
}
