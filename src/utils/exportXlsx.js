import * as XLSX from 'xlsx';
const XK_RED = 'D71920';
const XK_WHITE = 'FFFFFF';
const XK_GRAY = 'F3F4F6';
const XK_DARK = '2B2B2B';
function fmtDate(val) {
  if (!val) return '—';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleDateString('pt-PT');
  } catch { return String(val); }
}

function fmtVal(val) {
  if (val === null || val === undefined || val === '') return '—';
  return val;
}

function getStockStatus(quantity, minimumStock) {
  const q = Number(quantity) || 0;
  const m = Number(minimumStock) || 0;
  if (q <= 0) return 'Esgotado';
  if (q <= m) return 'Stock Baixo';
  return 'Em Stock';
}
function styleSheet(ws, headers, data) {
  headers.forEach((_, ci) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: ci });
    if (!ws[cellRef]) return;
    ws[cellRef].s = {
      font: { bold: true, color: { rgb: XK_WHITE }, name: 'Calibri', sz: 11 },
      fill: { fgColor: { rgb: XK_RED } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: false },
      border: {
        bottom: { style: 'thin', color: { rgb: 'A80F16' } },
        right: { style: 'thin', color: { rgb: 'A80F16' } },
      }
    };
  });
  for (let ri = 1; ri <= data.length; ri++) {
    const isEven = ri % 2 === 0;
    headers.forEach((_, ci) => {
      const cellRef = XLSX.utils.encode_cell({ r: ri, c: ci });
      if (!ws[cellRef]) return;
      const cellVal = ws[cellRef].v;
      let fillColor = isEven ? XK_GRAY : XK_WHITE;
      let fontColor = XK_DARK;
      if (cellVal === 'Esgotado') { fillColor = 'FEE2E2'; fontColor = 'B91C1C'; }
      else if (cellVal === 'Stock Baixo') { fillColor = 'FEF3C7'; fontColor = 'B45309'; }
      else if (cellVal === 'Em Stock') { fillColor = isEven ? 'D1FAE5' : 'ECFDF5'; fontColor = '065F46'; }

      ws[cellRef].s = {
        font: { name: 'Calibri', sz: 10, color: { rgb: fontColor } },
        fill: { fgColor: { rgb: fillColor } },
        alignment: { vertical: 'center', wrapText: ci === headers.length - 1 },
        border: {
          bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
          right: { style: 'thin', color: { rgb: 'E5E7EB' } },
        }
      };
    });
  }
  const colWidths = headers.map((h, ci) => {
    let max = String(h).length + 2;
    for (let ri = 0; ri < data.length; ri++) {
      const v = data[ri][ci];
      const len = v != null ? String(v).length : 0;
      if (len > max) max = len;
    }
    return { wch: Math.min(Math.max(max, 8), 50) };
  });
  ws['!cols'] = colWidths;
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };
  ws['!autofilter'] = { ref: ws['!ref'] };
}

function makeSheet(headers, rows) {
  const data = rows;
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  styleSheet(ws, headers, data);
  return ws;
}

