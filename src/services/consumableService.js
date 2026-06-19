import { createEntityService } from '@/services/supabaseEntityService';

const consumableEntity = createEntityService('Consumable');

export const consumableService = {
  list: (sort = '-created_date', limit = 500) =>
    consumableEntity.list(sort, limit),

  filter: (query, sort = '-created_date', limit = 500) =>
    consumableEntity.filter(query, sort, limit),

  create: (data) =>
    consumableEntity.create(data),

  update: (id, data) =>
    consumableEntity.update(id, data),

  delete: (id) =>
    consumableEntity.delete(id),

  schema: () =>
    consumableEntity.schema(),
};
