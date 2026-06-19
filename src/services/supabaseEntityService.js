import { supabase } from '@/api/supabaseClient';

const FIELD_MAPS = {
  Equipment: {
    id: 'id',
    name: 'name',
    brand: 'brand',
    serialNumber: 'serial_number',
    category: 'category',
    status: 'status',
    location: 'location',
    entryDate: 'entry_date',
    clientName: 'client_name',
    supplier: 'supplier',
    purchaseDate: 'purchase_date',
    warrantyEndDate: 'warranty_end_date',
    notes: 'notes',
    image: 'image',
    updatedBy: 'updated_by',
    created_date: 'created_at',
  },
  Consumable: {
    id: 'id',
    name: 'name',
    referenceCode: 'reference_code',
    brand: 'brand',
    type: 'type',
    compatibleModels: 'compatible_models',
    quantity: 'quantity',
    minimumStock: 'minimum_stock',
    location: 'location',
    supplier: 'supplier',
    notes: 'notes',
    image: 'image',
    updatedBy: 'updated_by',
    created_date: 'created_at',
  },
  Part: {
    id: 'id',
    name: 'name',
    referenceCode: 'reference_code',
    compatibleModels: 'compatible_models',
    quantity: 'quantity',
    minimumStock: 'minimum_stock',
    location: 'location',
    supplier: 'supplier',
    notes: 'notes',
    image: 'image',
    updatedBy: 'updated_by',
    created_date: 'created_at',
  },
  Location: {
    id: 'id',
    name: 'name',
    description: 'description',
    type: 'type',
    active: 'active',
    created_date: 'created_at',
  },
  Supplier: {
    id: 'id',
    name: 'name',
    contactName: 'contact_name',
    phone: 'phone',
    email: 'email',
    address: 'address',
    notes: 'notes',
    created_date: 'created_at',
  },
  StockMovement: {
    id: 'id',
    itemType: 'item_type',
    itemId: 'item_id',
    itemName: 'item_name',
    movementType: 'movement_type',
    previousQuantity: 'previous_quantity',
    newQuantity: 'new_quantity',
    quantityChanged: 'quantity_changed',
    previousStatus: 'previous_status',
    newStatus: 'new_status',
    reason: 'reason',
    userId: 'user_id',
    userName: 'user_name',
    created_date: 'created_at',
  },
  User: {
    id: 'id',
    email: 'email',
    full_name: 'full_name',
    role: 'role',
    active: 'active',
    created_date: 'created_at',
  },
};

const TABLES = {
  Equipment: 'equipment',
  Consumable: 'consumables',
  Part: 'parts',
  Location: 'locations',
  Supplier: 'suppliers',
  StockMovement: 'stock_movements',
  User: 'profiles',
};

const SCHEMAS = {
  Equipment: {
    properties: {
      status: { enum: ['Disponível', 'Em uso interno', 'Em cliente', 'Em manutenção', 'Reservada', 'Vendida', 'Abatida'] },
      category: { enum: ['Impressora', 'Multifuncional', 'Plotter', 'Scanner', 'Outro'] },
    },
  },
  Consumable: {
    properties: {
      type: { enum: ['Toner', 'Tinta', 'Cartucho', 'Tambor', 'Fusor', 'Outro'] },
    },
  },
  Part: { properties: {} },
};

const reverseMap = (entityName) => Object.entries(FIELD_MAPS[entityName] || {})
  .reduce((acc, [client, db]) => ({ ...acc, [db]: client }), {});

const fieldToDb = (entityName, field) => FIELD_MAPS[entityName]?.[field] || field;

const toDb = (entityName, data) => Object.entries(data || {}).reduce((acc, [key, value]) => {
  if (value === undefined || key === 'created_date') return acc;
  acc[fieldToDb(entityName, key)] = value;
  return acc;
}, {});

const fromDb = (entityName, row) => {
  if (!row) return row;
  const map = reverseMap(entityName);
  return Object.entries(row).reduce((acc, [key, value]) => {
    acc[map[key] || key] = value;
    return acc;
  }, {});
};

const applyQuery = (builder, entityName, query = {}) => Object.entries(query || {}).reduce((acc, [key, value]) => {
  if (value === undefined || value === null) return acc;
  return acc.eq(fieldToDb(entityName, key), value);
}, builder);

const applySort = (builder, entityName, sort) => {
  if (!sort) return builder;
  const descending = sort.startsWith('-');
  const field = descending ? sort.slice(1) : sort;
  return builder.order(fieldToDb(entityName, field), { ascending: !descending });
};

const run = async (query) => {
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const createEntityService = (entityName) => {
  const table = TABLES[entityName];

  return {
    list: async (sort = '-created_date', limit = 500) => {
      let query = supabase.from(table).select('*');
      query = applySort(query, entityName, sort).limit(limit);
      const rows = await run(query);
      return rows.map((row) => fromDb(entityName, row));
    },

    filter: async (filterQuery = {}, sort = '-created_date', limit = 500) => {
      let query = supabase.from(table).select('*');
      query = applyQuery(query, entityName, filterQuery);
      query = applySort(query, entityName, sort).limit(limit);
      const rows = await run(query);
      return rows.map((row) => fromDb(entityName, row));
    },

    get: async (id) => {
      const data = await run(supabase.from(table).select('*').eq('id', id).single());
      return fromDb(entityName, data);
    },

    create: async (data) => {
      const rows = await run(supabase.from(table).insert(toDb(entityName, data)).select().single());
      return fromDb(entityName, rows);
    },

    upsert: async (data) => {
      const rows = await run(supabase.from(table).upsert(toDb(entityName, data)).select().single());
      return fromDb(entityName, rows);
    },

    update: async (id, data) => {
      const rows = await run(supabase.from(table).update(toDb(entityName, data)).eq('id', id).select().single());
      return fromDb(entityName, rows);
    },

    delete: async (id) => {
      await run(supabase.from(table).delete().eq('id', id));
      return true;
    },

    schema: async () => SCHEMAS[entityName] || { properties: {} },
  };
};
