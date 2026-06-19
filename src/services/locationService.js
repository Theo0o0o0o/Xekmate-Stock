import { base44 } from '@/api/base44Client';
export const locationService = {
  list: (sort = 'name', limit = 200) =>
    base44.entities.Location.list(sort, limit),

  listActive: () =>
    base44.entities.Location.filter({ active: true }, 'name', 200),

  create: (data) =>
    base44.entities.Location.create(data),

  update: (id, data) =>
    base44.entities.Location.update(id, data),

  delete: (id) =>
    base44.entities.Location.delete(id),
};