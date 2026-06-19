begin;

insert into public.locations (name, description, type, active)
select v.name, v.description, v.type, v.active
from (values
  ('Armazém Principal', 'Zona principal para equipamentos e consumíveis.', 'Armazém', true),
  ('Prateleira A1', 'Toners Xerox e consumíveis de alta rotação.', 'Prateleira', true),
  ('Prateleira B2', 'Peças de manutenção e kits técnicos.', 'Prateleira', true),
  ('Oficina Técnica', 'Área de reparação e preparação de equipamentos.', 'Oficina', true),
  ('Sala de Impressão', 'Equipamentos em uso interno.', 'Sala', true),
  ('Cliente - Receção', 'Equipamentos instalados em cliente.', 'Cliente', true),
  ('Quarentena', 'Material a aguardar validação técnica.', 'Armazém', true),
  ('Arquivo', 'Equipamentos antigos ou abatidos.', 'Outro', true)
) as v(name, description, type, active)
where not exists (select 1 from public.locations l where l.name = v.name);

insert into public.suppliers (name, contact_name, phone, email, address, notes)
select v.name, v.contact_name, v.phone, v.email, v.address, v.notes
from (values
  ('Xerox Portugal', 'Departamento Comercial', '+351 210 000 100', 'comercial@xerox.pt', 'Lisboa, Portugal', 'Fornecedor principal de equipamentos Xerox.'),
  ('Canon Portugal', 'Suporte Empresas', '+351 214 704 000', 'empresas@canon.pt', 'Lisboa, Portugal', 'Equipamentos e consumíveis Canon.'),
  ('Ricoh Portugal', 'Conta Corporativa', '+351 214 246 000', 'corporativo@ricoh.pt', 'Porto, Portugal', 'Peças e assistência técnica.'),
  ('Konica Minolta', 'Serviço Técnico', '+351 219 000 300', 'suporte@konicaminolta.pt', 'Sintra, Portugal', 'Manutenção e consumíveis.'),
  ('Brother Portugal', 'Canal Revenda', '+351 211 000 500', 'revenda@brother.pt', 'Lisboa, Portugal', 'Impressoras compactas.'),
  ('TechParts Iberia', 'Miguel Santos', '+351 910 222 333', 'orders@techparts.pt', 'Braga, Portugal', 'Fornecedor de peças compatíveis.')
) as v(name, contact_name, phone, email, address, notes)
where not exists (select 1 from public.suppliers s where s.name = v.name);

insert into public.equipment (name, brand, serial_number, category, status, location, entry_date, client_name, supplier, purchase_date, warranty_end_date, notes, updated_by)
select v.name, v.brand, v.serial_number, v.category, v.status, v.location, v.entry_date::date, v.client_name, v.supplier, v.purchase_date::date, v.warranty_end_date::date, v.notes, 'Sistema'
from (values
  ('Xerox VersaLink B415', 'Xerox', 'XRVB415-2024-0007', 'Impressora', 'Disponível', 'Armazém Principal', '2024-06-01', null, 'Xerox Portugal', '2024-05-20', '2027-05-20', 'Equipamento preparado para instalação.'),
  ('Xerox AltaLink C8130', 'Xerox', 'XRALC8130-2023-0142', 'Multifuncional', 'Em cliente', 'Cliente - Receção', '2023-11-15', 'Clínica Central', 'Xerox Portugal', '2023-10-28', '2026-10-28', 'Contrato mensal ativo.'),
  ('Canon imageRUNNER C3226i', 'Canon', 'CIR3226-2024-0041', 'Multifuncional', 'Em uso interno', 'Sala de Impressão', '2024-02-10', null, 'Canon Portugal', '2024-02-01', '2027-02-01', 'Uso interno administrativo.'),
  ('Ricoh IM C3000', 'Ricoh', 'RIMC3000-2023-0098', 'Multifuncional', 'Em manutenção', 'Oficina Técnica', '2023-09-05', null, 'Ricoh Portugal', '2023-08-20', '2026-08-20', 'A substituir kit fusor.'),
  ('Xerox Phaser 6510', 'Xerox', 'XRPH6510-2022-0770', 'Impressora', 'Reservada', 'Armazém Principal', '2022-07-18', 'Escola Norte', 'Xerox Portugal', '2022-07-01', '2025-07-01', 'Reservada para entrega.'),
  ('Brother HL-L5210DN', 'Brother', 'BRHL5210-2024-0023', 'Impressora', 'Disponível', 'Armazém Principal', '2024-04-12', null, 'Brother Portugal', '2024-04-05', '2027-04-05', 'Nova em caixa.'),
  ('Konica Minolta bizhub C250i', 'Konica Minolta', 'KMC250I-2023-0311', 'Multifuncional', 'Vendida', 'Cliente - Receção', '2023-05-22', 'Farmácia Avenida', 'Konica Minolta', '2023-05-10', '2026-05-10', 'Instalada e faturada.'),
  ('HP LaserJet Enterprise M507', 'HP', 'HPM507-2022-1104', 'Impressora', 'Abatida', 'Arquivo', '2022-03-09', null, 'TechParts Iberia', '2022-02-20', '2025-02-20', 'Equipamento sem reparação económica.'),
  ('Xerox WorkCentre 7830', 'Xerox', 'XRWC7830-2021-0888', 'Multifuncional', 'Em manutenção', 'Oficina Técnica', '2021-12-01', null, 'Xerox Portugal', '2021-11-18', '2024-11-18', 'Revisão completa em curso.'),
  ('Canon PlotWave 3600', 'Canon', 'CPW3600-2024-0012', 'Plotter', 'Disponível', 'Armazém Principal', '2024-01-25', null, 'Canon Portugal', '2024-01-15', '2027-01-15', 'Plotter técnico para demonstrações.')
) as v(name, brand, serial_number, category, status, location, entry_date, client_name, supplier, purchase_date, warranty_end_date, notes)
where not exists (select 1 from public.equipment e where e.serial_number = v.serial_number);

