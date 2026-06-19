import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Printer, Droplets, Wrench, ArrowLeftRight,
  MapPin, Truck, Users, BarChart3, Settings, LogOut, X, ChevronLeft } from
'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import xLogo from '@/assets/x-logo.png';

export default function Sidebar({ onLogout, mobileOpen, onCloseMobile, collapsed, onToggleCollapse }) {
  const location = useLocation();
  const { t } = useI18n();

  const navGroups = [
  {
    labelKey: 'nav_group_inventario',
    items: [
    { labelKey: 'nav_dashboard', icon: LayoutDashboard, path: '/' },
    { labelKey: 'nav_equipamentos', icon: Printer, path: '/equipamentos' },
    { labelKey: 'nav_consumiveis', icon: Droplets, path: '/consumiveis' },
    { labelKey: 'nav_pecas', icon: Wrench, path: '/pecas' },
    { labelKey: 'nav_movimentos', icon: ArrowLeftRight, path: '/movimentos' }]

  },
  {
    labelKey: 'nav_group_gestao',
    items: [
    { labelKey: 'nav_localizacoes', icon: MapPin, path: '/localizacoes' },
    { labelKey: 'nav_fornecedores', icon: Truck, path: '/fornecedores' },
    { labelKey: 'nav_utilizadores', icon: Users, path: '/utilizadores' }]

  },
  {
    labelKey: 'nav_group_sistema',
    items: [
    { labelKey: 'nav_relatorios', icon: BarChart3, path: '/relatorios' },
    { labelKey: 'nav_definicoes', icon: Settings, path: '/definicoes' }]

  }];


  const isActive = (item) =>
  location.pathname === item.path ||
  item.path !== '/' && location.pathname.startsWith(item.path);

  return (
    <>
      {mobileOpen &&
      <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={onCloseMobile} />
      }
      <aside className={cn(
        "fixed top-0 left-0 h-full bg-sidebar text-sidebar-foreground z-50 flex flex-col transition-all duration-300 border-r border-sidebar-border",
        collapsed ? "w-[60px]" : "w-[220px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
<div className={cn(
          "flex items-center border-b border-sidebar-border shrink-0",
          collapsed ? "px-0 py-4 justify-center" : "px-4 py-4"
        )}>
          {collapsed ?
          <img src={xLogo} alt="Xekmate" className="w-8 h-8 object-contain" /> :

          <div className="flex items-center justify-between w-full">
              <span className="text-base font-bold tracking-tight text-sidebar-foreground">Xekmate Stock</span>
              {mobileOpen &&
            <button
              className="lg:hidden text-sidebar-foreground/50 hover:text-sidebar-foreground p-1"
              onClick={onCloseMobile}>
              
                  <X className="w-4 h-4" />
                </button>
            }
            </div>
          }
        </div>
<nav className="flex-1 py-3 overflow-y-auto">
          {navGroups.map((group) =>
          <div key={group.labelKey} className="mb-1">
              {!collapsed &&
            <p className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">
                  {t(group.labelKey)}
                </p>
            }
              {group.items.map((item) =>
            <Link
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              title={collapsed ? t(item.labelKey) : undefined}
              className={cn(
                "flex items-center gap-3 mx-2 my-0.5 rounded text-sm transition-all duration-150",
                collapsed ? "px-2 py-2.5 justify-center" : "px-3 py-2",
                isActive(item) ?
                "bg-primary/10 text-primary border-l-2 border-primary ml-0 pl-[calc(0.75rem-2px)] mx-0 rounded-l-none rounded-r" :
                "text-sidebar-foreground/55 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}>
              
                  <item.icon className={cn("shrink-0 w-4 h-4", isActive(item) ? "text-primary" : "")} />
                  {!collapsed &&
              <span className={cn("font-medium", isActive(item) ? "text-primary" : "")}>{t(item.labelKey)}</span>
              }
                </Link>
            )}
            </div>
          )}
        </nav>
<div className="border-t border-sidebar-border py-2 px-2 space-y-0.5 shrink-0">
          <button
            onClick={onToggleCollapse}
            className={cn(
              "hidden lg:flex items-center gap-3 w-full rounded text-[13px] text-sidebar-foreground/40 hover:text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors py-2",
              collapsed ? "px-2 justify-center" : "px-3"
            )}>
            
            <ChevronLeft className={cn("w-4 h-4 transition-transform shrink-0", collapsed && "rotate-180")} />
            {!collapsed && <span>{t('nav_recolher')}</span>}
          </button>
          <button
            onClick={onLogout}
            className={cn(
              "flex items-center gap-3 w-full rounded text-[13px] text-sidebar-foreground/40 hover:text-red-400 hover:bg-sidebar-accent transition-colors py-2",
              collapsed ? "px-2 justify-center" : "px-3"
            )}>
            
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{t('nav_terminar_sessao')}</span>}
          </button>
        </div>
      </aside>
    </>);

}
