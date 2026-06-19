import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUserRole } from '@/lib/useUserRole';
import { equipmentService } from '@/services/equipmentService';
import { locationService } from '@/services/locationService';
import { stockMovementService } from '@/services/stockMovementService';
import { supplierService } from '@/services/supplierService';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

const STATUSES = ['Disponível', 'Em uso interno', 'Em cliente', 'Em manutenção', 'Reservada', 'Vendida', 'Abatida'];
const CATEGORIES = ['Impressora', 'Multifuncional', 'Plotter', 'Scanner', 'Outro'];

export default function EquipmentForm({ item, onSaved, onCancel }) {
  const { user } = useUserRole();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', brand: '', serialNumber: '', category: 'Impressora', status: 'Disponível',
    location: '', entryDate: '', clientName: '', supplier: '', purchaseDate: '',
    warrantyEndDate: '', notes: '', image: '', ...item
  });
  const [errors, setErrors] = useState({});

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'], queryFn: () => locationService.listActive()
  });
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'], queryFn: () => supplierService.list()
  });

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nome é obrigatório';
    if (!form.brand.trim()) errs.brand = 'Marca é obrigatória';
    if (!form.serialNumber.trim()) errs.serialNumber = 'Nº série é obrigatório';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const data = { ...form, updatedBy: user?.full_name || user?.email };

    if (item?.id) {
      await equipmentService.update(item.id, data);
      if (item.status !== form.status) {
        await stockMovementService.create({
          itemType: 'Equipment', itemId: item.id, itemName: form.name,
          movementType: 'Edição', previousStatus: item.status, newStatus: form.status,
          reason: `Estado alterado de "${item.status}" para "${form.status}"`,
          userId: user?.id, userName: user?.full_name || user?.email
        });
      }
      toast.success('Equipamento atualizado');
    } else {
      const created = await equipmentService.create(data);
      await stockMovementService.create({
        itemType: 'Equipment', itemId: created.id, itemName: form.name,
        movementType: 'Entrada', newStatus: form.status,
        reason: 'Novo equipamento registado',
        userId: user?.id, userName: user?.full_name || user?.email
      });
      toast.success('Equipamento criado');
    }
    setSaving(false);
    onSaved();
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <PageHeader
        title={item ? 'Editar Equipamento' : 'Novo Equipamento'}
        actions={<Button variant="ghost" onClick={onCancel}><ArrowLeft className="w-4 h-4 mr-1" />Voltar</Button>}
      />
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Nome / Modelo *</Label>
                <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Ex: Xerox C70 Pro" className={errors.name ? 'border-destructive' : ''} />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label>Marca *</Label>
                <Input value={form.brand} onChange={e => update('brand', e.target.value)} placeholder="Ex: Xerox" className={errors.brand ? 'border-destructive' : ''} />
                {errors.brand && <p className="text-xs text-destructive mt-1">{errors.brand}</p>}
              </div>
              <div>
                <Label>Nº de Série *</Label>
                <Input value={form.serialNumber} onChange={e => update('serialNumber', e.target.value)} placeholder="Número único" className={errors.serialNumber ? 'border-destructive' : ''} />
                {errors.serialNumber && <p className="text-xs text-destructive mt-1">{errors.serialNumber}</p>}
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={v => update('category', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estado</Label>
                <Select value={form.status} onValueChange={v => update('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Localização</Label>
                <Select value={form.location || '_none'} onValueChange={v => update('location', v === '_none' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Sem localização</SelectItem>
                    {locations.map(l => <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cliente</Label>
                <Input value={form.clientName} onChange={e => update('clientName', e.target.value)} placeholder="Nome do cliente" />
              </div>
              <div>
                <Label>Fornecedor</Label>
                <Select value={form.supplier || '_none'} onValueChange={v => update('supplier', v === '_none' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Sem fornecedor</SelectItem>
                    {suppliers.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data de Entrada</Label>
                <Input type="date" value={form.entryDate} onChange={e => update('entryDate', e.target.value)} />
              </div>
              <div>
                <Label>Data de Compra</Label>
                <Input type="date" value={form.purchaseDate} onChange={e => update('purchaseDate', e.target.value)} />
              </div>
              <div>
                <Label>Fim da Garantia</Label>
                <Input type="date" value={form.warrantyEndDate} onChange={e => update('warrantyEndDate', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Notas adicionais..." rows={3} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
              <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
                <Save className="w-4 h-4 mr-1.5" />{saving ? 'A guardar...' : 'Guardar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
