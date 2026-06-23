import React, { useState } from 'react';
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
import { translateValue, useI18n } from '@/lib/i18n';

const STATUSES = ['Disponível', 'Em uso interno', 'Em cliente', 'Em manutenção', 'Reservada', 'Vendida', 'Abatida'];
const CATEGORIES = ['Impressora', 'Multifuncional', 'Plotter', 'Scanner', 'Outro'];

export default function EquipmentForm({ item, onSaved, onCancel }) {
  const { user } = useUserRole();
  const { t } = useI18n();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    brand: '',
    serialNumber: '',
    category: 'Impressora',
    status: 'Disponível',
    location: '',
    entryDate: '',
    clientName: '',
    supplier: '',
    purchaseDate: '',
    warrantyEndDate: '',
    notes: '',
    image: '',
    ...item,
  });
  const [errors, setErrors] = useState({});

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
    if (!form.brand.trim()) errs.brand = t('form_brand_required');
    if (!form.serialNumber.trim()) errs.serialNumber = t('form_serial_required');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const data = { ...form, updatedBy: user?.full_name || user?.email };

      if (item?.id) {
        await equipmentService.update(item.id, data);
        if (item.status !== form.status) {
          await stockMovementService.create({
            itemType: 'Equipment',
            itemId: item.id,
            itemName: form.name,
            movementType: 'Edição',
            previousStatus: item.status,
            newStatus: form.status,
            reason: `Estado alterado de "${item.status}" para "${form.status}"`,
            userId: user?.id,
            userName: user?.full_name || user?.email,
          });
        }
        toast.success(t('equipment_updated'));
      } else {
        const created = await equipmentService.create(data);
        await stockMovementService.create({
          itemType: 'Equipment',
          itemId: created.id,
          itemName: form.name,
          movementType: 'Entrada',
          newStatus: form.status,
          reason: 'Novo equipamento registado',
          userId: user?.id,
          userName: user?.full_name || user?.email,
        });
        toast.success(t('equipment_created'));
      }
      onSaved();
    } catch (error) {
      toast.error(error.message || t('form_save_equipment_error'));
    } finally {
      setSaving(false);
    }
  };

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <PageHeader
        title={item ? t('equipment_edit_title') : t('equipment_new_title')}
        actions={<Button variant="ghost" onClick={onCancel}><ArrowLeft className="w-4 h-4 mr-1" />{t('common_back')}</Button>}
      />
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>{t('equipment_name_model')} *</Label>
                <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Ex: Xerox C70 Pro" className={errors.name ? 'border-destructive' : ''} />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label>{t('common_brand')} *</Label>
                <Input value={form.brand} onChange={(e) => update('brand', e.target.value)} placeholder="Ex: Xerox" className={errors.brand ? 'border-destructive' : ''} />
                {errors.brand && <p className="text-xs text-destructive mt-1">{errors.brand}</p>}
              </div>
              <div>
                <Label>{t('equipment_serial_number')} *</Label>
                <Input value={form.serialNumber} onChange={(e) => update('serialNumber', e.target.value)} placeholder={t('equipment_serial_number')} className={errors.serialNumber ? 'border-destructive' : ''} />
                {errors.serialNumber && <p className="text-xs text-destructive mt-1">{errors.serialNumber}</p>}
              </div>
              <div>
                <Label>{t('common_category')}</Label>
                <Select value={form.category} onValueChange={(value) => update('category', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((category) => <SelectItem key={category} value={category}>{translateValue(t, category)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('common_status')}</Label>
                <Select value={form.status} onValueChange={(value) => update('status', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((status) => <SelectItem key={status} value={status}>{translateValue(t, status)}</SelectItem>)}</SelectContent>
                </Select>
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
                <Label>{t('common_client')}</Label>
                <Input value={form.clientName} onChange={(e) => update('clientName', e.target.value)} placeholder={t('common_client')} />
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
              <div>
                <Label>{t('equipment_entry_date')}</Label>
                <Input type="date" value={form.entryDate} onChange={(e) => update('entryDate', e.target.value)} />
              </div>
              <div>
                <Label>{t('equipment_purchase_date')}</Label>
                <Input type="date" value={form.purchaseDate} onChange={(e) => update('purchaseDate', e.target.value)} />
              </div>
              <div>
                <Label>{t('equipment_warranty_end')}</Label>
                <Input type="date" value={form.warrantyEndDate} onChange={(e) => update('warrantyEndDate', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>{t('common_notes')}</Label>
              <Textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder={t('form_additional_notes')} rows={3} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onCancel}>{t('btn_cancelar')}</Button>
              <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
                <Save className="w-4 h-4 mr-1.5" />{saving ? t('users_a_guardar') : t('btn_guardar')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