insert into public.consumables (name, reference_code, brand, type, compatible_models, quantity, minimum_stock, location, supplier, notes, updated_by)
select v.name, v.reference_code, v.brand, v.type, v.compatible_models, v.quantity, v.minimum_stock, v.location, v.supplier, v.notes, 'Sistema'
from (values
  ('Toner Preto Xerox B415', 'TON-XR-B415-K', 'Xerox', 'Toner', 'VersaLink B415', 8, 3, 'Prateleira A1', 'Xerox Portugal', 'Alta rotação.'),
  ('Toner Cyan Xerox C8130', 'TON-XR-C8130-C', 'Xerox', 'Toner', 'AltaLink C8130/C8135', 4, 2, 'Prateleira A1', 'Xerox Portugal', null),
  ('Toner Magenta Xerox C8130', 'TON-XR-C8130-M', 'Xerox', 'Toner', 'AltaLink C8130/C8135', 3, 2, 'Prateleira A1', 'Xerox Portugal', null),
  ('Toner Yellow Xerox C8130', 'TON-XR-C8130-Y', 'Xerox', 'Toner', 'AltaLink C8130/C8135', 2, 2, 'Prateleira A1', 'Xerox Portugal', 'No limite mínimo.'),
  ('Toner Preto Canon C3226i', 'TON-CN-C3226-K', 'Canon', 'Toner', 'imageRUNNER C3226i', 5, 2, 'Prateleira A1', 'Canon Portugal', null),
  ('Tambor Xerox Phaser 6510', 'DRM-XR-6510', 'Xerox', 'Tambor', 'Phaser 6510, WorkCentre 6515', 1, 2, 'Prateleira B2', 'Xerox Portugal', 'Stock baixo.'),
  ('Fusor Ricoh IM C3000', 'FUS-RC-IMC3000', 'Ricoh', 'Fusor', 'Ricoh IM C3000/C3500', 2, 1, 'Prateleira B2', 'Ricoh Portugal', null),
  ('Cartucho Brother TN-3600', 'TON-BR-TN3600', 'Brother', 'Toner', 'HL-L5210DN', 6, 2, 'Prateleira A1', 'Brother Portugal', null),
  ('Tinta Canon PlotWave Preto', 'INK-CN-PW3600-K', 'Canon', 'Tinta', 'PlotWave 3600', 7, 3, 'Prateleira A1', 'Canon Portugal', null),
  ('Kit Manutenção Xerox 7830', 'KIT-XR-WC7830', 'Xerox', 'Outro', 'WorkCentre 7830/7835', 1, 1, 'Prateleira B2', 'Xerox Portugal', null),
  ('Toner Preto HP M507', 'TON-HP-M507-K', 'HP', 'Toner', 'LaserJet Enterprise M507', 0, 2, 'Prateleira A1', 'TechParts Iberia', 'Esgotado.'),
  ('Tambor Konica C250i', 'DRM-KM-C250I', 'Konica Minolta', 'Tambor', 'bizhub C250i/C300i', 2, 1, 'Prateleira B2', 'Konica Minolta', null),
  ('Fusor Xerox B415', 'FUS-XR-B415', 'Xerox', 'Fusor', 'VersaLink B415', 1, 1, 'Prateleira B2', 'Xerox Portugal', null),
  ('Cartucho Resíduos Xerox C8130', 'WST-XR-C8130', 'Xerox', 'Cartucho', 'AltaLink C8130/C8135', 3, 2, 'Prateleira A1', 'Xerox Portugal', null),
  ('Toner Cyan Canon C3226i', 'TON-CN-C3226-C', 'Canon', 'Toner', 'imageRUNNER C3226i', 2, 2, 'Prateleira A1', 'Canon Portugal', 'No limite mínimo.')
) as v(name, reference_code, brand, type, compatible_models, quantity, minimum_stock, location, supplier, notes)
where not exists (select 1 from public.consumables c where c.reference_code = v.reference_code);

