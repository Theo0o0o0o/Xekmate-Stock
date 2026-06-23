import React, { useState } from 'react';
import { useUserRole } from '@/lib/useUserRole';
import { consumableService } from '@/services/consumableService';
import { partService } from '@/services/partService';
import { stockMovementService } from '@/services/stockMovementService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { translateValue, useI18n } from '@/lib/i18n';

export default function StockMovementDialog({ open, onOpenChange, item, entityType, onComplete }) {
  const { user } = useUserRole();
  const { t } = useI18n();
  const entityService = entityType === 'Consumable' ? consumableService : partService;
  const [type, setType] = useState('Entrada');
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const requestedQty = Number(qty);
    if (!Number.isFinite(requestedQty) || requestedQty < 0 || (type !== 'Ajuste' && requestedQty <= 0)) {
      toast.error(type === 'Ajuste' ? t('stock_error_nonnegative') : t('stock_error_positive'));
      return;
    }
    if (type === 'Ajuste' && !reason.trim()) {
      toast.error(t('stock_error_adjust_reason'));
      return;
    }

    const currentQty = Number(item.quantity) || 0;
    let newQty;
    if (type === 'Entrada') newQty = currentQty + requestedQty;
    else if (type === 'Saída') {
      newQty = currentQty - requestedQty;
      if (newQty < 0) {
        toast.error(t('stock_error_insufficient'));
        return;
      }
    } else {
      newQty = requestedQty;
      if (newQty < 0) {
        toast.error(t('stock_error_nonnegative'));
        return;
      }
    }

    setSaving(true);
    try {
      await entityService.update(item.id, { quantity: newQty, updatedBy: user?.full_name || user?.email });
      await stockMovementService.create({
        itemType: entityType,
        itemId: item.id,
        itemName: item.name,
        movementType: type,
        previousQuantity: currentQty,
        newQuantity: newQty,
        quantityChanged: type === 'Ajuste' ? newQty - currentQty : (type === 'Entrada' ? requestedQty : -requestedQty),
        reason: reason || `${type} de stock`,
        userId: user?.id,
        userName: user?.full_name || user?.email,
      });
      toast.success(t('stock_success_registered'));
      setType('Entrada');
      setQty(1);
      setReason('');
      onOpenChange(false);
      onComplete();
    } catch (error) {
      toast.error(error.message || t('stock_error_register'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('stock_movement_title')} - {item?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">{t('stock_current_quantity')}: <span className="font-bold text-foreground">{item?.quantity}</span></p>
          <div>
            <Label>{t('stock_movement_type')}</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Entrada">{translateValue(t, 'Entrada')}</SelectItem>
                <SelectItem value="Saída">{translateValue(t, 'Saída')}</SelectItem>
                <SelectItem value="Ajuste">{t('stock_adjust_option')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{type === 'Ajuste' ? t('stock_new_quantity') : t('stock_quantity')}</Label>
            <Input type="number" min={type === 'Ajuste' ? 0 : 1} value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
          <div>
            <Label>{t('common_reason')} {type === 'Ajuste' ? '*' : ''}</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t('stock_reason_placeholder')} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('btn_cancelar')}</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? t('stock_registering') : t('stock_register_button')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
