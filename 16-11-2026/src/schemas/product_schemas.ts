// ---------- TypeScript types ----------
export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductBody {
  name: string;
  sku: string;
  description?: string;
  price: number;
  stock?: number;
  is_active?: boolean;
}

export type UpdateProductBody = Partial<CreateProductBody>;

export interface IdParams {
  id: string;
}

export interface ListQuery {
  limit: number;
  offset: number;
}

// ---------- JSON schemas (validation + serialization) ----------
const productResponse = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    sku: { type: 'string' },
    description: { type: ['string', 'null'] },
    price: { type: 'number' },
    stock: { type: 'integer' },
    is_active: { type: 'boolean' },
    created_at: { type: 'string' },
    updated_at: { type: 'string' }
  }
} as const;

const idParams = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', format: 'uuid' } }
} as const;

const errorResponse = {
  type: 'object',
  properties: {
    statusCode: { type: 'integer' },
    error: { type: 'string' },
    message: { type: 'string' }
  }
} as const;

const createBody = {
  type: 'object',
  required: ['name', 'sku', 'price'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 255 },
    sku: { type: 'string', minLength: 1, maxLength: 64 },
    description: { type: 'string' },
    price: { type: 'number', minimum: 0 },
    stock: { type: 'integer', minimum: 0, default: 0 },
    is_active: { type: 'boolean', default: true }
  }
} as const;

const updateBody = {
  type: 'object',
  additionalProperties: false,
  minProperties: 1,
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 255 },
    sku: { type: 'string', minLength: 1, maxLength: 64 },
    description: { type: 'string' },
    price: { type: 'number', minimum: 0 },
    stock: { type: 'integer', minimum: 0 },
    is_active: { type: 'boolean' }
  }
} as const;

export const createProductSchema = {
  body: createBody,
  response: { 201: productResponse, 409: errorResponse }
};

export const listProductsSchema = {
  querystring: {
    type: 'object',
    properties: {
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      offset: { type: 'integer', minimum: 0, default: 0 }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: { type: 'array', items: productResponse },
        limit: { type: 'integer' },
        offset: { type: 'integer' }
      }
    }
  }
};

export const getProductSchema = {
  params: idParams,
  response: { 200: productResponse, 404: errorResponse }
};

export const updateProductSchema = {
  params: idParams,
  body: updateBody,
  response: { 200: productResponse, 404: errorResponse, 409: errorResponse }
};

export const deleteProductSchema = {
  params: idParams,
  response: { 204: { type: 'null' }, 404: errorResponse }
};