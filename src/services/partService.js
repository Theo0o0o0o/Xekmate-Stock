import { base44 } from '@/api/base44Client';
export const partService = {
  list: (sort = '-created_date', limit = 500) =>
    base44.entities.Part.list(sort, limit),

  filter: (query, sort = '-created_date', limit = 500) =>
    base44.entities.Part.filter(query, sort, limit),

  create: (data) =>
    base44.entities.Part.create(data),

  update: (id, data) =>
    base44.entities.Part.update(id, data),

  delete: (id) =>
    base44.entities.Part.delete(id),

  schema: () =>
    base44.entities.Part.schema(),
};