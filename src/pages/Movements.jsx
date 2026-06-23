import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUserRole } from '@/lib/useUserRole';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeftRight, X } from 'lucide-react';
import { format } from 'date-fns';
import { enUS, pt } from 'date-fns/locale';
import { stockMovementService } from '@/services/stockMovementService';
import { translateValue, useI18n } from '@/lib/i18n';

const ITEM_TYPES = [
  { value: 'Equipment', labelKey: 'item_equipment' },
  { value: 'Consumable', labelKey: 'item_consumable' },
  { value: 'Part', labelKey: 'item_part' },
];
const MOVEMENT_TYPES = ['Entrada', 'Saída', 'Ajuste', 'Edição', 'Reserva', 'Venda', 'Manutenção'];

export default function Movements() {
  const { isAdmin } = useUserRole();
  const { t, lang } = useI18n();
  const dateLocale = lang === 'en' ? enUS : pt;
  const [search, setSearch] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState('all');
  const [movementTypeFilter, setMovementTypeFilter] = useState('all');

  const { data: movements = [], isLoading } = useQuery({
    queryKey: ['movements'],
    queryFn: () => stockMovementService.list('-created_date', 500),
  });

  const filtered = useMemo(() => {
    let items = movements;
    if (!isAdmin) items = items.filter((m) => ['Entrada', 'Saída'].includes(m.movementType));
    if (search) {
      const s = search.toLowerCase();
      items = items.filter((m) =>
        m.itemName?.toLowerCase().includes(s) ||
        m.userName?.toLowerCase().includes(s) ||
        m.reason?.toLowerCase().includes(s)
      );
    }
    if (itemTypeFilter !== 'all') items = items.filter((m) => m.itemType === itemTypeFilter);
    if (movementTypeFilter !== 'all') items = items.filter((m) => m.movementType === movementTypeFilter);
    return items;
  }, [movements, search, itemTypeFilter, movementTypeFilter, isAdmin]);

  const itemTypeLabel = (type) => {
    const option = ITEM_TYPES.find((item) => item.value === type);
    return option ? t(option.labelKey) : type;
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('movements_title')}
        description={`${filtered.length} ${t('movements_records')}`}
      />

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t('movements_search')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
        <Select value={itemTypeFilter} onValueChange={setItemTypeFilter}>
          <SelectTrigger className="w-full sm:w-36 h-8 text-sm"><SelectValue placeholder={t('movements_item_type')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('movements_all_items')}</SelectItem>
            {ITEM_TYPES.map((item) => <SelectItem key={item.value} value={item.value}>{t(item.labelKey)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={movementTypeFilter} onValueChange={setMovementTypeFilter}>
          <SelectTrigger className="w-full sm:w-36 h-8 text-sm"><SelectValue placeholder={t('movements_filter')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('movements_all')}</SelectItem>
            {MOVEMENT_TYPES.map((type) => <SelectItem key={type} value={type}>{translateValue(t, type)}</SelectItem>)}
          </SelectContent>
        </Select>
        {(search || itemTypeFilter !== 'all' || movementTypeFilter !== 'all') && (
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => { setSearch(''); setItemTypeFilter('all'); setMovementTypeFilter('all'); }}>
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-1.5">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-11 rounded" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={ArrowLeftRight} title={t('movements_empty_title')} description={t('movements_empty_desc')} />
      ) : (
        <Card className="overflow-hidden shadow-none border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('common_date')}</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('common_item')}</TableHead>
                  <TableHead className="hidden md:table-cell text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('common_type')}</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('movements_filter')}</TableHead>
                  <TableHead className="hidden lg:table-cell text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('common_previous')}</TableHead>
                  <TableHead className="hidden lg:table-cell text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('common_new')}</TableHead>
                  <TableHead className="hidden md:table-cell text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('common_user')}</TableHead>
                  <TableHead className="hidden lg:table-cell text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('common_reason')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((movement) => (
                  <TableRow key={movement.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap py-2.5 font-mono">
                      {movement.created_date ? format(new Date(movement.created_date), 'dd/MM/yy HH:mm', { locale: dateLocale }) : '-'}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <p className="font-medium text-[13px]">{movement.itemName}</p>
                      <p className="text-[11px] text-muted-foreground md:hidden">{itemTypeLabel(movement.itemType)}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-[12px] text-muted-foreground py-2.5">{itemTypeLabel(movement.itemType)}</TableCell>
                    <TableCell className="py-2.5"><StatusBadge status={movement.movementType} type="movement" /></TableCell>
                    <TableCell className="hidden lg:table-cell text-center text-[13px] text-muted-foreground py-2.5">{movement.previousQuantity ?? '-'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-center text-[13px] font-semibold py-2.5">{movement.newQuantity ?? '-'}</TableCell>
                    <TableCell className="hidden md:table-cell text-[12px] text-muted-foreground py-2.5">{movement.userName || '-'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-[11px] text-muted-foreground max-w-48 truncate py-2.5">{movement.reason || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="px-4 py-2 border-t border-border bg-muted/20">
            <p className="text-[11px] text-muted-foreground">{filtered.length} {t('movements_count')}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
