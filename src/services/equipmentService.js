import { createEntityService } from '@/services/supabaseEntityService';
import { cleanObjectStrings, normalizeText, requireText } from '@/utils/validation';

const equipmentEntity = createEntityService('Equipment');

const validateEquipment = async (data, currentId = null) => {
  requireText(data.name, 'Nome/modelo é obrigatório');
  requireText(data.brand, 'Marca é obrigatória');
  requireText(data.serialNumber, 'Nº de série é obrigatório');
  requireText(data.category, 'Categoria é obrigatória');

  const serialNumber = normalizeText(data.serialNumber).toLowerCase();
  const matches = await equipmentEntity.list('-created_date', 500);
  const duplicate = matches.some((equipment) =>
    equipment.id !== currentId &&
    normalizeText(equipment.serialNumber).toLowerCase() === serialNumber
  );

  if (duplicate) {
    throw new Error('Já existe um equipamento com este nº de série');
  }
};

export const equipmentService = {
  list: (sort = '-created_date', limit = 500) =>
    equipmentEntity.list(sort, limit),

  filter: (query, sort = '-created_date', limit = 500) =>
    equipmentEntity.filter(query, sort, limit),

  get: (id) =>
    equipmentEntity.get(id),

  create: async (data) => {
    const cleaned = cleanObjectStrings(data);
    await validateEquipment(cleaned);
    return equipmentEntity.create(cleaned);
  },

  update: async (id, data) => {
    const cleaned = cleanObjectStrings(data);
    await validateEquipment(cleaned, id);
    return equipmentEntity.update(id, cleaned);
  },

  delete: (id) =>
    equipmentEntity.delete(id),

  schema: () =>
    equipmentEntity.schema(),
};
