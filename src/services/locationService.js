import { createEntityService } from '@/services/supabaseEntityService';

const locationEntity = createEntityService('Location');

export const locationService = {
  list: (sort = 'name', limit = 200) =>
    locationEntity.list(sort, limit),

  listActive: () =>
    locationEntity.filter({ active: true }, 'name', 200),

  create: (data) =>
    locationEntity.create(data),

  update: (id, data) =>
    locationEntity.update(id, data),

  delete: (id) =>
    locationEntity.delete(id),
};
