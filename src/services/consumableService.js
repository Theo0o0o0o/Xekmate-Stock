import { base44 } from '@/api/base44Client';
export const consumableService = {
  list: (sort = '-created_date', limit = 500) =>
    base44.entities.Consumable.list(sort, limit),

  filter: (query, sort = '-created_date', limit = 500) =>
    base44.entities.Consumable.filter(query, sort, limit),

  create: (data) =>
    base44.entities.Consumable.create(data),

  update: (id, data) =>
    base44.entities.Consumable.update(id, data),

  delete: (id) =>
    base44.entities.Consumable.delete(id),

  schema: () =>
    base44.entities.Consumable.schema(),
};