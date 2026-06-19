import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import StatusBadge from '@/components/shared/StatusBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Users as UsersIcon, Pencil, UserPlus, Shield, Trash2, History } from 'lucide-react';
import { toast } from 'sonner';
import { userService } from '@/services/userService';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { pt, enUS } from 'date-fns/locale';
import { useI18n } from '@/lib/i18n';

export default function UsersPage() {
  const { t, lang } = useI18n();
  const dateLocale = lang === 'en' ? enUS : pt;
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [deletingUser, setDeletingUser] = useState(null);
  const [historyUser, setHistoryUser] = useState(null);

  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const currentUser = await userService.ensureCurrentUserIsAdmin(await userService.me());
      const list = await userService.list('full_name', 200);
      if (list.length > 0) {
        const promoted = await userService.promoteAllToAdmin(list);
        return promoted.map(userService.withDisplayName);
      }
      return currentUser ? [userService.withDisplayName(currentUser)] : [];
    },
    retry: 1
  });

  const { data: userMovements = [], isLoading: loadingHistory } = useQuery({
    queryKey: ['user-movements', historyUser?.id],
    queryFn: () => base44.entities.StockMovement.filter({ userId: historyUser.id }, '-created_date', 50),
    enabled: !!historyUser
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(t('users_atualizado'));
      setEditing(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.User.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(t('users_removido'));
      setDeletingUser(null);
    },
    onError: () => {
      toast.error(t('users_erro_remover'));
      setDeletingUser(null);
    }
  });

  const handleInvite = async () => {
    if (!inviteEmail.trim()) { toast.error(t('users_email_obrigatorio')); return; }
    await userService.invite(inviteEmail, 'admin');
    toast.success(t('users_convite_enviado') + inviteEmail);
    setShowInvite(false); setInviteEmail('');
  };

  const movementTypeColor = {
    'Entrada': 'bg-emerald-500', 'Saída': 'bg-red-500', 'Ajuste': 'bg-blue-500',
    'Manutenção': 'bg-amber-500', 'Reserva': 'bg-orange-500', 'Venda': 'bg-indigo-500', 'Edição': 'bg-slate-400'
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('users_title')}
        description={t('users_desc')}
        actions={
          <Button size="sm" onClick={() => setShowInvite(true)} className="h-8 text-xs">
            <UserPlus className="w-3.5 h-3.5 mr-1" />{t('users_convidar')}
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-1.5">{[1,2,3].map(i => <Skeleton key={i} className="h-11 rounded" />)}</div>
      ) : isError ? (
        <EmptyState icon={UsersIcon} title={t('users_sem')} description="Não foi possível carregar a lista de utilizadores. Termine sessão e entre novamente para atualizar as permissões." />
      ) : users.length === 0 ? (
        <EmptyState icon={UsersIcon} title={t('users_sem')} description={t('users_sem_desc')} />
      ) : (
        <Card className="overflow-hidden shadow-none border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('users_col_nome')}</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('users_col_email')}</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('users_col_estado')}</TableHead>
                  <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('users_col_acoes')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-muted flex items-center justify-center shrink-0">
                          <Shield className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="font-medium text-[13px]">{u.full_name || '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[12px] text-muted-foreground py-2.5">{u.email}</TableCell>
                    <TableCell className="py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${u.active !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                        {u.active !== false ? t('users_ativo') : t('users_inativo')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-blue-600" title={t('users_historico')} onClick={() => setHistoryUser(u)}>
                          <History className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" title={t('users_guardar')} onClick={() => setEditing(u)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" title={t('users_eliminar_btn')} onClick={() => setDeletingUser(u)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
<Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="text-base">{t('users_edit_title')}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3 py-2">
              <div className="bg-muted/40 rounded p-3">
                <p className="text-[13px] font-medium">{editing.full_name || '—'}</p>
                <p className="text-[12px] text-muted-foreground">{editing.email}</p>
              </div>
              <div className="flex items-center justify-between py-1">
                <Label className="text-[12px]">{t('users_conta_ativa')}</Label>
                <Switch checked={editing.active !== false} onCheckedChange={v => setEditing(e => ({ ...e, active: v }))} />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(null)}>{t('users_cancelar')}</Button>
            <Button size="sm" onClick={() => updateMutation.mutate({ id: editing.id, data: { active: editing.active } })} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? t('users_a_guardar') : t('users_guardar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
<Dialog open={!!historyUser} onOpenChange={() => setHistoryUser(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              {t('users_historico')} {historyUser?.full_name || historyUser?.email}
            </DialogTitle>
          </DialogHeader>
          <div className="py-1">
            {loadingHistory ? (
              <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 rounded" />)}</div>
            ) : userMovements.length === 0 ? (
              <p className="text-[13px] text-muted-foreground text-center py-8">{t('users_sem_historico')}</p>
            ) : (
              <div className="divide-y divide-border max-h-80 overflow-y-auto">
                {userMovements.map(m => (
                  <div key={m.id} className="flex items-start gap-3 py-2.5 px-1">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${movementTypeColor[m.movementType] || 'bg-slate-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] font-medium truncate">{m.itemName}</p>
                        <StatusBadge status={m.movementType} type="movement" />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {m.itemType} · {m.created_date ? format(new Date(m.created_date), "dd MMM yyyy, HH:mm", { locale: dateLocale }) : '—'}
                        {m.reason && <span> · {m.reason}</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setHistoryUser(null)}>{t('users_fechar')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
<Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="text-base">{t('users_convidar_title')}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-[12px]">{t('users_email_label')}</Label>
              <Input className="h-8 text-sm" type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder={t('users_email_placeholder')} />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {lang === 'en' ? 'Users are invited as Administrators.' : 'Os utilizadores são convidados como Administradores.'}
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowInvite(false)}>{t('users_cancelar')}</Button>
            <Button size="sm" onClick={handleInvite}>{t('users_enviar_convite')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
<ConfirmDialog
        open={!!deletingUser}
        onOpenChange={() => setDeletingUser(null)}
        title={t('users_eliminar_title')}
        description={`${t('users_eliminar_desc')} "${deletingUser?.full_name || deletingUser?.email}"? ${t('users_eliminar_desc2')}`}
        confirmLabel={t('users_eliminar_btn')}
        destructive
        onConfirm={() => deleteMutation.mutate(deletingUser.id)}
      />
    </div>
  );
}
