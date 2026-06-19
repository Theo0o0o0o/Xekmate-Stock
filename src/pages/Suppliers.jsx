import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Truck, Pencil, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { supplierService } from '@/services/supplierService';

export default function Suppliers() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', contactName: '', phone: '', email: '', address: '', notes: '' });

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'], queryFn: () => supplierService.list('name', 200)
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? supplierService.update(editing.id, data) : supplierService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success(editing ? 'Fornecedor atualizado' : 'Fornecedor criado');
      setShowDialog(false); setEditing(null);
    }
  });

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', contactName: '', phone: '', email: '', address: '', notes: '' });
    setShowDialog(true);
  };
  const openEdit = (s) => {
    setEditing(s);
    setForm({ name: s.name, contactName: s.contactName || '', phone: s.phone || '', email: s.email || '', address: s.address || '', notes: s.notes || '' });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Nome é obrigatório'); return; }
    saveMutation.mutate(form);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Fornecedores"
        description={`${suppliers.length} fornecedores registados`}
        actions={
          <Button size="sm" onClick={openNew} className="h-8 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />Adicionar
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded" />)}</div>
      ) : suppliers.length === 0 ? (
        <EmptyState icon={Truck} title="Sem fornecedores" description="Adicione o primeiro fornecedor" actionLabel="Adicionar" onAction={openNew} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {suppliers.map(s => (
            <Card
              key={s.id}
              className="p-4 hover:shadow-sm transition-shadow cursor-pointer border-border shadow-none group"
              onClick={() => openEdit(s)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-muted flex items-center justify-center shrink-0">
                      <Truck className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-[13px] truncate">{s.name}</h3>
                  </div>
                  {s.contactName && (
                    <p className="text-[12px] text-muted-foreground pl-8">{s.contactName}</p>
                  )}
                  {s.phone && (
                    <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 pl-8">
                      <Phone className="w-3 h-3 shrink-0" />{s.phone}
                    </p>
                  )}
                  {s.email && (
                    <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 pl-8 truncate">
                      <Mail className="w-3 h-3 shrink-0" />{s.email}
                    </p>
                  )}
                </div>
                <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">{editing ? 'Editar Fornecedor' : 'Novo Fornecedor'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-[12px]">Nome *</Label>
              <Input className="h-8 text-sm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px]">Contacto</Label>
              <Input className="h-8 text-sm" value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px]">Telefone</Label>
                <Input className="h-8 text-sm" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">Email</Label>
                <Input className="h-8 text-sm" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px]">Morada</Label>
              <Input className="h-8 text-sm" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px]">Observações</Label>
              <Textarea className="text-sm resize-none" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
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