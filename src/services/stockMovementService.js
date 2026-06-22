import { createEntityService } from '@/services/supabaseEntityService';
import { cleanObjectStrings, normalizeNumber, requireText } from '@/utils/validation';

const movementEntity = createEntityService('StockMovement');

const validateMovement = (data) => {
  requireText(data.itemType, 'Tipo de item é obrigatório');
  requireText(data.itemName, 'Nome do item é obrigatório');
  requireText(data.movementType, 'Tipo de movimento é obrigatório');
  requireText(data.userId, 'Utilizador é obrigatório para registar movimentos');
  requireText(data.userName, 'Nome do utilizador é obrigatório para registar movimentos');

  if (data.previousQuantity !== undefined && normalizeNumber(data.previousQuantity, -1) < 0) {
    throw new Error('Quantidade anterior não pode ser negativa');
  }

  if (data.newQuantity !== undefined && normalizeNumber(data.newQuantity, -1) < 0) {
    throw new Error('Nova quantidade não pode ser negativa');
  }
};

const normalizeMovement = (data) => cleanObjectStrings({
  ...data,
  previousQuantity: data.previousQuantity === undefined || data.previousQuantity === null ? undefined : normalizeNumber(data.previousQuantity, 0),
  newQuantity: data.newQuantity === undefined || data.newQuantity === null ? undefined : normalizeNumber(data.newQuantity, 0),
  quantityChanged: data.quantityChanged === undefined || data.quantityChanged === null ? undefined : normalizeNumber(data.quantityChanged, 0),
});

export const stockMovementService = {
  list: (sort = '-created_date', limit = 500) =>
    movementEntity.list(sort, limit),

  filter: (query, sort = '-created_date', limit = 500) =>
    movementEntity.filter(query, sort, limit),

  create: (data) => {
    const cleaned = normalizeMovement(data);
    validateMovement(cleaned);
    return movementEntity.create(cleaned);
  },

  logQuantityChange: ({ itemType, itemId, itemName, movementType, previousQuantity, newQuantity, reason, userId, userName }) =>
    stockMovementService.create({
      itemType,
      itemId,
      itemName,
      movementType,
      previousQuantity,
      newQuantity,
      quantityChanged: newQuantity - previousQuantity,
      reason,
      userId,
      userName,
    }),

  logStatusChange: ({ itemType, itemId, itemName, movementType, previousStatus, newStatus, reason, userId, userName }) =>
    stockMovementService.create({
      itemType,
      itemId,
      itemName,
      movementType,
      previousStatus,
      newStatus,
      reason,
      userId,
      userName,
    }),
};
