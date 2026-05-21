import "../../styles/tailwind.css";
import "../../styles/globals.css";
import "maplibre-gl/dist/maplibre-gl.css";

import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { GeofencesPage } from "../../features/geofences/pages/GeofencesPage";

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
  const navigate = useNavigate();
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

  // Pages that bring their own ModuleTemplate (independent apps)
  const isStandalonePage =
    path.startsWith("/scada/panic") ||
    path.startsWith("/scada/alerts") ||
    path.startsWith("/scada/reports");

  let standaloneContent: React.ReactNode = null;
  if (path.startsWith("/scada/panic")) {
    standaloneContent = <PanicPage />;
  } else if (path.startsWith("/scada/alerts")) {
    standaloneContent = <OperationsAlarmsPage />;
  } else if (path.startsWith("/scada/reports")) {
    standaloneContent = <ReportsPage />;
  }

  // Pages that need the shared ModuleShell wrapper
  let content: React.ReactNode = null;
  let title = "Scada";
  if (!isStandalonePage) {
    if (path.startsWith("/scada/geofences")) {
      title = "Geocercas";
      content = <GeofencesPage />;
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
  }

  return (
    <div
      className="h-full w-full overflow-hidden bg-background"
      style={themeVars}
      data-theme={themeMode}
    >
      <ScadaProvider config={{ ...config, themeMode }}>
        {isStandalonePage ? (
          standaloneContent
        ) : (
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
                  onClick={() => navigate("/scada/map")}
                />
                <MenuItem icon={<Icon name="cmd-car" />} label="Vehículos" />
                <MenuItem icon={<Icon name="microchip" />} label="Configuración AVL" />
                <MenuItem
                  icon={<Icon name="bell" />}
                  label="Gestor de Alarmas"
                  state={path.startsWith("/scada/alerts") ? "selected" : "enable"}
                  onClick={() => navigate("/scada/alerts")}
                />
                <MenuItem
                  icon={<Icon name="chart-column" />}
                  label="Reportes"
                  state={path.startsWith("/scada/reports") ? "selected" : "enable"}
                  onClick={() => navigate("/scada/reports")}
                />
                <MenuItem
                  icon={<Icon name="settings-2" />}
                  label="Comandos"
                  state={path.startsWith("/scada/commands") ? "selected" : "enable"}
                  onClick={() => navigate("/scada/commands/center")}
                />
                <MenuItem
                  icon={<Icon name="target" />}
                  label="Geocercas"
                  state={path.startsWith("/scada/geofences") ? "selected" : "enable"}
                  onClick={() => navigate("/scada/geofences")}
                />
                <MenuItem icon={<Icon name="user" />} label="Administrativo" />
                <MenuItem icon={<Icon name="settings" />} label="Preferencias" />
              </Sidebar>
            }
          >
            {content}
          </ModuleShell>
        )}
      </ScadaProvider>
    </div>
  );
}
