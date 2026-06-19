import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import StatsCard from '@/components/shared/StatsCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Droplets, Wrench, AlertTriangle, CheckCircle, Plus, Package, XCircle, Hash } from 'lucide-react';
import { format } from 'date-fns';
import { pt, enUS } from 'date-fns/locale';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { equipmentService } from '@/services/equipmentService';
import { consumableService } from '@/services/consumableService';
import { partService } from '@/services/partService';
import { stockMovementService } from '@/services/stockMovementService';
import { useI18n } from '@/lib/i18n';

const CHART_COLORS = ['#D71920', '#2563EB', '#16A34A', '#D97706', '#7C3AED', '#0891B2', '#9F1239'];

const MovementDot = ({ type }) => {
  const dotClass = {
    'Entrada': 'bg-emerald-500',
    'Saída': 'bg-red-500',
    'Ajuste': 'bg-blue-500',
    'Manutenção': 'bg-amber-500',
    'Reserva': 'bg-orange-500',
    'Venda': 'bg-indigo-500',
    'Edição': 'bg-slate-400',
  }[type] || 'bg-slate-400';
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${dotClass} shrink-0 mt-1.5`} />;
};

export default function Dashboard() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const dateLocale = lang === 'en' ? enUS : pt;

  const { data: equipment = [], isLoading: loadingEq } = useQuery({
    queryKey: ['equipment'], queryFn: () => equipmentService.list('-created_date', 200)
  });
  const { data: consumables = [], isLoading: loadingCon } = useQuery({
    queryKey: ['consumables'], queryFn: () => consumableService.list('-created_date', 200)
  });
  const { data: parts = [], isLoading: loadingParts } = useQuery({
    queryKey: ['parts'], queryFn: () => partService.list('-created_date', 200)
  });
  const { data: movements = [], isLoading: loadingMov } = useQuery({
    queryKey: ['movements'], queryFn: () => stockMovementService.list('-created_date', 20)
  });

  const isLoading = loadingEq || loadingCon || loadingParts || loadingMov;

  const eqAvailable = equipment.filter(e => e.status === 'Disponível').length;
  const eqMaintenance = equipment.filter(e => e.status === 'Em manutenção').length;
  const eqClient = equipment.filter(e => e.status === 'Em cliente').length;

  const lowStockItems = [
    ...consumables.filter(c => c.quantity > 0 && c.quantity <= c.minimumStock).map(c => ({ ...c, _type: t('stat_consumiveis') })),
    ...parts.filter(p => p.quantity > 0 && p.quantity <= p.minimumStock).map(p => ({ ...p, _type: t('nav_pecas') }))
  ];
  const outOfStockItems = [
    ...consumables.filter(c => c.quantity <= 0).map(c => ({ ...c, _type: t('stat_consumiveis') })),
    ...parts.filter(p => p.quantity <= 0).map(p => ({ ...p, _type: t('nav_pecas') }))
  ];

  const statusData = ['Disponível', 'Em uso interno', 'Em cliente', 'Em manutenção', 'Reservada', 'Vendida', 'Abatida']
    .map((s, i) => ({ name: s, value: equipment.filter(e => e.status === s).length, color: CHART_COLORS[i] }))
    .filter(d => d.value > 0);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-8 w-24 rounded" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-md" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <Skeleton className="h-64 lg:col-span-2 rounded-md" />
          <Skeleton className="h-64 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{t('dashboard_title')}</h1>
          <p className="text-[12px] text-muted-foreground">
            {equipment.length} {t('dashboard_subtitle_eq')} · {consumables.length} {t('dashboard_subtitle_con')} · {parts.length} {t('dashboard_subtitle_pecas')}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" className="h-8 text-xs" onClick={() => navigate('/equipamentos?action=new', { state: { from: 'dashboard' } })}>
            <Plus className="w-3.5 h-3.5 mr-1" />{t('btn_equipamento')}
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate('/consumiveis?action=new', { state: { from: 'dashboard' } })}>
            <Plus className="w-3.5 h-3.5 mr-1" />{t('btn_consumivel')}
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate('/pecas?action=new', { state: { from: 'dashboard' } })}>
            <Plus className="w-3.5 h-3.5 mr-1" />{t('btn_peca')}
          </Button>
        </div>
      </div>
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard title={t('stat_total_eq')} value={equipment.length} icon={Hash} variant="brand" accent />
        <StatsCard title={t('stat_disponiveis')} value={eqAvailable} icon={CheckCircle} variant="default" />
        <StatsCard title={t('stat_manutencao')} value={eqMaintenance} icon={Hash} variant="warning" />
        <StatsCard title={t('stat_em_cliente')} value={eqClient} icon={Package} variant="neutral" />
        <StatsCard title={t('stat_consumiveis')} value={consumables.length} icon={Droplets} variant="default" />
        <StatsCard title={t('stat_pecas')} value={parts.length} icon={Wrench} variant="default" />
        <StatsCard
          title={t('stat_stock_baixo')}
          value={lowStockItems.length}
          icon={AlertTriangle}
          variant={lowStockItems.length > 0 ? 'warning' : 'default'}
          accent={lowStockItems.length > 0}
        />
        <StatsCard
          title={t('stat_esgotados')}
          value={outOfStockItems.length}
          icon={XCircle}
          variant={outOfStockItems.length > 0 ? 'critical' : 'default'}
          accent={outOfStockItems.length > 0}
        />
      </div>
<div className="grid lg:grid-cols-3 gap-4">
<Card className="lg:col-span-2 shadow-none border-border">
          <CardHeader className="py-3 px-4 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[13px] font-semibold">{t('ultimos_movimentos')}</CardTitle>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
                <Link to="/movimentos">{t('ver_todos')}</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {movements.length === 0 ? (
              <p className="text-[13px] text-muted-foreground py-10 text-center">{t('sem_movimentos')}</p>
            ) : (
              <div className="divide-y divide-border">
                {movements.slice(0, 10).map(m => (
                  <div key={m.id} className="flex items-start gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors">
                    <MovementDot type={m.movementType} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] font-medium truncate">{m.itemName}</p>
                        <StatusBadge status={m.movementType} type="movement" />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {m.userName && <span className="font-medium text-foreground/60">{m.userName}</span>}
                        {m.userName && ' · '}
                        {m.created_date ? format(new Date(m.created_date), "dd MMM, HH:mm", { locale: dateLocale }) : '—'}
                        {m.reason && <span className="text-muted-foreground/70"> · {m.reason}</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
{statusData.length > 0 && (
          <Card className="shadow-none border-border">
            <CardHeader className="py-3 px-4 border-b border-border">
              <CardTitle className="text-[13px] font-semibold">{t('estado_equipamentos')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 pb-3 px-4">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={68}
                    dataKey="value"
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, color: '#111' }}
                    formatter={(value, name) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {statusData.map((d, i) => (
                  <div key={i} className="grid grid-cols-[1fr_2rem] items-center gap-3 text-[12px]">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-sm shrink-0" style={{ background: d.color }} />
                      <span className="text-muted-foreground truncate">{d.name}</span>
                    </div>
                    <span className="font-semibold tabular-nums text-right text-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
{(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="grid lg:grid-cols-2 gap-4">
          {lowStockItems.length > 0 && (
            <Card className="shadow-none border-amber-200">
              <CardHeader className="py-3 px-4 border-b border-amber-100">
                <CardTitle className="text-[13px] font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  {t('stock_baixo')}
                  <span className="ml-auto text-[11px] font-normal text-muted-foreground">{lowStockItems.length} {t('items_suffix')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {lowStockItems.slice(0, 5).map(item => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-2 hover:bg-muted/20">
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium truncate">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">{item._type} · {item.referenceCode}</p>
                      </div>
                      <span className="text-[12px] font-bold text-amber-600 ml-3 shrink-0">{item.quantity}/{item.minimumStock}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {outOfStockItems.length > 0 && (
            <Card className="shadow-none border-red-200">
              <CardHeader className="py-3 px-4 border-b border-red-100">
                <CardTitle className="text-[13px] font-semibold flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-primary" />
                  {t('esgotados')}
                  <span className="ml-auto text-[11px] font-normal text-muted-foreground">{outOfStockItems.length} {t('items_suffix')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {outOfStockItems.slice(0, 5).map(item => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-2 hover:bg-muted/20">
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium truncate">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">{item._type} · {item.referenceCode}</p>
                      </div>
                      <span className="text-[12px] font-bold text-primary ml-3 shrink-0">0</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
