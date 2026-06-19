import { base44 } from '@/api/base44Client';
export const stockMovementService = {
  list: (sort = '-created_date', limit = 500) =>
    base44.entities.StockMovement.list(sort, limit),

  filter: (query, sort = '-created_date', limit = 500) =>
    base44.entities.StockMovement.filter(query, sort, limit),

  create: (data) =>
    base44.entities.StockMovement.create(data),

  logQuantityChange: ({ itemType, itemId, itemName, movementType, previousQuantity, newQuantity, reason, userId, userName }) =>
    base44.entities.StockMovement.create({
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
    base44.entities.StockMovement.create({
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
