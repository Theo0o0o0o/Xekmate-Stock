import { base44 } from '@/api/base44Client';
export const equipmentService = {
  list: (sort = '-created_date', limit = 500) =>
    base44.entities.Equipment.list(sort, limit),

  filter: (query, sort = '-created_date', limit = 500) =>
    base44.entities.Equipment.filter(query, sort, limit),

  get: (id) =>
    base44.entities.Equipment.filter({ id }),

  create: (data) =>
    base44.entities.Equipment.create(data),

  update: (id, data) =>
    base44.entities.Equipment.update(id, data),

  delete: (id) =>
    base44.entities.Equipment.delete(id),

  schema: () =>
    base44.entities.Equipment.schema(),
};