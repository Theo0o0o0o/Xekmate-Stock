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
import { Plus, Search, Wrench, Pencil, Trash2, ArrowLeftRight, X } from 'lucide-react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { partService } from '@/services/partService';
import { useI18n } from '@/lib/i18n';

export default function Parts() {
  const { isAdmin } = useUserRole();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [showForm, setShowForm] = useState(searchParams.get('action') === 'new');
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [movementItem, setMovementItem] = useState(null);

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ['parts'],
    queryFn: () => partService.list('-created_date', 500),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => partService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      toast.success(t('parts_deleted'));
      setDeleteId(null);
    },
  });

  const filtered = useMemo(() => {
    let items = parts;
    if (search) {
      const s = search.toLowerCase();
      items = items.filter((p) =>
        p.name?.toLowerCase().includes(s) ||
        p.referenceCode?.toLowerCase().includes(s) ||
        p.compatibleModels?.toLowerCase().includes(s) ||
        p.location?.toLowerCase().includes(s)
      );
    }
    if (stockFilter === 'low') items = items.filter((p) => p.quantity > 0 && p.quantity <= p.minimumStock);
    if (stockFilter === 'out') items = items.filter((p) => p.quantity <= 0);
    return items;
  }, [parts, search, stockFilter]);

  const handleSaved = () => {
    setShowForm(false);
    setEditingItem(null);
    setSearchParams({});
    queryClient.invalidateQueries({ queryKey: ['parts'] });
    queryClient.invalidateQueries({ queryKey: ['movements'] });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
    setSearchParams({});
    if (location.state?.from === 'dashboard') navigate('/');
  };

  if (showForm || editingItem) {
    return <StockItemForm item={editingItem} entityType="Part" onSaved={handleSaved} onCancel={handleCancel} />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('parts_title')}
        description={`${parts.length} ${t('parts_registered')}`}
        actions={isAdmin && (
          <Button size="sm" onClick={() => setShowForm(true)} className="h-8 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />{t('common_add')}
          </Button>
        )}
      />

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t('parts_search')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-full sm:w-36 h-8 text-sm"><SelectValue placeholder="Stock" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('stock_all')}</SelectItem>
            <SelectItem value="low">{t('stock_low_filter')}</SelectItem>
            <SelectItem value="out">{t('stock_out_filter')}</SelectItem>
          </SelectContent>
        </Select>
        {(search || stockFilter !== 'all') && (
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => { setSearch(''); setStockFilter('all'); }}>
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-1.5">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-11 rounded" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Wrench} title={t('parts_empty_title')} description={search ? t('common_no_results') : t('parts_empty_desc')} actionLabel={isAdmin ? t('common_add') : undefined} onAction={isAdmin ? () => setShowForm(true) : undefined} />
      ) : (
        <Card className="overflow-hidden shadow-none border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('common_name')}</TableHead>
                  <TableHead className="hidden md:table-cell text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('common_reference')}</TableHead>
                  <TableHead className="hidden lg:table-cell text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('common_models')}</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('common_quantity_short')}</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('common_status')}</TableHead>
                  <TableHead className="hidden md:table-cell text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('common_location')}</TableHead>
                  <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('common_actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => {
                  const stockStatus = getStockStatus(p.quantity, p.minimumStock);
                  return (
                    <TableRow key={p.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="py-2.5">
                        <p className="font-medium text-[13px]">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground md:hidden">{p.referenceCode}</p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-[11px] text-muted-foreground py-2.5">{p.referenceCode}</TableCell>
                      <TableCell className="hidden lg:table-cell text-[12px] text-muted-foreground py-2.5">{p.compatibleModels || '-'}</TableCell>
                      <TableCell className="text-center font-semibold text-[13px] py-2.5">{p.quantity}</TableCell>
                      <TableCell className="py-2.5"><StatusBadge status={stockStatus} type="stock" /></TableCell>
                      <TableCell className="hidden md:table-cell text-[13px] text-muted-foreground py-2.5">{p.location || '-'}</TableCell>
                      <TableCell className="text-right py-2.5">
                        <div className="flex items-center justify-end gap-0.5">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setMovementItem(p)} title={t('register_movement')}>
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                          </Button>
                          {isAdmin && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setEditingItem(p)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {isAdmin && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(p.id)}>
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
            <p className="text-[11px] text-muted-foreground">{filtered.length} {t('equipment_showing')} {parts.length} {t('dashboard_subtitle_pecas')}</p>
          </div>
        </Card>
      )}

      {movementItem && (
        <StockMovementDialog open={!!movementItem} onOpenChange={() => setMovementItem(null)} item={movementItem} entityType="Part" onComplete={handleSaved} />
      )}
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title={t('parts_delete_title')} description={t('delete_irreversible')} onConfirm={() => deleteMutation.mutate(deleteId)} confirmLabel={t('common_delete')} destructive />
    </div>
  );
}
