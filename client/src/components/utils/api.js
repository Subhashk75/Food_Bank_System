const API_BASE = 'http://localhost:3001/api/v1';

const apiRequest = async (endpoint, method, data = null) => {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  };
  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Server connection failed. Please try again later.');
    }
    throw error;
  }
};

export const authService = {
  register: (data) => apiRequest('/users/register', 'POST', data),
  login: (data) => apiRequest('/users/login', 'POST', data),
  requestOtp: (code) => apiRequest('/users/getOtp', 'POST', code),
};

export const productService = {
  create: (data) => apiRequest('/products', 'POST', data),
  getAll: () => apiRequest('/products', 'GET'),
  getById: (id) => apiRequest(`/products/${id}`, 'GET'),
  search: (query) => apiRequest(`/products/search?name=${encodeURIComponent(query)}`, 'GET'),
  update: (id, data) => apiRequest(`/products/${id}`, 'PUT', data),
  delete: (id) => apiRequest(`/products/${id}`, 'DELETE'),
  updateQuantity: (id, data) => apiRequest(`/products/${id}/quantity`, 'PATCH', data),
};

export const distributionService = {
  // getAll: () => apiRequest('/distribution', 'GET'),
  create: (data) => apiRequest('/distribution', 'POST', data),
  // update: (id, data) => apiRequest(`/distribution/${id}`, 'PUT', data),
  // restore: () => apiRequest('/distribution/restore', 'POST'), // Added this
};

export const transactionService = {
  getAll: () => apiRequest('/transactions', 'GET'),
  getById: (id) => apiRequest(`/transactions/${id}`, 'GET'),
  create: (data) => apiRequest('/transactions', 'POST', data),
  update: (id, data) => apiRequest(`/transactions/${id}`, 'PUT', data),
  restore: () => apiRequest('/transactions/restore', 'POST'), // Keeping this too
};

export const categoryService = {
  getAll: () => apiRequest('/categories', 'GET'),
  create: (data) => apiRequest('/categories', 'POST', data),
};

export const inventoryService = {
  getAll: () => apiRequest('/inventory', 'GET'),
  create: (data) => apiRequest('/inventory', 'POST', data),
  receive: (data) => apiRequest('/inventory/receive', 'POST', data),
};

export default {
  authService,
  productService,
  categoryService,
  transactionService,
  distributionService,
  inventoryService,
};