insert into public.parts (name, reference_code, compatible_models, quantity, minimum_stock, location, supplier, notes, updated_by)
select v.name, v.reference_code, v.compatible_models, v.quantity, v.minimum_stock, v.location, v.supplier, v.notes, 'Sistema'
from (values
  ('Rolo de Alimentação Xerox', 'PRT-XR-FEED-001', 'VersaLink B415, Phaser 6510', 12, 4, 'Prateleira B2', 'TechParts Iberia', null),
  ('Kit Pickup Ricoh', 'PRT-RC-PICK-3000', 'Ricoh IM C3000/C3500', 5, 2, 'Prateleira B2', 'Ricoh Portugal', null),
  ('Unidade Duplex Canon', 'PRT-CN-DPX-3226', 'Canon imageRUNNER C3226i', 2, 1, 'Prateleira B2', 'Canon Portugal', null),
  ('Sensor de Papel Xerox', 'PRT-XR-SNS-6510', 'Phaser 6510, WorkCentre 6515', 4, 2, 'Prateleira B2', 'TechParts Iberia', null),
  ('Correia de Transferência Konica', 'PRT-KM-BELT-C250I', 'bizhub C250i/C300i', 1, 1, 'Prateleira B2', 'Konica Minolta', 'Última unidade.'),
  ('Placa Formatter HP', 'PRT-HP-FMT-M507', 'HP LaserJet M507', 1, 1, 'Quarentena', 'TechParts Iberia', 'A testar.'),
  ('Alimentador ADF Xerox', 'PRT-XR-ADF-8130', 'AltaLink C8130/C8135', 2, 1, 'Prateleira B2', 'Xerox Portugal', null),
  ('Rolo Fusor Ricoh', 'PRT-RC-FUSER-ROLL', 'Ricoh IM C3000/C3500', 3, 1, 'Prateleira B2', 'Ricoh Portugal', null),
  ('Painel Touch Canon', 'PRT-CN-LCD-3226', 'Canon imageRUNNER C3226i', 2, 1, 'Prateleira B2', 'Canon Portugal', null),
  ('Fonte de Alimentação Brother', 'PRT-BR-PSU-5210', 'Brother HL-L5210DN', 3, 1, 'Prateleira B2', 'Brother Portugal', null),
  ('Cabeça de Impressão PlotWave', 'PRT-CN-HEAD-PW3600', 'Canon PlotWave 3600', 1, 1, 'Prateleira B2', 'Canon Portugal', 'Peça crítica.')
) as v(name, reference_code, compatible_models, quantity, minimum_stock, location, supplier, notes)
where not exists (select 1 from public.parts p where p.reference_code = v.reference_code);

insert into public.stock_movements (item_type, item_id, item_name, movement_type, new_status, reason, user_name)
select 'Equipment', e.id::text, e.name, 'Entrada', e.status, 'Carga inicial de demonstração', 'Sistema'
from public.equipment e
where e.serial_number in (
  'XRVB415-2024-0007', 'XRALC8130-2023-0142', 'CIR3226-2024-0041', 'RIMC3000-2023-0098', 'XRPH6510-2022-0770',
  'BRHL5210-2024-0023', 'KMC250I-2023-0311', 'HPM507-2022-1104', 'XRWC7830-2021-0888', 'CPW3600-2024-0012'
)
and not exists (
  select 1 from public.stock_movements m
  where m.item_id = e.id::text and m.reason = 'Carga inicial de demonstração'
);

insert into public.stock_movements (item_type, item_id, item_name, movement_type, previous_quantity, new_quantity, quantity_changed, reason, user_name)
select 'Consumable', c.id::text, c.name, 'Entrada', 0, c.quantity, c.quantity, 'Carga inicial de demonstração', 'Sistema'
from public.consumables c
where c.reference_code in (
  'TON-XR-B415-K', 'TON-XR-C8130-C', 'TON-XR-C8130-M', 'TON-XR-C8130-Y', 'TON-CN-C3226-K',
  'DRM-XR-6510', 'FUS-RC-IMC3000', 'TON-BR-TN3600', 'INK-CN-PW3600-K', 'KIT-XR-WC7830',
  'TON-HP-M507-K', 'DRM-KM-C250I', 'FUS-XR-B415', 'WST-XR-C8130', 'TON-CN-C3226-C'
)
and not exists (
  select 1 from public.stock_movements m
  where m.item_id = c.id::text and m.reason = 'Carga inicial de demonstração'
);

insert into public.stock_movements (item_type, item_id, item_name, movement_type, previous_quantity, new_quantity, quantity_changed, reason, user_name)
select 'Part', p.id::text, p.name, 'Entrada', 0, p.quantity, p.quantity, 'Carga inicial de demonstração', 'Sistema'
from public.parts p
where p.reference_code in (
  'PRT-XR-FEED-001', 'PRT-RC-PICK-3000', 'PRT-CN-DPX-3226', 'PRT-XR-SNS-6510', 'PRT-KM-BELT-C250I',
  'PRT-HP-FMT-M507', 'PRT-XR-ADF-8130', 'PRT-RC-FUSER-ROLL', 'PRT-CN-LCD-3226', 'PRT-BR-PSU-5210', 'PRT-CN-HEAD-PW3600'
)
and not exists (
  select 1 from public.stock_movements m
  where m.item_id = p.id::text and m.reason = 'Carga inicial de demonstração'
);

commit;