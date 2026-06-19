import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Moon, Sun, Globe, Bell, Lock, Palette, Save, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';

export default function Settings() {
  const { t, lang, setLang } = useI18n();
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [notifications, setNotifications] = useState({ lowStock: true, outOfStock: true });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const toggleDarkMode = (val) => {
    setDarkMode(val);
    if (val) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') { document.documentElement.classList.add('dark'); setDarkMode(true); }
    else if (saved === 'light') { document.documentElement.classList.remove('dark'); setDarkMode(false); }
  }, []);

  const handleSaveNotifications = () => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    toast.success(t('settings_pref_guardadas'));
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) { toast.error(t('settings_pass_erro_campos')); return; }
    if (newPassword !== confirmPassword) { toast.error(t('settings_pass_erro_match')); return; }
    if (newPassword.length < 6) { toast.error(t('settings_pass_erro_len')); return; }
    toast.success(t('settings_pass_sucesso'));
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <PageHeader title={t('settings_title')} description={t('settings_desc')} />
<Card className="shadow-none border-border">
        <CardHeader className="py-3 px-4 border-b border-border">
          <CardTitle className="text-[13px] font-semibold flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-primary" />{t('settings_aparencia')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-[13px] font-medium">{t('settings_tema_escuro')}</Label>
              <p className="text-[11px] text-muted-foreground mt-0.5">{t('settings_tema_desc')}</p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-muted-foreground" />
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
              <Moon className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
<Card className="shadow-none border-border">
        <CardHeader className="py-3 px-4 border-b border-border">
          <CardTitle className="text-[13px] font-semibold flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-primary" />{t('settings_idioma')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-[13px]">{t('settings_idioma_label')}</Label>
            <Select value={lang} onValueChange={(val) => {
              setLang(val);
              toast.success(val === 'pt' ? 'Idioma alterado para Português (Portugal)' : 'Language changed to English');
            }}>
              <SelectTrigger className="h-8 text-sm w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt">Português (Portugal)</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
<Card className="shadow-none border-border">
        <CardHeader className="py-3 px-4 border-b border-border">
          <CardTitle className="text-[13px] font-semibold flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-primary" />{t('settings_notificacoes')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-[13px] font-medium">{t('settings_notif_baixo')}</Label>
              <p className="text-[11px] text-muted-foreground mt-0.5">{t('settings_notif_baixo_desc')}</p>
            </div>
            <Switch checked={notifications.lowStock} onCheckedChange={v => setNotifications(n => ({ ...n, lowStock: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-[13px] font-medium">{t('settings_notif_esgotado')}</Label>
              <p className="text-[11px] text-muted-foreground mt-0.5">{t('settings_notif_esgotado_desc')}</p>
            </div>
            <Switch checked={notifications.outOfStock} onCheckedChange={v => setNotifications(n => ({ ...n, outOfStock: v }))} />
          </div>
          <div className="pt-1 flex justify-end">
            <Button size="sm" className="h-8 text-xs" onClick={handleSaveNotifications}>
              <Save className="w-3.5 h-3.5 mr-1" />{t('settings_guardar_pref')}
            </Button>
          </div>
        </CardContent>
      </Card>
<Card className="shadow-none border-border">
        <CardHeader className="py-3 px-4 border-b border-border">
          <CardTitle className="text-[13px] font-semibold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-primary" />{t('settings_seguranca')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-4 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[12px]">{t('settings_pass_atual')}</Label>
            <Input type="password" className="h-8 text-sm" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px]">{t('settings_nova_pass')}</Label>
            <Input type="password" className="h-8 text-sm" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px]">{t('settings_confirmar_pass')}</Label>
            <Input type="password" className="h-8 text-sm" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="flex justify-end pt-1">
            <Button size="sm" className="h-8 text-xs" onClick={handleChangePassword}>
              <Shield className="w-3.5 h-3.5 mr-1" />{t('settings_alterar_pass')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
