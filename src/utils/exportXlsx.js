import * as XLSX from 'xlsx';

const XK_RED = 'D71920';
const XK_WHITE = 'FFFFFF';
const XK_GRAY = 'F3F4F6';
const XK_DARK = '2B2B2B';
const EMPTY = '-';

function fmtDate(value) {
  if (!value) return EMPTY;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('pt-PT');
}

function fmtDateTime(value) {
  if (!value) return EMPTY;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('pt-PT');
}

function fmtVal(value) {
  if (value === null || value === undefined || value === '') return EMPTY;
  return value;
}

function fmtNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function getStockStatus(quantity, minimumStock) {
  const q = fmtNumber(quantity);
  const m = fmtNumber(minimumStock);
  if (q <= 0) return 'Esgotado';
  if (q <= m) return 'Stock Baixo';
  return 'Em Stock';
}

function styleSheet(ws, headers, data) {
  headers.forEach((_, columnIndex) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: columnIndex });
    if (!ws[cellRef]) return;
    ws[cellRef].s = {
      font: { bold: true, color: { rgb: XK_WHITE }, name: 'Calibri', sz: 11 },
      fill: { fgColor: { rgb: XK_RED } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: false },
      border: {
        bottom: { style: 'thin', color: { rgb: 'A80F16' } },
        right: { style: 'thin', color: { rgb: 'A80F16' } },
      },
    };
  });

  for (let rowIndex = 1; rowIndex <= data.length; rowIndex += 1) {
    const isEven = rowIndex % 2 === 0;
    headers.forEach((_, columnIndex) => {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex });
      if (!ws[cellRef]) return;
      const cellValue = ws[cellRef].v;
      let fillColor = isEven ? XK_GRAY : XK_WHITE;
      let fontColor = XK_DARK;

      if (cellValue === 'Esgotado') {
        fillColor = 'FEE2E2';
        fontColor = 'B91C1C';
      } else if (cellValue === 'Stock Baixo') {
        fillColor = 'FEE2E2';
        fontColor = 'B91C1C';
      } else if (cellValue === 'Em Stock') {
        fillColor = isEven ? 'D1FAE5' : 'ECFDF5';
        fontColor = '065F46';
      }

      ws[cellRef].s = {
        font: { name: 'Calibri', sz: 10, color: { rgb: fontColor } },
        fill: { fgColor: { rgb: fillColor } },
        alignment: { vertical: 'center', wrapText: columnIndex === headers.length - 1 },
        border: {
          bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
          right: { style: 'thin', color: { rgb: 'E5E7EB' } },
        },
      };
    });
  }

  ws['!cols'] = headers.map((header, columnIndex) => {
    const maxLength = data.reduce((max, row) => {
      const value = row[columnIndex];
      return Math.max(max, value == null ? 0 : String(value).length);
    }, String(header).length + 2);

    return { wch: Math.min(Math.max(maxLength, 8), 50) };
  });

  ws['!freeze'] = { xSplit: 0, ySplit: 1 };
  if (ws['!ref']) ws['!autofilter'] = { ref: ws['!ref'] };
}

function makeSheet(headers, rows) {
  const data = rows.length ? rows : [headers.map(() => EMPTY)];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  styleSheet(ws, headers, data);
  return ws;
}

function downloadWorkbook(wb, filename) {
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true });
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

const equipmentHeaders = ['Nome', 'Marca', 'N Serie', 'Categoria', 'Estado', 'Localizacao', 'Cliente', 'Fornecedor', 'Data de Entrada', 'Data de Compra', 'Fim da Garantia', 'Observacoes'];
const consumableHeaders = ['Nome', 'Referencia', 'Marca', 'Tipo', 'Modelos Compativeis', 'Quantidade Atual', 'Stock Minimo', 'Estado do Stock', 'Localizacao', 'Fornecedor', 'Observacoes'];
const partHeaders = ['Nome', 'Referencia', 'Modelos Compativeis', 'Quantidade Atual', 'Stock Minimo', 'Estado do Stock', 'Localizacao', 'Fornecedor', 'Observacoes'];

function equipmentRows(equipment = []) {
  return equipment.map((item) => [
    fmtVal(item.name), fmtVal(item.brand), fmtVal(item.serialNumber), fmtVal(item.category),
    fmtVal(item.status), fmtVal(item.location), fmtVal(item.clientName), fmtVal(item.supplier),
    fmtDate(item.entryDate), fmtDate(item.purchaseDate), fmtDate(item.warrantyEndDate), fmtVal(item.notes),
  ]);
}

