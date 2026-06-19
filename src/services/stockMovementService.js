import { createEntityService } from '@/services/supabaseEntityService';

const movementEntity = createEntityService('StockMovement');

export const stockMovementService = {
  list: (sort = '-created_date', limit = 500) =>
    movementEntity.list(sort, limit),

  filter: (query, sort = '-created_date', limit = 500) =>
    movementEntity.filter(query, sort, limit),

  create: (data) =>
    movementEntity.create(data),

  logQuantityChange: ({ itemType, itemId, itemName, movementType, previousQuantity, newQuantity, reason, userId, userName }) =>
    movementEntity.create({
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
    movementEntity.create({
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
