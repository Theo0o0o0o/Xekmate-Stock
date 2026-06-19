import { createEntityService } from '@/services/supabaseEntityService';

const partEntity = createEntityService('Part');

export const partService = {
  list: (sort = '-created_date', limit = 500) =>
    partEntity.list(sort, limit),

  filter: (query, sort = '-created_date', limit = 500) =>
    partEntity.filter(query, sort, limit),

  create: (data) =>
    partEntity.create(data),

  update: (id, data) =>
    partEntity.update(id, data),

  delete: (id) =>
    partEntity.delete(id),

  schema: () =>
    partEntity.schema(),
};
