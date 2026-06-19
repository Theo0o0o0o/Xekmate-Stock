import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useUserRole } from '@/lib/useUserRole';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function StockMovementDialog({ open, onOpenChange, item, entityType, onComplete }) {
  const { user } = useUserRole();
  const [type, setType] = useState('Entrada');
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!qty || qty <= 0) { toast.error('Quantidade deve ser maior que 0'); return; }
    if (type === 'Ajuste' && !reason.trim()) { toast.error('Motivo é obrigatório para ajustes'); return; }
    
    const currentQty = Number(item.quantity) || 0;
    let newQty;
    if (type === 'Entrada') newQty = currentQty + Number(qty);
    else if (type === 'Saída') {
      newQty = currentQty - Number(qty);
      if (newQty < 0) { toast.error('Quantidade insuficiente em stock'); return; }
    } else {
      newQty = Number(qty);
      if (newQty < 0) { toast.error('Quantidade não pode ser negativa'); return; }
    }

    setSaving(true);
    await base44.entities[entityType].update(item.id, { quantity: newQty, updatedBy: user?.full_name || user?.email });
    await base44.entities.StockMovement.create({
      itemType: entityType, itemId: item.id, itemName: item.name,
      movementType: type, previousQuantity: currentQty, newQuantity: newQty,
      quantityChanged: type === 'Ajuste' ? newQty - currentQty : (type === 'Entrada' ? Number(qty) : -Number(qty)),
      reason: reason || `${type} de stock`, userId: user?.id, userName: user?.full_name || user?.email
    });
    toast.success(`Movimento de ${type.toLowerCase()} registado`);
    setSaving(false);
    setType('Entrada'); setQty(1); setReason('');
    onOpenChange(false);
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registar Movimento — {item?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">Quantidade atual: <span className="font-bold text-foreground">{item?.quantity}</span></p>
          <div>
            <Label>Tipo de Movimento</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Entrada">Entrada</SelectItem>
                <SelectItem value="Saída">Saída</SelectItem>
                <SelectItem value="Ajuste">Ajuste (definir quantidade)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{type === 'Ajuste' ? 'Nova Quantidade' : 'Quantidade'}</Label>
            <Input type="number" min={type === 'Ajuste' ? 0 : 1} value={qty} onChange={e => setQty(e.target.value)} />
          </div>
          <div>
            <Label>Motivo {type === 'Ajuste' ? '*' : ''}</Label>
            <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Motivo do movimento..." rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? 'A registar...' : 'Registar Movimento'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}