function consumableRows(consumables = []) {
  return consumables.map((item) => [
    fmtVal(item.name), fmtVal(item.referenceCode), fmtVal(item.brand), fmtVal(item.type),
    fmtVal(item.compatibleModels), fmtNumber(item.quantity), fmtNumber(item.minimumStock),
    getStockStatus(item.quantity, item.minimumStock), fmtVal(item.location), fmtVal(item.supplier), fmtVal(item.notes),
  ]);
}

function partRows(parts = []) {
  return parts.map((item) => [
    fmtVal(item.name), fmtVal(item.referenceCode), fmtVal(item.compatibleModels),
    fmtNumber(item.quantity), fmtNumber(item.minimumStock), getStockStatus(item.quantity, item.minimumStock),
    fmtVal(item.location), fmtVal(item.supplier), fmtVal(item.notes),
  ]);
}

export function exportEquipamentos(equipment = []) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, makeSheet(equipmentHeaders, equipmentRows(equipment)), 'Equipamentos');
  downloadWorkbook(wb, 'xekmate_equipamentos.xlsx');
}

export function exportConsumiveis(consumables = []) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, makeSheet(consumableHeaders, consumableRows(consumables)), 'Consumiveis');
  downloadWorkbook(wb, 'xekmate_consumiveis.xlsx');
}

export function exportPecas(parts = []) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, makeSheet(partHeaders, partRows(parts)), 'Pecas');
  downloadWorkbook(wb, 'xekmate_pecas.xlsx');
}

export function exportTudo({ equipment = [], consumables = [], parts = [], movements = [], locations = [], suppliers = [] }) {
  const wb = XLSX.utils.book_new();
  const lowStock = [
    ...consumables.filter((item) => fmtNumber(item.quantity) > 0 && fmtNumber(item.quantity) <= fmtNumber(item.minimumStock)),
    ...parts.filter((item) => fmtNumber(item.quantity) > 0 && fmtNumber(item.quantity) <= fmtNumber(item.minimumStock)),
  ];
  const outOfStock = [
    ...consumables.filter((item) => fmtNumber(item.quantity) <= 0),
    ...parts.filter((item) => fmtNumber(item.quantity) <= 0),
  ];

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['Aplicacao', 'XEKmate Stock'],
    ['Data/Hora de Exportacao', new Date().toLocaleString('pt-PT')],
    ['', ''],
    ['Total de Equipamentos', equipment.length],
    ['Total de Consumiveis', consumables.length],
    ['Total de Pecas', parts.length],
    ['Itens com Stock Baixo', lowStock.length],
    ['Itens Esgotados', outOfStock.length],
  ]), 'Resumo');

  XLSX.utils.book_append_sheet(wb, makeSheet(equipmentHeaders, equipmentRows(equipment)), 'Equipamentos');
  XLSX.utils.book_append_sheet(wb, makeSheet(consumableHeaders, consumableRows(consumables)), 'Consumiveis');
  XLSX.utils.book_append_sheet(wb, makeSheet(partHeaders, partRows(parts)), 'Pecas');

  XLSX.utils.book_append_sheet(wb, makeSheet(
    ['Data/Hora', 'Utilizador', 'Tipo de Item', 'Nome do Item', 'Tipo de Movimento', 'Qtd Anterior', 'Qtd Nova', 'Qtd Alterada', 'Estado Anterior', 'Estado Novo', 'Motivo'],
    movements.map((movement) => [
      fmtDateTime(movement.created_date), fmtVal(movement.userName), fmtVal(movement.itemType), fmtVal(movement.itemName), fmtVal(movement.movementType),
      movement.previousQuantity ?? EMPTY, movement.newQuantity ?? EMPTY, movement.quantityChanged ?? EMPTY,
      fmtVal(movement.previousStatus), fmtVal(movement.newStatus), fmtVal(movement.reason),
    ])
  ), 'Movimentos');

  XLSX.utils.book_append_sheet(wb, makeSheet(
    ['Nome', 'Tipo', 'Descricao', 'Ativa'],
    locations.map((location) => [fmtVal(location.name), fmtVal(location.type), fmtVal(location.description), location.active !== false ? 'Sim' : 'Nao'])
  ), 'Localizacoes');

  XLSX.utils.book_append_sheet(wb, makeSheet(
    ['Nome', 'Contacto', 'Telefone', 'Email', 'Morada', 'Observacoes'],
    suppliers.map((supplier) => [fmtVal(supplier.name), fmtVal(supplier.contactName), fmtVal(supplier.phone), fmtVal(supplier.email), fmtVal(supplier.address), fmtVal(supplier.notes)])
  ), 'Fornecedores');

  downloadWorkbook(wb, 'xekmate_stock_completo.xlsx');
}
