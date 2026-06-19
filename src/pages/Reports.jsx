import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/shared/PageHeader';
import StatsCard from '@/components/shared/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download, AlertTriangle, XCircle, Droplets, Wrench, Hash, FileSpreadsheet, Loader2 } from 'lucide-react';
import { equipmentService } from '@/services/equipmentService';
import { consumableService } from '@/services/consumableService';
import { partService } from '@/services/partService';
import { stockMovementService } from '@/services/stockMovementService';
import { locationService } from '@/services/locationService';
import { supplierService } from '@/services/supplierService';
import { exportEquipamentos, exportConsumiveis, exportPecas, exportTudo } from '@/utils/exportXlsx';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';

const CHART_COLORS = ['#D71920', '#2563EB', '#16A34A', '#D97706', '#7C3AED', '#0891B2', '#9F1239'];

export default function Reports() {
  const { t } = useI18n();
  const [exporting, setExporting] = useState(null);

  const { data: equipment = [], isLoading: l1 } = useQuery({
    queryKey: ['equipment'], queryFn: () => equipmentService.list('-created_date', 500)
  });
  const { data: consumables = [], isLoading: l2 } = useQuery({
    queryKey: ['consumables'], queryFn: () => consumableService.list('-created_date', 500)
  });
  const { data: parts = [], isLoading: l3 } = useQuery({
    queryKey: ['parts'], queryFn: () => partService.list('-created_date', 500)
  });

  const isLoading = l1 || l2 || l3;

  const lowStockItems = [
    ...consumables.filter(c => c.quantity > 0 && c.quantity <= c.minimumStock).map(c => ({ ...c, _type: t('stat_consumiveis') })),
    ...parts.filter(p => p.quantity > 0 && p.quantity <= p.minimumStock).map(p => ({ ...p, _type: t('nav_pecas') }))
  ];
  const outOfStockItems = [
    ...consumables.filter(c => c.quantity <= 0).map(c => ({ ...c, _type: t('stat_consumiveis') })),
    ...parts.filter(p => p.quantity <= 0).map(p => ({ ...p, _type: t('nav_pecas') }))
  ];

  const statusData = ['Disponível', 'Em uso interno', 'Em cliente', 'Em manutenção', 'Reservada', 'Vendida', 'Abatida']
    .map((s, i) => ({ name: s, value: equipment.filter(e => e.status === s).length, fill: CHART_COLORS[i] }))
    .filter(d => d.value > 0);

  const locationData = {};
  equipment.forEach(e => { if (e.location) locationData[e.location] = (locationData[e.location] || 0) + 1; });
  const locChartData = Object.entries(locationData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const handleExport = async (type) => {
    setExporting(type);
    try {
      if (type === 'equipamentos') {
        exportEquipamentos(equipment);
        toast.success('xekmate_equipamentos.xlsx');
      } else if (type === 'consumiveis') {
        exportConsumiveis(consumables);
        toast.success('xekmate_consumiveis.xlsx');
      } else if (type === 'pecas') {
        exportPecas(parts);
        toast.success('xekmate_pecas.xlsx');
      } else if (type === 'tudo') {
        const [movements, locations, suppliers] = await Promise.all([
          stockMovementService.list('-created_date', 1000),
          locationService.list('name', 200),
          supplierService.list('name', 200),
        ]);
        exportTudo({ equipment, consumables, parts, movements, locations, suppliers });
        toast.success('xekmate_stock_completo.xlsx');
      }
    } catch {
      toast.error('Export error');
    } finally {
      setExporting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <PageHeader title={t('reports_title')} />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-md" />)}
        </div>
      </div>
    );
  }

  const tooltipStyle = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, fontSize: 12, color: '#111' };

  const ExportBtn = ({ id, label }) => (
    <Button variant="outline" size="sm" className="h-8 text-xs" disabled={!!exporting} onClick={() => handleExport(id)}>
      {exporting === id ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Download className="w-3.5 h-3.5 mr-1" />}
      {label}
    </Button>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('reports_title')}
        description={t('reports_desc')}
        actions={
          <div className="flex gap-2 flex-wrap">
            <ExportBtn id="equipamentos" label={t('nav_equipamentos')} />
            <ExportBtn id="consumiveis" label={t('nav_consumiveis')} />
            <ExportBtn id="pecas" label={t('nav_pecas')} />
            <Button size="sm" className="h-8 text-xs" disabled={!!exporting} onClick={() => handleExport('tudo')}>
              {exporting === 'tudo' ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />}
              {t('reports_export_tudo')}
            </Button>
          </div>
        }
      />

      <p className="text-[11px] text-muted-foreground -mt-2">{t('reports_export_info')}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard title={t('stat_total_eq')} value={equipment.length} icon={Hash} variant="brand" accent />
        <StatsCard title={t('stat_consumiveis')} value={consumables.length} icon={Droplets} variant="default" />
        <StatsCard title={t('stat_pecas')} value={parts.length} icon={Wrench} variant="default" />
        <StatsCard title={t('stat_alertas')} value={lowStockItems.length + outOfStockItems.length} icon={AlertTriangle} variant={lowStockItems.length + outOfStockItems.length > 0 ? 'warning' : 'default'} accent={lowStockItems.length + outOfStockItems.length > 0} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {statusData.length > 0 && (
          <Card className="shadow-none border-border">
            <CardHeader className="py-3 px-4 border-b border-border">
              <CardTitle className="text-[13px] font-semibold">{t('reports_eq_estado')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 pb-3 px-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={statusData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" radius={[3,3,0,0]}>
                    {statusData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
        {locChartData.length > 0 && (
          <Card className="shadow-none border-border">
            <CardHeader className="py-3 px-4 border-b border-border">
              <CardTitle className="text-[13px] font-semibold">{t('reports_eq_loc')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 pb-3 px-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={locChartData} layout="vertical" barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} width={90} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="#D71920" radius={[0,3,3,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {lowStockItems.length > 0 && (
        <Card className="shadow-none border-red-200">
          <CardHeader className="py-3 px-4 border-b border-red-100">
            <CardTitle className="text-[13px] font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-primary" />
              {t('reports_stock_baixo')}
              <span className="ml-auto text-[11px] font-normal text-muted-foreground">{lowStockItems.length} {t('items_suffix')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('col_nome')}</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('col_tipo')}</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('col_referencia')}</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('col_atual')}</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('col_minimo')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.map(item => (
                  <TableRow key={item.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium text-[13px] py-2.5">{item.name}</TableCell>
                    <TableCell className="text-[12px] text-muted-foreground py-2.5">{item._type}</TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground py-2.5">{item.referenceCode}</TableCell>
                    <TableCell className="text-center font-bold text-primary text-[13px] py-2.5">{item.quantity}</TableCell>
                    <TableCell className="text-center text-[13px] text-muted-foreground py-2.5">{item.minimumStock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {outOfStockItems.length > 0 && (
        <Card className="shadow-none border-red-200">
          <CardHeader className="py-3 px-4 border-b border-red-100">
            <CardTitle className="text-[13px] font-semibold flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-primary" />
              {t('reports_esgotados')}
              <span className="ml-auto text-[11px] font-normal text-muted-foreground">{outOfStockItems.length} {t('items_suffix')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('col_nome')}</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('col_tipo')}</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('col_referencia')}</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2.5">{t('col_localizacao')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outOfStockItems.map(item => (
                  <TableRow key={item.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium text-[13px] py-2.5">{item.name}</TableCell>
                    <TableCell className="text-[12px] text-muted-foreground py-2.5">{item._type}</TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground py-2.5">{item.referenceCode}</TableCell>
                    <TableCell className="text-[12px] text-muted-foreground py-2.5">{item.location || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}