import { createEntityService } from '@/services/supabaseEntityService';
import { cleanObjectStrings, normalizeNumber, requireNonNegative, requireText } from '@/utils/validation';

const partEntity = createEntityService('Part');

const validatePart = (data) => {
  requireText(data.name, 'Nome é obrigatório');
  requireText(data.referenceCode, 'Referência é obrigatória');
  requireNonNegative(data.quantity, 'Quantidade não pode ser negativa');
  requireNonNegative(data.minimumStock, 'Stock mínimo não pode ser negativo');
};

const normalizePart = (data) => ({
  ...cleanObjectStrings(data),
  quantity: normalizeNumber(data.quantity, 0),
  minimumStock: normalizeNumber(data.minimumStock, 0),
});

export const partService = {
  list: (sort = '-created_date', limit = 500) =>
    partEntity.list(sort, limit),

  filter: (query, sort = '-created_date', limit = 500) =>
    partEntity.filter(query, sort, limit),

  create: (data) => {
    const cleaned = normalizePart(data);
    validatePart(cleaned);
    return partEntity.create(cleaned);
  },

  update: (id, data) => {
    const cleaned = normalizePart(data);
    validatePart(cleaned);
    return partEntity.update(id, cleaned);
  },

  delete: (id) =>
    partEntity.delete(id),

  schema: () =>
    partEntity.schema(),
};
