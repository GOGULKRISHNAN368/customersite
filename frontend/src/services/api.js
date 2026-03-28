import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Backend base URL
});

export const fetchMenus = async () => {
  try {
    const response = await api.get('/menu');
    return response.data;
  } catch (error) {
    console.error('Error fetching menus:', error);
    throw error;
  }
};

export const fetchMenusByCategory = async (category) => {
  try {
    const response = await api.get(`/menu/category/${category}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching menus for category ${category}:`, error);
    throw error;
  }
};
export const placeOrder = async (orderData) => {
  try {
    const response = await api.post('/orders/create', orderData);
    return response.data;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};

export const fetchOrderById = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw error;
  }
};

export const addItemsToOrder = async (orderId, orderData) => {
  try {
    const response = await api.post(`/orders/add-items/${orderId}`, orderData);
    return response.data;
  } catch (error) {
    console.error(`Error adding items to order ${orderId}:`, error);
    throw error;
  }
};

export const downloadReceipt = async (orderId) => {
  try {
    const response = await api.post(`/orders/receipt/${orderId}`, {}, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error(`Error downloading receipt for order ${orderId}:`, error);
    throw error;
  }
};
