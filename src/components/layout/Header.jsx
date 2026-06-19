import React from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useI18n } from '@/lib/i18n';
import xekmateLogo from '@/assets/xekmate-logo.png';

export default function Header({ userName, onMenuToggle, onLogout }) {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border h-[68px] flex items-center justify-between px-4 lg:px-5">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          onClick={onMenuToggle}
        >
          <Menu className="w-5 h-5" />
        </button>
        <img src={xekmateLogo} alt="XEKmate" className="h-10 w-auto object-contain" />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted transition-colors group">
              <div className="hidden sm:block text-left">
                <p className="text-[13px] font-medium leading-tight text-foreground">{userName || t('role_admin')}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <div className="px-2.5 py-2 border-b border-border">
              <p className="text-[13px] font-semibold">{userName}</p>
            </div>
            <div className="py-1">
              <DropdownMenuItem
                onClick={onLogout}
                className="text-[13px] text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer"
              >
                {t('nav_terminar_sessao')}
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
