import { createEntityService } from '@/services/supabaseEntityService';
import { cleanObjectStrings, normalizeNumber, requireNonNegative, requireText } from '@/utils/validation';

const consumableEntity = createEntityService('Consumable');

const validateConsumable = (data) => {
  requireText(data.name, 'Nome é obrigatório');
  requireText(data.referenceCode, 'Referência é obrigatória');
  requireNonNegative(data.quantity, 'Quantidade não pode ser negativa');
  requireNonNegative(data.minimumStock, 'Stock mínimo não pode ser negativo');
};

const normalizeConsumable = (data) => ({
  ...cleanObjectStrings(data),
  quantity: normalizeNumber(data.quantity, 0),
  minimumStock: normalizeNumber(data.minimumStock, 0),
});

export const consumableService = {
  list: (sort = '-created_date', limit = 500) =>
    consumableEntity.list(sort, limit),

  filter: (query, sort = '-created_date', limit = 500) =>
    consumableEntity.filter(query, sort, limit),

  create: (data) => {
    const cleaned = normalizeConsumable(data);
    validateConsumable(cleaned);
    return consumableEntity.create(cleaned);
  },

  update: (id, data) => {
    const cleaned = normalizeConsumable(data);
    validateConsumable(cleaned);
    return consumableEntity.update(id, cleaned);
  },

  delete: (id) =>
    consumableEntity.delete(id),

  schema: () =>
    consumableEntity.schema(),
};
