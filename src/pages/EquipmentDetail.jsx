import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { equipmentService } from '@/services/equipmentService';
import { stockMovementService } from '@/services/stockMovementService';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Printer, MapPin, User, Calendar, Shield, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { enUS, pt } from 'date-fns/locale';
import { translateValue, useI18n } from '@/lib/i18n';

export default function EquipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const dateLocale = lang === 'en' ? enUS : pt;

  const { data: eq, isLoading } = useQuery({
    queryKey: ['equipment', id],
    queryFn: () => equipmentService.get(id),
  });

  const { data: movements = [] } = useQuery({
    queryKey: ['movements', 'equipment', id],
    queryFn: () => stockMovementService.filter({ itemId: id }, '-created_date', 50),
    enabled: !!id,
  });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 rounded-xl" /></div>;
  if (!eq) return <div className="text-center py-16"><p className="text-muted-foreground">{t('equipment_not_found')}</p><Button asChild variant="outline" className="mt-4"><Link to="/equipamentos">{t('common_back')}</Link></Button></div>;

  const InfoRow = ({ icon: Icon, label, value }) => value ? (
    <div className="flex items-start gap-3 py-2">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  ) : null;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader
        title={eq.name}
        description={`${eq.brand} · ${translateValue(t, eq.category)}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/equipamentos')}><ArrowLeft className="w-4 h-4 mr-1" />{t('common_back')}</Button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">{t('equipment_info')}</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-center gap-2 mb-3"><StatusBadge status={eq.status} /></div>
            <InfoRow icon={Printer} label={t('equipment_serial_number')} value={eq.serialNumber} />
            <InfoRow icon={MapPin} label={t('common_location')} value={eq.location} />
            <InfoRow icon={User} label={t('common_client')} value={eq.clientName} />
            <InfoRow icon={FileText} label={t('common_supplier')} value={eq.supplier} />
            <InfoRow icon={Calendar} label={t('equipment_entry_date')} value={eq.entryDate ? format(new Date(eq.entryDate), 'dd/MM/yyyy') : null} />
            <InfoRow icon={Calendar} label={t('equipment_purchase_date')} value={eq.purchaseDate ? format(new Date(eq.purchaseDate), 'dd/MM/yyyy') : null} />
            <InfoRow icon={Shield} label={t('equipment_warranty_end')} value={eq.warrantyEndDate ? format(new Date(eq.warrantyEndDate), 'dd/MM/yyyy') : null} />
            {eq.notes && <div className="pt-2 border-t"><p className="text-xs text-muted-foreground">{t('common_notes')}</p><p className="text-sm mt-1">{eq.notes}</p></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">{t('equipment_history')}</CardTitle></CardHeader>
          <CardContent>
            {movements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t('equipment_no_movements')}</p>
            ) : (
              <div className="space-y-3">
                {movements.map((movement) => (
                  <div key={movement.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={movement.movementType} type="movement" />
                        <span className="text-xs text-muted-foreground">{movement.created_date ? format(new Date(movement.created_date), 'dd MMM yyyy HH:mm', { locale: dateLocale }) : ''}</span>
                      </div>
                      {movement.reason && <p className="text-sm text-muted-foreground mt-1">{movement.reason}</p>}
                      <p className="text-xs text-muted-foreground mt-0.5">{t('equipment_by')} {movement.userName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
