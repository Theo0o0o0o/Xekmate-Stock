import React from 'react';
import { cn } from '@/lib/utils';
import { translateValue, useI18n } from '@/lib/i18n';
const equipmentStatusStyles = {
  'Disponível':     'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Em uso interno': 'bg-blue-50 text-blue-700 border-blue-200',
  'Em cliente':     'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Em manutenção':  'bg-red-50 text-primary border-red-200',
  'Reservada':      'bg-red-50 text-primary border-red-200',
  'Vendida':        'bg-slate-100 text-slate-600 border-slate-200',
  'Abatida':        'bg-red-50 text-red-700 border-red-200',
};

const stockStatusStyles = {
  'Em stock':    'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Stock baixo': 'bg-red-50 text-primary border-red-200',
  'Esgotado':    'bg-red-50 text-red-700 border-red-200',
};

const movementTypeStyles = {
  'Entrada':    'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Saída':      'bg-red-50 text-red-700 border-red-200',
  'Ajuste':     'bg-blue-50 text-blue-700 border-blue-200',
  'Edição':     'bg-slate-100 text-slate-600 border-slate-200',
  'Reserva':    'bg-red-50 text-primary border-red-200',
  'Venda':      'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Manutenção': 'bg-red-50 text-primary border-red-200',
};

export function getStockStatus(quantity, minimumStock) {
  if (quantity <= 0) return 'Esgotado';
  if (quantity <= minimumStock) return 'Stock baixo';
  return 'Em stock';
}

const fallback = 'bg-slate-100 text-slate-600 border-slate-200';

export default function StatusBadge({ status, type = 'equipment' }) {
  const { t } = useI18n();
  const styleMap =
    type === 'stock' ? stockStatusStyles :
    type === 'movement' ? movementTypeStyles :
    equipmentStatusStyles;

  const cls = styleMap[status] || fallback;

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border",
      cls
    )}>
      {translateValue(t, status)}
    </span>
  );
}
