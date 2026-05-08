import { useState, type HTMLAttributes, type ReactNode } from "react";
import { AppHeaderActions, type AppHeaderUser } from "./AppHeaderActions";
import { Button } from "./Button";
import { Icon, type IconName } from "../icons";
import { MenuItem } from "./MenuItem";
import { ModuleShell } from "./ModuleShell";
import { Sidebar } from "./Sidebar";
import type { ThemeMode } from "./ThemeToggle";

export interface ModuleNavItem {
  id: string;
  label: string;
  iconName: IconName;
  selected?: boolean;
  expandable?: boolean;
  defaultOpen?: boolean;
  children?: ModuleNavItem[];
}

export interface ModuleTemplateProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  eyebrow?: string;
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
  user: AppHeaderUser;
  navItems: ModuleNavItem[];
  logo?: ReactNode;
  watermark?: ReactNode;
  footer?: ReactNode;
  actions?: ReactNode;
  onNavItemSelect?: (item: ModuleNavItem) => void;
}

export function ModuleTemplate({
  title,
  eyebrow,
  themeMode,
  onThemeModeChange,
  user,
  navItems,
  logo,
  watermark,
  footer = "Versión 1.0.0",
  actions,
  onNavItemSelect,
  children,
  ...rest
}: ModuleTemplateProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(navItems.map((item) => [item.id, Boolean(item.defaultOpen)])),
  );

  const toggleSection = (item: ModuleNavItem) => {
    setOpenSections((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
    onNavItemSelect?.(item);
  };

  const renderItem = (item: ModuleNavItem, isChild = false) => {
    const hasChildren = Boolean(item.children?.length);
    const isOpen = Boolean(openSections[item.id]);

    return (
      <div key={item.id} className="ds-sidebar__section">
        <MenuItem
          icon={<Icon name={item.iconName} />}
          label={item.label}
          state={!isChild && item.selected ? "selected" : "enable"}
          className={isChild && item.selected ? "ds-menu-item--sub-active" : ""}
          rightIcon={
            item.expandable || hasChildren
              ? <Icon name={isOpen ? "chevron-up" : "chevron-down"} />
              : undefined
          }
          onClick={() => {
            if (item.expandable || hasChildren) {
              toggleSection(item);
              return;
            }
            onNavItemSelect?.(item);
          }}
        />
        {hasChildren && (
          <div className={`ds-sidebar__sub-items ${isOpen ? "ds-sidebar__sub-items--open" : ""}`}>
            {item.children?.map((child) => renderItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <ModuleShell
      {...rest}
      theme={themeMode}
      eyebrow={eyebrow}
      title={title}
      actions={actions}
      topBarRight={
        <AppHeaderActions
          themeMode={themeMode}
          onThemeModeChange={onThemeModeChange}
          user={user}
        />
      }
      sidebar={
        <Sidebar
          collapsed={collapsed}
          watermark={watermark}
          logo={
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ds-sidebar__menu-button"
                aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
                onClick={() => setCollapsed(!collapsed)}
              >
                <Icon name="menu" size={16} />
              </Button>
              {!collapsed && logo}
              {!collapsed && <span className="ds-sidebar__logo-spacer" />}
            </>
          }
          footer={footer}
        >
          {navItems.map((item) => renderItem(item))}
        </Sidebar>
      }
    >
      {children}
    </ModuleShell>
  );
}
