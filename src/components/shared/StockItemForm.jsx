import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUserRole } from '@/lib/useUserRole';
import { consumableService } from '@/services/consumableService';
import { locationService } from '@/services/locationService';
import { partService } from '@/services/partService';
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
import { translateValue, useI18n } from '@/lib/i18n';

export default function StockItemForm({ item, entityType, typeOptions = [], onSaved, onCancel }) {
  const { user } = useUserRole();
  const { t } = useI18n();
  const [saving, setSaving] = useState(false);
  const isConsumable = entityType === 'Consumable';
  const itemLabel = isConsumable ? t('btn_consumivel') : t('btn_peca');
  const [form, setForm] = useState({
    name: '',
    referenceCode: '',
    brand: '',
    type: typeOptions?.[0] || '',
    compatibleModels: '',
    quantity: 0,
    minimumStock: 5,
    location: '',
    supplier: '',
    notes: '',
    ...item,
  });
  const [errors, setErrors] = useState({});
  const entityService = isConsumable ? consumableService : partService;

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationService.listActive(),
  });
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => supplierService.list(),
  });

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = t('common_required_name');
    if (!form.referenceCode.trim()) errs.referenceCode = t('form_reference_required');
    if (form.quantity < 0) errs.quantity = t('form_quantity_nonnegative');
    if (form.minimumStock < 0) errs.minimumStock = t('form_min_stock_nonnegative');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const data = {
        ...form,
        quantity: Number(form.quantity),
        minimumStock: Number(form.minimumStock),
        updatedBy: user?.full_name || user?.email,
      };

      if (item?.id) {
        await entityService.update(item.id, data);
        if (Number(item.quantity) !== Number(form.quantity)) {
          await stockMovementService.create({
            itemType: entityType,
            itemId: item.id,
            itemName: form.name,
            movementType: 'Ajuste',
            previousQuantity: item.quantity,
            newQuantity: Number(form.quantity),
            quantityChanged: Number(form.quantity) - item.quantity,
            reason: 'Ajuste via edição',
            userId: user?.id,
            userName: user?.full_name || user?.email,
          });
        }
        toast.success(isConsumable ? t('form_saved_consumable') : t('form_saved_part'));
      } else {
        const created = await entityService.create(data);
        await stockMovementService.create({
          itemType: entityType,
          itemId: created.id,
          itemName: form.name,
          movementType: 'Entrada',
          newQuantity: Number(form.quantity),
          quantityChanged: Number(form.quantity),
          reason: `Novo(a) ${isConsumable ? 'consumível' : 'peça'} registado(a)`,
          userId: user?.id,
          userName: user?.full_name || user?.email,
        });
        toast.success(isConsumable ? t('form_created_consumable') : t('form_created_part'));
      }
      onSaved();
    } catch (error) {
      toast.error(error.message || t('form_save_item_error'));
    } finally {
      setSaving(false);
    }
  };

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <PageHeader
        title={`${item ? t('form_edit') : t('form_new')} ${itemLabel}`}
        actions={<Button variant="ghost" onClick={onCancel}><ArrowLeft className="w-4 h-4 mr-1" />{t('common_back')}</Button>}
      />
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>{t('common_name')} *</Label>
                <Input value={form.name} onChange={(e) => update('name', e.target.value)} className={errors.name ? 'border-destructive' : ''} />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label>{t('common_reference')} *</Label>
                <Input value={form.referenceCode} onChange={(e) => update('referenceCode', e.target.value)} className={errors.referenceCode ? 'border-destructive' : ''} />
                {errors.referenceCode && <p className="text-xs text-destructive mt-1">{errors.referenceCode}</p>}
              </div>
              {isConsumable && (
                <>
                  <div>
                    <Label>{t('common_brand')}</Label>
                    <Input value={form.brand} onChange={(e) => update('brand', e.target.value)} />
                  </div>
                  <div>
                    <Label>{t('common_type')}</Label>
                    <Select value={form.type || '_none'} onValueChange={(value) => update('type', value === '_none' ? '' : value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">{t('common_select')}</SelectItem>
                        {typeOptions.map((type) => <SelectItem key={type} value={type}>{translateValue(t, type)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="sm:col-span-2">
                <Label>{t('form_compatible_models')}</Label>
                <Input value={form.compatibleModels} onChange={(e) => update('compatibleModels', e.target.value)} placeholder="Ex: C70, C81xx, VersaLink C405" />
              </div>
              <div>
                <Label>{t('stock_quantity')} *</Label>
                <Input type="number" min="0" value={form.quantity} onChange={(e) => update('quantity', e.target.value)} className={errors.quantity ? 'border-destructive' : ''} />
                {errors.quantity && <p className="text-xs text-destructive mt-1">{errors.quantity}</p>}
              </div>
              <div>
                <Label>{t('form_min_stock')} *</Label>
                <Input type="number" min="0" value={form.minimumStock} onChange={(e) => update('minimumStock', e.target.value)} className={errors.minimumStock ? 'border-destructive' : ''} />
                {errors.minimumStock && <p className="text-xs text-destructive mt-1">{errors.minimumStock}</p>}
              </div>
              <div>
                <Label>{t('common_location')}</Label>
                <Select value={form.location || '_none'} onValueChange={(value) => update('location', value === '_none' ? '' : value)}>
                  <SelectTrigger><SelectValue placeholder={t('common_select')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">{t('common_none_location')}</SelectItem>
                    {locations.map((location) => <SelectItem key={location.id} value={location.name}>{location.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('common_supplier')}</Label>
                <Select value={form.supplier || '_none'} onValueChange={(value) => update('supplier', value === '_none' ? '' : value)}>
                  <SelectTrigger><SelectValue placeholder={t('common_select')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">{t('common_none_supplier')}</SelectItem>
                    {suppliers.map((supplier) => <SelectItem key={supplier.id} value={supplier.name}>{supplier.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{t('common_notes')}</Label>
              <Textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={3} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onCancel}>{t('btn_cancelar')}</Button>
              <Button type="submit" disabled={saving}><Save className="w-4 h-4 mr-1.5" />{saving ? t('users_a_guardar') : t('btn_guardar')}</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
