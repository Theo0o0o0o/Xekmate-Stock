import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, MapPin, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { locationService } from '@/services/locationService';

const TYPES = ['Armazém', 'Prateleira', 'Sala', 'Oficina', 'Cliente', 'Outro'];

export default function Locations() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', type: 'Armazém', active: true });

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations-all'], queryFn: () => locationService.list('name', 200)
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? locationService.update(editing.id, data) : locationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations-all'] });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success(editing ? 'Localização atualizada' : 'Localização criada');
      setShowDialog(false); setEditing(null);
    }
  });

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', description: '', type: 'Armazém', active: true });
    setShowDialog(true);
  };
  const openEdit = (loc) => {
    setEditing(loc);
    setForm({ name: loc.name, description: loc.description || '', type: loc.type, active: loc.active !== false });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Nome é obrigatório'); return; }
    saveMutation.mutate(form);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Localizações"
        description={`${locations.length} localizações registadas`}
        actions={
          <Button size="sm" onClick={openNew} className="h-8 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />Adicionar
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded" />)}</div>
      ) : locations.length === 0 ? (
        <EmptyState icon={MapPin} title="Sem localizações" description="Adicione a primeira localização" actionLabel="Adicionar" onAction={openNew} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {locations.map(loc => (
            <Card
              key={loc.id}
              className="p-4 hover:shadow-sm transition-shadow cursor-pointer border-border shadow-none group"
              onClick={() => openEdit(loc)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded bg-muted flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-[13px] truncate">{loc.name}</h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground pl-8">{loc.type}</p>
                  {loc.description && (
                    <p className="text-[11px] text-muted-foreground pl-8 mt-0.5 truncate">{loc.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border ${loc.active !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    {loc.active !== false ? 'Ativa' : 'Inativa'}
                  </span>
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">{editing ? 'Editar Localização' : 'Nova Localização'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-[12px]">Nome *</Label>
              <Input className="h-8 text-sm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px]">Descrição</Label>
              <Input className="h-8 text-sm" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px]">Tipo</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between py-1">
              <Label className="text-[12px]">Localização ativa</Label>
              <Switch checked={form.active} onCheckedChange={v => setForm(f => ({ ...f, active: v }))} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'A guardar...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}