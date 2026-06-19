import { base44 } from '@/api/base44Client';
export const supplierService = {
  list: (sort = 'name', limit = 200) =>
    base44.entities.Supplier.list(sort, limit),

  create: (data) =>
    base44.entities.Supplier.create(data),

  update: (id, data) =>
    base44.entities.Supplier.update(id, data),

  delete: (id) =>
    base44.entities.Supplier.delete(id),
};