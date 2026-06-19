import { createEntityService } from '@/services/supabaseEntityService';

const equipmentEntity = createEntityService('Equipment');

export const equipmentService = {
  list: (sort = '-created_date', limit = 500) =>
    equipmentEntity.list(sort, limit),

  filter: (query, sort = '-created_date', limit = 500) =>
    equipmentEntity.filter(query, sort, limit),

  get: (id) =>
    equipmentEntity.get(id),

  create: (data) =>
    equipmentEntity.create(data),

  update: (id, data) =>
    equipmentEntity.update(id, data),

  delete: (id) =>
    equipmentEntity.delete(id),

  schema: () =>
    equipmentEntity.schema(),
};
