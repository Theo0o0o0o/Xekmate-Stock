import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserRole } from '@/lib/useUserRole';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge, { getStockStatus } from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import StockItemForm from '@/components/shared/StockItemForm';
import StockMovementDialog from '@/components/shared/StockMovementDialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Droplets, Pencil, Trash2, ArrowLeftRight, X } from 'lucide-react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { consumableService } from '@/services/consumableService';

const TYPES = ['Toner', 'Tinta', 'Cartucho', 'Tambor', 'Fusor', 'Outro'];

export default function Consumables() {
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [showForm, setShowForm] = useState(searchParams.get('action') === 'new');
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [movementItem, setMovementItem] = useState(null);

  const { data: consumables = [], isLoading } = useQuery({
    queryKey: ['consumables'], queryFn: () => consumableService.list('-created_date', 500)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => consumableService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consumables'] });
      toast.success('Consumível eliminado');
      setDeleteId(null);
    }
  });

  const filtered = useMemo(() => {
    let items = consumables;
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(c =>
        c.name?.toLowerCase().includes(s) || c.referenceCode?.toLowerCase().includes(s) ||
        c.brand?.toLowerCase().includes(s) || c.compatibleModels?.toLowerCase().includes(s) ||
        c.location?.toLowerCase().includes(s)
      );
    }
    if (typeFilter !== 'all') items = items.filter(c => c.type === typeFilter);
    if (stockFilter === 'low') items = items.filter(c => c.quantity > 0 && c.quantity <= c.minimumStock);
    if (stockFilter === 'out') items = items.filter(c => c.quantity <= 0);
    return items;
  }, [consumables, search, typeFilter, stockFilter]);

  const handleSaved = () => {
    setShowForm(false); setEditingItem(null); setSearchParams({});
    queryClient.invalidateQueries({ queryKey: ['consumables'] });
    queryClient.invalidateQueries({ queryKey: ['movements'] });
  };

  const handleCancel = () => {
    setShowForm(false); setEditingItem(null); setSearchParams({});
    if (location.state?.from === 'dashboard') navigate('/');
  };

  if (showForm || editingItem) {
    return <StockItemForm item={editingItem} entityType="Consumable" typeOptions={TYPES} onSaved={handleSaved} onCancel={handleCancel} />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Consumíveis"
        description={`${consumables.length} consumíveis registados`}
        actions={isAdmin && (
          <Button size="sm" onClick={() => setShowForm(true)} className="h-8 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />Adicionar
          </Button>
        )}
      />

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Pesquisar por nome, referência, marca, modelo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-36 h-8 text-sm"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-full sm:w-36 h-8 text-sm"><SelectValue placeholder="Stock" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo o stock</SelectItem>
            <SelectItem value="low">Stock baixo</SelectItem>
            <SelectItem value="out">Esgotado</SelectItem>
          </SelectContent>
        </Select>
        {(search || typeFilter !== 'all' || stockFilter !== 'all') && (
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => { setSearch(''); setTypeFilter('all'); setStockFilter('all'); }}>
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-1.5">{[1,2,3,4].map(i => <Skeleton key={i} className="h-11 rounded" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Droplets} title="Sem consumíveis" description={search ? 'Nenhum resultado' : 'Adicione o primeiro consumível'} actionLabel={isAdmin ? 'Adicionar' : undefined} onAction={isAdmin ? () => setShowForm(true) : undefined} />
      ) : (
        <Card className="overflow-hidden shadow-none border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">Nome</TableHead>
                  <TableHead className="hidden md:table-cell text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">Referência</TableHead>
                  <TableHead className="hidden lg:table-cell text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">Tipo</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">Qtd</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">Estado</TableHead>
                  <TableHead className="hidden md:table-cell text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">Localização</TableHead>
                  <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(c => {
                  const stockStatus = getStockStatus(c.quantity, c.minimumStock);
                  return (
                    <TableRow key={c.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="py-2.5">
                        <p className="font-medium text-[13px]">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground md:hidden">{c.referenceCode}</p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-[11px] text-muted-foreground py-2.5">{c.referenceCode}</TableCell>
                      <TableCell className="hidden lg:table-cell text-[13px] text-muted-foreground py-2.5">{c.type || '—'}</TableCell>
                      <TableCell className="text-center font-semibold text-[13px] py-2.5">{c.quantity}</TableCell>
                      <TableCell className="py-2.5"><StatusBadge status={stockStatus} type="stock" /></TableCell>
                      <TableCell className="hidden md:table-cell text-[13px] text-muted-foreground py-2.5">{c.location || '—'}</TableCell>
                      <TableCell className="text-right py-2.5">
                        <div className="flex items-center justify-end gap-0.5">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setMovementItem(c)} title="Registar movimento">
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                          </Button>
                          {isAdmin && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setEditingItem(c)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {isAdmin && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(c.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="px-4 py-2 border-t border-border bg-muted/20">
            <p className="text-[11px] text-muted-foreground">{filtered.length} de {consumables.length} consumíveis</p>
          </div>
        </Card>
      )}

      {movementItem && (
        <StockMovementDialog open={!!movementItem} onOpenChange={() => setMovementItem(null)} item={movementItem} entityType="Consumable" onComplete={handleSaved} />
      )}
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Eliminar consumível" description="Esta ação não pode ser desfeita." onConfirm={() => deleteMutation.mutate(deleteId)} confirmLabel="Eliminar" destructive />
    </div>
  );
}