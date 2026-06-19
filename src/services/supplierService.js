import { createEntityService } from '@/services/supabaseEntityService';

const supplierEntity = createEntityService('Supplier');

export const supplierService = {
  list: (sort = 'name', limit = 200) =>
    supplierEntity.list(sort, limit),

  create: (data) =>
    supplierEntity.create(data),

  update: (id, data) =>
    supplierEntity.update(id, data),

  delete: (id) =>
    supplierEntity.delete(id),
};
