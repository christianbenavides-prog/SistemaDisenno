import "../../styles/tailwind.css";
import "../../styles/globals.css";
import "maplibre-gl/dist/maplibre-gl.css";

import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import type { ScadaModuleConfig } from "./contracts";
import { ScadaProvider } from "./ScadaProvider";
import { buildScadaThemeCssVars } from "./traccarTheme";
import { OperationsAlarmsPage } from "../../features/alerts/pages/OperationsAlarmsPage";
import { CommandsPage } from "../../features/commands/pages/CommandsPage";
import { CommandEditorPage } from "../../features/commands/pages/CommandEditorPage";
import { CommandCenterPage } from "../../features/commands/pages/CommandCenterPage";
import { MapPage } from "../../features/map/pages/MapPage";
import { ReportsPage } from "../../features/reports/pages/ReportsPage";
import { PanicPage } from "../../features/panic/pages/PanicPage";

import { ModuleShell } from "../../lib/design-system/components/ModuleShell";
import { Sidebar } from "../../lib/design-system/components/Sidebar";
import { MenuItem } from "../../lib/design-system/components/MenuItem";
import { SimonLogo } from "../../shared/brand/SimonLogo";
import { ThemeToggle } from "../../lib/design-system/components/ThemeToggle";
import { ProfileCard } from "../../lib/design-system/components/ProfileCard";
import { Avatar } from "../../lib/design-system/components/Avatar";
import { Icon } from "../../lib/design-system/icons";

export default function ScadaModule({
  config,
}: Readonly<{ config?: ScadaModuleConfig }>) {
  const location = useLocation();
  const path = location.pathname || "";
  
  // Track theme locally to allow toggling, falling back to config.themeMode
  const [themeMode, setThemeMode] = useState<"light" | "dark">(config?.themeMode ?? "light");

  const themeVars = useMemo(
    () =>
      buildScadaThemeCssVars({
        themeMode: themeMode,
        themeCssVars: config?.themeCssVars ?? null,
        colorPrimary: config?.colorPrimary,
        colorSecondary: config?.colorSecondary,
      }),
    [themeMode, config?.themeCssVars, config?.colorPrimary, config?.colorSecondary],
  );

  let content: React.ReactNode = null;
  let title = "Scada";
  if (path.startsWith("/scada/panic")) {
    title = "Botón de Pánico";
    content = <PanicPage />;
  } else if (path.startsWith("/scada/alerts")) { 
    title = "Gestor de Alarmas";
    content = <OperationsAlarmsPage />;
  } else if (path.startsWith("/scada/reports")) {
    title = "Reportes";
    content = <ReportsPage />;
  } else if (path.startsWith("/scada/commands")) {
    title = "Comandos";
    const tail = path.replace("/scada/commands", "") || "";
    const looksLikeEditor = tail.startsWith("/new") || /^\/\d+/.test(tail);
    if (tail.startsWith("/center") || tail === "") {
      content = <CommandCenterPage />;
    } else if (tail.startsWith("/device/")) {
      content = <CommandCenterPage />;
    } else {
      content = looksLikeEditor ? <CommandEditorPage /> : <CommandsPage />;
    }
  } else {
    title = "Mapa";
    content = <MapPage />;
  }

  return (
    <div
      className="h-full w-full overflow-hidden bg-background"
      style={themeVars}
      data-theme={themeMode}
    >
      <ScadaProvider config={{ ...config, themeMode }}>
        <ModuleShell
          title={title}
          theme={themeMode}
          sidebar={
            <Sidebar
              logo={<SimonLogo variant={themeMode === "dark" ? "dark" : "light"} />}
              footer={
                <div className="flex flex-col gap-6 w-full">
                  <ThemeToggle value={themeMode} onChange={(v) => setThemeMode(v)} />
                  <div className="flex flex-col gap-2">
                    <ProfileCard
                      name="Mario Rojas"
                      role="Administrador"
                      avatar={<Avatar src="https://i.pravatar.cc/150?u=mario" size="sm" />}
                    />
                    <div className="text-xs text-ds-text-muted mt-2">Versión 1.0.0</div>
                  </div>
                </div>
              }
            >
              <MenuItem
                icon={<Icon name="map-pinned" />}
                label="Mapa"
                state={path.startsWith("/scada/map") || path === "/scada/" || path === "/scada" ? "selected" : "enable"}
              />
              <MenuItem icon={<Icon name="cmd-car" />} label="Vehículos" />
              <MenuItem icon={<Icon name="microchip" />} label="Configuración AVL" />
              <MenuItem icon={<Icon name="bell" />} label="Gestor de Alarmas" />
              <MenuItem icon={<Icon name="chart-column" />} label="Reportes" />
              <MenuItem icon={<Icon name="settings-2" />} label="Comandos" />
              <MenuItem icon={<Icon name="target" />} label="Geocercas" />
              <MenuItem icon={<Icon name="user" />} label="Administrativo" />
              <MenuItem icon={<Icon name="settings" />} label="Preferencias" />
            </Sidebar>
          }
        >
          {content}
        </ModuleShell>
      </ScadaProvider>
    </div>
  );
}
