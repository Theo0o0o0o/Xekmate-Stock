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
import { pt } from 'date-fns/locale';
import { stockMovementService } from '@/services/stockMovementService';

const ITEM_TYPES = [
  { value: 'Equipment', label: 'Equipamento' },
  { value: 'Consumable', label: 'Consumível' },
  { value: 'Part', label: 'Peça' },
];
const MOVEMENT_TYPES = ['Entrada', 'Saída', 'Ajuste', 'Edição', 'Reserva', 'Venda', 'Manutenção'];

export default function Movements() {
  const { isAdmin } = useUserRole();
  const [search, setSearch] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState('all');
  const [movementTypeFilter, setMovementTypeFilter] = useState('all');

  const { data: movements = [], isLoading } = useQuery({
    queryKey: ['movements'],
    queryFn: () => stockMovementService.list('-created_date', 500)
  });

  const filtered = useMemo(() => {
    let items = movements;
    if (!isAdmin) items = items.filter(m => ['Entrada', 'Saída'].includes(m.movementType));
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(m =>
        m.itemName?.toLowerCase().includes(s) ||
        m.userName?.toLowerCase().includes(s) ||
        m.reason?.toLowerCase().includes(s)
      );
    }
    if (itemTypeFilter !== 'all') items = items.filter(m => m.itemType === itemTypeFilter);
    if (movementTypeFilter !== 'all') items = items.filter(m => m.movementType === movementTypeFilter);
    return items;
  }, [movements, search, itemTypeFilter, movementTypeFilter, isAdmin]);

  const itemTypeLabel = (t) => ITEM_TYPES.find(i => i.value === t)?.label || t;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Movimentos de Stock"
        description={`${filtered.length} registos`}
      />

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Pesquisar por item, utilizador, motivo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
        <Select value={itemTypeFilter} onValueChange={setItemTypeFilter}>
          <SelectTrigger className="w-full sm:w-36 h-8 text-sm"><SelectValue placeholder="Tipo Item" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os itens</SelectItem>
            {ITEM_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={movementTypeFilter} onValueChange={setMovementTypeFilter}>
          <SelectTrigger className="w-full sm:w-36 h-8 text-sm"><SelectValue placeholder="Movimento" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {MOVEMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        {(search || itemTypeFilter !== 'all' || movementTypeFilter !== 'all') && (
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => { setSearch(''); setItemTypeFilter('all'); setMovementTypeFilter('all'); }}>
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-1.5">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-11 rounded" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={ArrowLeftRight} title="Sem movimentos" description="Nenhum movimento encontrado" />
      ) : (
        <Card className="overflow-hidden shadow-none border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">Data</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">Item</TableHead>
                  <TableHead className="hidden md:table-cell text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">Tipo</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">Movimento</TableHead>
                  <TableHead className="hidden lg:table-cell text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">Anterior</TableHead>
                  <TableHead className="hidden lg:table-cell text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">Novo</TableHead>
                  <TableHead className="hidden md:table-cell text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">Utilizador</TableHead>
                  <TableHead className="hidden lg:table-cell text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(m => (
                  <TableRow key={m.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap py-2.5 font-mono">
                      {m.created_date ? format(new Date(m.created_date), "dd/MM/yy HH:mm", { locale: pt }) : '—'}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <p className="font-medium text-[13px]">{m.itemName}</p>
                      <p className="text-[11px] text-muted-foreground md:hidden">{itemTypeLabel(m.itemType)}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-[12px] text-muted-foreground py-2.5">{itemTypeLabel(m.itemType)}</TableCell>
                    <TableCell className="py-2.5"><StatusBadge status={m.movementType} type="movement" /></TableCell>
                    <TableCell className="hidden lg:table-cell text-center text-[13px] text-muted-foreground py-2.5">{m.previousQuantity ?? '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-center text-[13px] font-semibold py-2.5">{m.newQuantity ?? '—'}</TableCell>
                    <TableCell className="hidden md:table-cell text-[12px] text-muted-foreground py-2.5">{m.userName || '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-[11px] text-muted-foreground max-w-48 truncate py-2.5">{m.reason || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="px-4 py-2 border-t border-border bg-muted/20">
            <p className="text-[11px] text-muted-foreground">{filtered.length} movimentos</p>
          </div>
        </Card>
      )}
    </div>
  );
}