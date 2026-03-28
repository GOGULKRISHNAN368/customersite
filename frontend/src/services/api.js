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
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};
