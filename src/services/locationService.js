import { createEntityService } from '@/services/supabaseEntityService';
import { cleanObjectStrings, requireText } from '@/utils/validation';

const locationEntity = createEntityService('Location');

const validateLocation = (data) => {
  requireText(data.name, 'Nome da localização é obrigatório');
  requireText(data.type, 'Tipo da localização é obrigatório');
};

export const locationService = {
  list: (sort = 'name', limit = 200) =>
    locationEntity.list(sort, limit),

  listActive: () =>
    locationEntity.filter({ active: true }, 'name', 200),

  create: (data) => {
    const cleaned = cleanObjectStrings(data);
    validateLocation(cleaned);
    return locationEntity.create(cleaned);
  },

  update: (id, data) => {
    const cleaned = cleanObjectStrings(data);
    validateLocation(cleaned);
    return locationEntity.update(id, cleaned);
  },

  delete: (id) =>
    locationEntity.delete(id),
};