function downloadWorkbook(wb, filename) {
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true });
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function exportEquipamentos(equipment) {
  const headers = ['Nome', 'Marca', 'Nº Série', 'Categoria', 'Estado', 'Localização', 'Cliente', 'Fornecedor', 'Data de Entrada', 'Data de Compra', 'Fim da Garantia', 'Observações'];
  const rows = equipment.map(e => [
    fmtVal(e.name), fmtVal(e.brand), fmtVal(e.serialNumber), fmtVal(e.category),
    fmtVal(e.status), fmtVal(e.location), fmtVal(e.clientName), fmtVal(e.supplier),
    fmtDate(e.entryDate), fmtDate(e.purchaseDate), fmtDate(e.warrantyEndDate), fmtVal(e.notes)
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, makeSheet(headers, rows), 'Equipamentos');
  downloadWorkbook(wb, 'xekmate_equipamentos.xlsx');
}

export function exportConsumiveis(consumables) {
  const headers = ['Nome', 'Referência', 'Marca', 'Tipo', 'Modelos Compatíveis', 'Quantidade Atual', 'Stock Mínimo', 'Estado do Stock', 'Localização', 'Fornecedor', 'Observações'];
  const rows = consumables.map(c => [
    fmtVal(c.name), fmtVal(c.referenceCode), fmtVal(c.brand), fmtVal(c.type),
    fmtVal(c.compatibleModels), Number(c.quantity) || 0, Number(c.minimumStock) || 0,
    getStockStatus(c.quantity, c.minimumStock),
    fmtVal(c.location), fmtVal(c.supplier), fmtVal(c.notes)
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, makeSheet(headers, rows), 'Consumíveis');
  downloadWorkbook(wb, 'xekmate_consumiveis.xlsx');
}

export function exportPecas(parts) {
  const headers = ['Nome', 'Referência', 'Modelos Compatíveis', 'Quantidade Atual', 'Stock Mínimo', 'Estado do Stock', 'Localização', 'Fornecedor', 'Observações'];
  const rows = parts.map(p => [
    fmtVal(p.name), fmtVal(p.referenceCode), fmtVal(p.compatibleModels),
    Number(p.quantity) || 0, Number(p.minimumStock) || 0,
    getStockStatus(p.quantity, p.minimumStock),
    fmtVal(p.location), fmtVal(p.supplier), fmtVal(p.notes)
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, makeSheet(headers, rows), 'Peças');
  downloadWorkbook(wb, 'xekmate_pecas.xlsx');
}

export function exportTudo({ equipment, consumables, parts, movements, locations, suppliers }) {
  const wb = XLSX.utils.book_new();
  const now = new Date().toLocaleString('pt-PT');
  const lowStock = [
    ...consumables.filter(c => c.quantity > 0 && c.quantity <= c.minimumStock),
    ...parts.filter(p => p.quantity > 0 && p.quantity <= p.minimumStock)
  ];
  const outOfStock = [
    ...consumables.filter(c => c.quantity <= 0),
    ...parts.filter(p => p.quantity <= 0)
  ];

  const resumoData = [
    ['Aplicação', 'XEKmate Stock'],
    ['Data/Hora de Exportação', now],
    ['', ''],
    ['Total de Equipamentos', equipment.length],
    ['Total de Consumíveis', consumables.length],
    ['Total de Peças', parts.length],
    ['Itens com Stock Baixo', lowStock.length],
    ['Itens Esgotados', outOfStock.length],
  ];
  const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
  wsResumo['!cols'] = [{ wch: 30 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');
  const eqHeaders = ['Nome', 'Marca', 'Nº Série', 'Categoria', 'Estado', 'Localização', 'Cliente', 'Fornecedor', 'Data de Entrada', 'Data de Compra', 'Fim da Garantia', 'Observações'];
  const eqRows = equipment.map(e => [
    fmtVal(e.name), fmtVal(e.brand), fmtVal(e.serialNumber), fmtVal(e.category),
    fmtVal(e.status), fmtVal(e.location), fmtVal(e.clientName), fmtVal(e.supplier),
    fmtDate(e.entryDate), fmtDate(e.purchaseDate), fmtDate(e.warrantyEndDate), fmtVal(e.notes)
  ]);
  XLSX.utils.book_append_sheet(wb, makeSheet(eqHeaders, eqRows), 'Equipamentos');
  const conHeaders = ['Nome', 'Referência', 'Marca', 'Tipo', 'Modelos Compatíveis', 'Quantidade Atual', 'Stock Mínimo', 'Estado do Stock', 'Localização', 'Fornecedor', 'Observações'];
  const conRows = consumables.map(c => [
    fmtVal(c.name), fmtVal(c.referenceCode), fmtVal(c.brand), fmtVal(c.type),
    fmtVal(c.compatibleModels), Number(c.quantity) || 0, Number(c.minimumStock) || 0,
    getStockStatus(c.quantity, c.minimumStock),
    fmtVal(c.location), fmtVal(c.supplier), fmtVal(c.notes)
  ]);
  XLSX.utils.book_append_sheet(wb, makeSheet(conHeaders, conRows), 'Consumíveis');
  const partHeaders = ['Nome', 'Referência', 'Modelos Compatíveis', 'Quantidade Atual', 'Stock Mínimo', 'Estado do Stock', 'Localização', 'Fornecedor', 'Observações'];
  const partRows = parts.map(p => [
    fmtVal(p.name), fmtVal(p.referenceCode), fmtVal(p.compatibleModels),
    Number(p.quantity) || 0, Number(p.minimumStock) || 0,
    getStockStatus(p.quantity, p.minimumStock),
    fmtVal(p.location), fmtVal(p.supplier), fmtVal(p.notes)
  ]);
  XLSX.utils.book_append_sheet(wb, makeSheet(partHeaders, partRows), 'Peças');
  if (movements && movements.length > 0) {
    const movHeaders = ['Data/Hora', 'Utilizador', 'Tipo de Item', 'Nome do Item', 'Tipo de Movimento', 'Qtd Anterior', 'Qtd Nova', 'Qtd Alterada', 'Estado Anterior', 'Estado Novo', 'Motivo'];
    const movRows = movements.map(m => [
      m.created_date ? new Date(m.created_date).toLocaleString('pt-PT') : '—',
      fmtVal(m.userName), fmtVal(m.itemType), fmtVal(m.itemName), fmtVal(m.movementType),
      m.previousQuantity ?? '—', m.newQuantity ?? '—', m.quantityChanged ?? '—',
      fmtVal(m.previousStatus), fmtVal(m.newStatus), fmtVal(m.reason)
    ]);
    XLSX.utils.book_append_sheet(wb, makeSheet(movHeaders, movRows), 'Movimentos de Stock');
  }
  if (locations && locations.length > 0) {
    const locHeaders = ['Nome', 'Tipo', 'Descrição', 'Ativa'];
    const locRows = locations.map(l => [fmtVal(l.name), fmtVal(l.type), fmtVal(l.description), l.active !== false ? 'Sim' : 'Não']);
    XLSX.utils.book_append_sheet(wb, makeSheet(locHeaders, locRows), 'Localizações');
  }
  if (suppliers && suppliers.length > 0) {
    const supHeaders = ['Nome', 'Contacto', 'Telefone', 'Email', 'Morada', 'Observações'];
    const supRows = suppliers.map(s => [fmtVal(s.name), fmtVal(s.contactName), fmtVal(s.phone), fmtVal(s.email), fmtVal(s.address), fmtVal(s.notes)]);
    XLSX.utils.book_append_sheet(wb, makeSheet(supHeaders, supRows), 'Fornecedores');
  }

  downloadWorkbook(wb, 'xekmate_stock_completo.xlsx');
}