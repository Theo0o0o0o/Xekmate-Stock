import { createEntityService } from '@/services/supabaseEntityService';
import { cleanObjectStrings, isValidEmail, isValidPhone, requireText } from '@/utils/validation';

const supplierEntity = createEntityService('Supplier');

const validateSupplier = (data) => {
  requireText(data.name, 'Nome do fornecedor é obrigatório');
  if (!isValidEmail(data.email)) throw new Error('Email do fornecedor inválido');
  if (!isValidPhone(data.phone)) throw new Error('Telefone do fornecedor inválido');
};

export const supplierService = {
  list: (sort = 'name', limit = 200) =>
    supplierEntity.list(sort, limit),

  create: (data) => {
    const cleaned = cleanObjectStrings(data);
    validateSupplier(cleaned);
    return supplierEntity.create(cleaned);
  },

  update: (id, data) => {
    const cleaned = cleanObjectStrings(data);
    validateSupplier(cleaned);
    return supplierEntity.update(id, cleaned);
  },

  delete: (id) =>
    supplierEntity.delete(id),
};
