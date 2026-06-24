import axios from 'axios';
import { API_URL } from '../config';

// The interceptor in config.js automatically injects the Bearer token
// so we don't need to manually pass headers in these methods.

const apiService = {
  // --- AUTHENTICATION ---
  login: (credentials) => axios.post(`${API_URL}/api/login`, credentials),
  verifyToken: (token) => axios.get(`${API_URL}/api/verify-token/${token}`),
  
  // --- MENU & INVENTORY ---
  getMenu: (restaurantId = null) => {
      const qs = restaurantId ? `?restaurant_id=${restaurantId}` : '';
      return axios.get(`${API_URL}/api/menu${qs}`);
  },
  createDish: (data) => axios.post(`${API_URL}/api/menu`, data),
  updateDish: (id, data) => axios.put(`${API_URL}/api/menu/${id}`, data),
  deleteDish: (id) => axios.delete(`${API_URL}/api/menu/${id}`),
  
  // --- CATEGORIES ---
  createCategory: (data) => axios.post(`${API_URL}/api/menu/categories`, data),
  deleteCategory: (id) => axios.delete(`${API_URL}/api/menu/categories/${id}`),
  
  // --- ORDERS ---
  getOrders: () => axios.get(`${API_URL}/api/orders`),
  createOrder: (data) => axios.post(`${API_URL}/api/orders`, data),
  updateOrder: (id, data) => axios.put(`${API_URL}/api/orders/${id}`, data),
  updateOrderStatus: (id, status) => axios.put(`${API_URL}/api/orders/${id}/status`, { status }),
  assignRider: (orderId, riderId) => axios.post(`${API_URL}/api/mgmt/orders/assign-rider`, { order_id: orderId, rider_id: riderId }),
  
  // --- RESTAURANTS / NODES ---
  getRestaurants: () => axios.get(`${API_URL}/api/restaurants`),
  createRestaurant: (data) => axios.post(`${API_URL}/api/restaurants`, data),
  updateRestaurant: (id, data) => axios.put(`${API_URL}/api/restaurants/${id}`, data),
  deleteRestaurant: (id) => axios.delete(`${API_URL}/api/restaurants/${id}`),
  
  // --- USERS / STAFF ---
  getUsers: () => axios.get(`${API_URL}/api/users`),
  createUser: (data) => axios.post(`${API_URL}/api/users`, data),
  updateUser: (id, data) => axios.put(`${API_URL}/api/users/${id}`, data),
  deleteUser: (id) => axios.delete(`${API_URL}/api/users/${id}`),

  // --- ROLES & PERMISSIONS ---
  getRoles: () => axios.get(`${API_URL}/api/mgmt/roles`),
  createRole: (data) => axios.post(`${API_URL}/api/mgmt/roles`, data),
  deleteRole: (id) => axios.delete(`${API_URL}/api/mgmt/roles/${id}`),
  
  // --- SIDEBAR MANAGEMENT ---
  getSidebar: () => axios.get(`${API_URL}/api/mgmt/sidebar`),
  reorderSidebar: (items) => axios.post(`${API_URL}/api/mgmt/sidebar/reorder`, { items }),
  toggleSidebarItem: (id, is_active) => axios.post(`${API_URL}/api/mgmt/sidebar/toggle`, { id, is_active }),
  
  // --- RIDERS (FLEET) ---
  getRiders: () => axios.get(`${API_URL}/api/mgmt/riders`),
  createRider: (data) => axios.post(`${API_URL}/api/mgmt/riders`, data),
  updateRider: (id, data) => axios.put(`${API_URL}/api/mgmt/riders/${id}`, data),
  deleteRider: (id) => axios.delete(`${API_URL}/api/mgmt/riders/${id}`),

  // --- COUPONS & MARKETING ---
  getCoupons: () => axios.get(`${API_URL}/api/mgmt/coupons`),
  createCoupon: (data) => axios.post(`${API_URL}/api/mgmt/coupons`, data),
  updateCoupon: (id, data) => axios.put(`${API_URL}/api/mgmt/coupons/${id}`, data),
  deleteCoupon: (id) => axios.delete(`${API_URL}/api/mgmt/coupons/${id}`),

  getCampaigns: (restaurantId) => {
      const qs = restaurantId ? `?restaurant_id=${restaurantId}` : '';
      return axios.get(`${API_URL}/api/mgmt/marketing/campaigns${qs}`);
  },
  launchCampaign: (data) => axios.post(`${API_URL}/api/mgmt/marketing/campaigns`, data),
  getMarketingConfig: (restaurantId) => axios.get(`${API_URL}/api/mgmt/marketing/config?restaurant_id=${restaurantId}`),
  saveMarketingConfig: (data) => axios.post(`${API_URL}/api/mgmt/marketing/config`, data),

  // --- QR CODES / TABLES ---
  getTables: () => axios.get(`${API_URL}/api/tables`),
  createTable: (data) => axios.post(`${API_URL}/api/tables`, data),
  updateTable: (id, data) => axios.put(`${API_URL}/api/tables/${id}`, data),
  deleteTable: (id) => axios.delete(`${API_URL}/api/tables/${id}`),

  // --- UPLOADS ---
  uploadImage: (formData) => axios.post(`${API_URL}/api/upload`, formData),
};

export default apiService;
