import React, { useEffect, useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Moon, Sun, Globe, Lock, Palette, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import { updateAccessPassword } from '@/services/appAccessService';

export default function Settings() {
  const { t, lang, setLang } = useI18n();
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const toggleDarkMode = (value) => {
    setDarkMode(value);
    if (value) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    } else if (saved === 'light') {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    }
  }, []);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(t('settings_pass_erro_campos'));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t('settings_pass_erro_match'));
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t('settings_pass_erro_len'));
      return;
    }

    try {
      await updateAccessPassword(currentPassword, newPassword);
      toast.success(t('settings_access_success'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.message || t('settings_access_error'));
    }
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
            <Select value={lang} onValueChange={(value) => {
              setLang(value);
              toast.success(value === 'pt' ? t('settings_lang_changed_pt') : t('settings_lang_changed_en'));
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
            <Lock className="w-3.5 h-3.5 text-primary" />{t('settings_seguranca')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-4 space-y-3">
          <p className="text-[11px] text-muted-foreground">{t('settings_access_desc')}</p>
          <div className="space-y-1.5">
            <Label className="text-[12px]">{t('settings_access_current')}</Label>
            <Input type="password" className="h-8 text-sm" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px]">{t('settings_access_new')}</Label>
            <Input type="password" className="h-8 text-sm" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px]">{t('settings_access_confirm')}</Label>
            <Input type="password" className="h-8 text-sm" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="flex justify-end pt-1">
            <Button size="sm" className="h-8 text-xs" onClick={handleChangePassword}>
              <Shield className="w-3.5 h-3.5 mr-1" />{t('settings_access_change')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
