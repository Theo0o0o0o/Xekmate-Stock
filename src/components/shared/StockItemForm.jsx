import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useUserRole } from '@/lib/useUserRole';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

export default function StockItemForm({ item, entityType, typeOptions, onSaved, onCancel }) {
  const { user } = useUserRole();
  const [saving, setSaving] = useState(false);
  const isConsumable = entityType === 'Consumable';
  const [form, setForm] = useState({
    name: '', referenceCode: '', brand: '', type: typeOptions?.[0] || '',
    compatibleModels: '', quantity: 0, minimumStock: 5, location: '',
    supplier: '', notes: '', ...item
  });
  const [errors, setErrors] = useState({});

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'], queryFn: () => base44.entities.Location.filter({ active: true })
  });
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'], queryFn: () => base44.entities.Supplier.list()
  });

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nome é obrigatório';
    if (!form.referenceCode.trim()) errs.referenceCode = 'Referência é obrigatória';
    if (form.quantity < 0) errs.quantity = 'Quantidade não pode ser negativa';
    if (form.minimumStock < 0) errs.minimumStock = 'Stock mínimo não pode ser negativo';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const entity = base44.entities[entityType];
    const data = { ...form, quantity: Number(form.quantity), minimumStock: Number(form.minimumStock), updatedBy: user?.full_name || user?.email };

    if (item?.id) {
      await entity.update(item.id, data);
      if (Number(item.quantity) !== Number(form.quantity)) {
        await base44.entities.StockMovement.create({
          itemType: entityType, itemId: item.id, itemName: form.name,
          movementType: 'Ajuste', previousQuantity: item.quantity, newQuantity: Number(form.quantity),
          quantityChanged: Number(form.quantity) - item.quantity,
          reason: 'Ajuste via edição', userId: user?.id, userName: user?.full_name || user?.email
        });
      }
      toast.success(`${isConsumable ? 'Consumível' : 'Peça'} atualizado(a)`);
    } else {
      const created = await entity.create(data);
      await base44.entities.StockMovement.create({
        itemType: entityType, itemId: created.id, itemName: form.name,
        movementType: 'Entrada', newQuantity: Number(form.quantity), quantityChanged: Number(form.quantity),
        reason: `Novo(a) ${isConsumable ? 'consumível' : 'peça'} registado(a)`,
        userId: user?.id, userName: user?.full_name || user?.email
      });
      toast.success(`${isConsumable ? 'Consumível' : 'Peça'} criado(a)`);
    }
    setSaving(false);
    onSaved();
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <PageHeader
        title={item ? `Editar ${isConsumable ? 'Consumível' : 'Peça'}` : `Novo(a) ${isConsumable ? 'Consumível' : 'Peça'}`}
        actions={<Button variant="ghost" onClick={onCancel}><ArrowLeft className="w-4 h-4 mr-1" />Voltar</Button>}
      />
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Nome *</Label>
                <Input value={form.name} onChange={e => update('name', e.target.value)} className={errors.name ? 'border-destructive' : ''} />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label>Referência *</Label>
                <Input value={form.referenceCode} onChange={e => update('referenceCode', e.target.value)} className={errors.referenceCode ? 'border-destructive' : ''} />
                {errors.referenceCode && <p className="text-xs text-destructive mt-1">{errors.referenceCode}</p>}
              </div>
              {isConsumable && (
                <>
                  <div>
                    <Label>Marca</Label>
                    <Input value={form.brand} onChange={e => update('brand', e.target.value)} />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Select value={form.type || '_none'} onValueChange={v => update('type', v === '_none' ? '' : v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">Selecionar</SelectItem>
                        {typeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="sm:col-span-2">
                <Label>Modelos Compatíveis</Label>
                <Input value={form.compatibleModels} onChange={e => update('compatibleModels', e.target.value)} placeholder="Ex: C70, C81xx, VersaLink C405" />
              </div>
              <div>
                <Label>Quantidade *</Label>
                <Input type="number" min="0" value={form.quantity} onChange={e => update('quantity', e.target.value)} className={errors.quantity ? 'border-destructive' : ''} />
                {errors.quantity && <p className="text-xs text-destructive mt-1">{errors.quantity}</p>}
              </div>
              <div>
                <Label>Stock Mínimo *</Label>
                <Input type="number" min="0" value={form.minimumStock} onChange={e => update('minimumStock', e.target.value)} className={errors.minimumStock ? 'border-destructive' : ''} />
                {errors.minimumStock && <p className="text-xs text-destructive mt-1">{errors.minimumStock}</p>}
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
                <Label>Fornecedor</Label>
                <Select value={form.supplier || '_none'} onValueChange={v => update('supplier', v === '_none' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Sem fornecedor</SelectItem>
                    {suppliers.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
              <Button type="submit" disabled={saving}><Save className="w-4 h-4 mr-1.5" />{saving ? 'A guardar...' : 'Guardar'}</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}