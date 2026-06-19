import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserRole } from '@/lib/useUserRole';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import EquipmentForm from '@/components/equipment/EquipmentForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Printer, Eye, Pencil, Trash2, X } from 'lucide-react';
import { Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { equipmentService } from '@/services/equipmentService';

export default function Equipment() {
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showForm, setShowForm] = useState(searchParams.get('action') === 'new');
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['equipment'], queryFn: () => equipmentService.list('-created_date', 500),
    onSuccess: (data) => {
      const editId = location.state?.editId;
      if (editId && !editingItem && !showForm) {
        const found = data.find(e => e.id === editId);
        if (found) setEditingItem(found);
      }
    }
  });
  useEffect(() => {
    const editId = location.state?.editId;
    if (editId && equipment.length > 0 && !editingItem && !showForm) {
      const found = equipment.find(e => e.id === editId);
      if (found) setEditingItem(found);
    }
  }, [location.state, equipment]);

  const deleteMutation = useMutation({
    mutationFn: (id) => equipmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success('Equipamento eliminado');
      setDeleteId(null);
    }
  });

  const filtered = useMemo(() => {
    let items = equipment;
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(e =>
        e.name?.toLowerCase().includes(s) || e.brand?.toLowerCase().includes(s) ||
        e.serialNumber?.toLowerCase().includes(s) || e.clientName?.toLowerCase().includes(s) ||
        e.location?.toLowerCase().includes(s)
      );
    }
    if (statusFilter !== 'all') items = items.filter(e => e.status === statusFilter);
    if (categoryFilter !== 'all') items = items.filter(e => e.category === categoryFilter);
    return items;
  }, [equipment, search, statusFilter, categoryFilter]);

  const handleSaved = () => {
    setShowForm(false); setEditingItem(null); setSearchParams({});
    queryClient.invalidateQueries({ queryKey: ['equipment'] });
    queryClient.invalidateQueries({ queryKey: ['movements'] });
  };

  const handleCancel = () => {
    setShowForm(false); setEditingItem(null); setSearchParams({});
    if (location.state?.from === 'dashboard') navigate('/');
  };

  if (showForm || editingItem) {
    return <EquipmentForm item={editingItem} onSaved={handleSaved} onCancel={handleCancel} />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Equipamentos"
        description={`${equipment.length} equipamentos registados`}
        actions={isAdmin && (
          <Button size="sm" onClick={() => setShowForm(true)} className="h-8 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />Adicionar
          </Button>
        )}
      />
<div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Pesquisar por nome, marca, nº série, cliente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 h-8 text-sm"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estados</SelectItem>
            {['Disponível','Em uso interno','Em cliente','Em manutenção','Reservada','Vendida','Abatida'].map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40 h-8 text-sm"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {['Impressora','Multifuncional','Plotter','Scanner','Outro'].map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(search || statusFilter !== 'all' || categoryFilter !== 'all') && (
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => { setSearch(''); setStatusFilter('all'); setCategoryFilter('all'); }}>
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-1.5">{[1,2,3,4].map(i => <Skeleton key={i} className="h-11 rounded" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Printer} title="Sem equipamentos" description={search ? 'Nenhum resultado encontrado' : 'Adicione o primeiro equipamento'} actionLabel={isAdmin ? 'Adicionar Equipamento' : undefined} onAction={isAdmin ? () => setShowForm(true) : undefined} />
      ) : (
        <Card className="overflow-hidden shadow-none border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">Nome / Modelo</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">Marca</TableHead>
                  <TableHead className="hidden md:table-cell text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">Nº Série</TableHead>
                  <TableHead className="hidden lg:table-cell text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">Categoria</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">Estado</TableHead>
                  <TableHead className="hidden md:table-cell text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">Localização</TableHead>
                  <TableHead className="hidden lg:table-cell text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">Cliente</TableHead>
                  <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(eq => (
                  <TableRow key={eq.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-medium text-[13px] py-2.5">{eq.name}</TableCell>
                    <TableCell className="text-muted-foreground text-[13px] py-2.5">{eq.brand}</TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-[11px] text-muted-foreground py-2.5">{eq.serialNumber}</TableCell>
                    <TableCell className="hidden lg:table-cell text-[13px] text-muted-foreground py-2.5">{eq.category}</TableCell>
                    <TableCell className="py-2.5"><StatusBadge status={eq.status} /></TableCell>
                    <TableCell className="hidden md:table-cell text-[13px] text-muted-foreground py-2.5">{eq.location || '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-[13px] text-muted-foreground py-2.5">{eq.clientName || '—'}</TableCell>
                    <TableCell className="text-right py-2.5">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                          <Link to={`/equipamentos/${eq.id}`}><Eye className="w-3.5 h-3.5" /></Link>
                        </Button>
                        {isAdmin && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setEditingItem(eq)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {isAdmin && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(eq.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="px-4 py-2 border-t border-border bg-muted/20">
            <p className="text-[11px] text-muted-foreground">{filtered.length} de {equipment.length} equipamentos</p>
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={!!deleteId} onOpenChange={() => setDeleteId(null)}
        title="Eliminar equipamento"
        description="Tem a certeza que pretende eliminar este equipamento? Esta ação não pode ser desfeita."
        onConfirm={() => deleteMutation.mutate(deleteId)}
        confirmLabel="Eliminar" destructive
      />
    </div>
  );
}