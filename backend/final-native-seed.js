
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

const dishes = [
  // Appetizers
  { name: 'Paneer Tikka', category: 'Appetizers', price: 240, available: true, offer: 'Chef Special', offerPercent: 10, timeSlots: ['evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80' },
  { name: 'Hara Bhara Kabab', category: 'Appetizers', price: 180, available: true, offer: '', offerPercent: 0, timeSlots: ['evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80' },
  { name: 'Crispy Corn', category: 'Appetizers', price: 160, available: true, offer: 'Popular', offerPercent: 5, timeSlots: ['evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1514516345957-556ca7d90a29?auto=format&fit=crop&w=800&q=80' },
  { name: 'Chicken 65', category: 'Appetizers', price: 280, available: true, offer: 'Spicy', offerPercent: 0, timeSlots: ['evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80' },
  { name: 'Spring Rolls', category: 'Appetizers', price: 150, available: true, offer: '', offerPercent: 0, timeSlots: ['evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
  { name: 'Chilli Mushroom', category: 'Appetizers', price: 210, available: true, offer: '', offerPercent: 0, timeSlots: ['evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80' },

  // Main Course
  { name: 'Butter Chicken', category: 'Main Course', price: 350, available: true, offer: 'Bestseller', offerPercent: 15, timeSlots: ['evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1603894584114-7030288cd0a9?auto=format&fit=crop&w=800&q=80' },
  { name: 'Paneer Butter Masala', category: 'Main Course', price: 290, available: true, offer: '', offerPercent: 0, timeSlots: ['evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1567188040759-fbba1883dbde?auto=format&fit=crop&w=800&q=80' },
  { name: 'Dal Makhani', category: 'Main Course', price: 220, available: true, offer: 'Rich', offerPercent: 10, timeSlots: ['evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Mutton Rogan Josh', category: 'Main Course', price: 420, available: true, offer: '', offerPercent: 0, timeSlots: ['evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80' },
  { name: 'Vegan Thai Curry', category: 'Main Course', price: 310, available: true, offer: 'New', offerPercent: 5, timeSlots: ['evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1455619411412-d500534812aa?auto=format&fit=crop&w=800&q=80' },
  { name: 'Malai Kofta', category: 'Main Course', price: 280, available: true, offer: '', offerPercent: 0, timeSlots: ['evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?auto=format&fit=crop&w=800&q=80' },

  // Desserts
  { name: 'Gulab Jamun', category: 'Desserts', price: 90, available: true, offer: 'Sweet', offerPercent: 0, timeSlots: ['morning', 'evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=800&q=80' },
  { name: 'Chocolate Brownie', category: 'Desserts', price: 150, available: true, offer: 'Extra Fudge', offerPercent: 20, timeSlots: ['morning', 'evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Kulfi', category: 'Desserts', price: 80, available: true, offer: '', offerPercent: 0, timeSlots: ['evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80' },
  { name: 'Tiramisu', category: 'Desserts', price: 210, available: true, offer: 'Premium', offerPercent: 0, timeSlots: ['evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80' },
  { name: 'Ice Cream Sundae', category: 'Desserts', price: 130, available: true, offer: '', offerPercent: 0, timeSlots: ['evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80' },
  { name: 'Red Velvet Cake', category: 'Desserts', price: 180, available: true, offer: '', offerPercent: 0, timeSlots: ['morning', 'evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1586788680434-30d324671ff6?auto=format&fit=crop&w=800&q=80' },

  // Beverages
  { name: 'Masala Chai', category: 'Beverages', price: 40, available: true, offer: '', offerPercent: 0, timeSlots: ['morning', 'evening'], imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80' },
  { name: 'Fresh Lime Soda', category: 'Beverages', price: 60, available: true, offer: 'Refreshing', offerPercent: 0, timeSlots: ['morning', 'evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80' },
  { name: 'Cold Coffee', category: 'Beverages', price: 110, available: true, offer: '', offerPercent: 0, timeSlots: ['morning', 'evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Mango Lassi', category: 'Beverages', price: 90, available: true, offer: 'Best Seller', offerPercent: 10, timeSlots: ['morning', 'evening'], imageUrl: 'https://images.unsplash.com/photo-1546173159-319746d5bb04?auto=format&fit=crop&w=800&q=80' },
  { name: 'Iced Peach Tea', category: 'Beverages', price: 100, available: true, offer: '', offerPercent: 0, timeSlots: ['morning', 'evening'], imageUrl: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?auto=format&fit=crop&w=800&q=80' },
  { name: 'Hot Chocolate', category: 'Beverages', price: 120, available: true, offer: '', offerPercent: 0, timeSlots: ['evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1544787210-22c6729efac0?auto=format&fit=crop&w=800&q=80' },

  // Soups
  { name: 'Tomato Basil Soup', category: 'Soups', price: 120, available: true, offer: '', offerPercent: 0, timeSlots: ['evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80' },
  { name: 'Sweet Corn Soup', category: 'Soups', price: 110, available: true, offer: '', offerPercent: 0, timeSlots: ['evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1627444266277-2e92c2069f16?auto=format&fit=crop&w=800&q=80' },
  { name: 'Lemon Coriander Soup', category: 'Soups', price: 130, available: true, offer: 'Healthy', offerPercent: 5, timeSlots: ['evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=800&q=80' },
  { name: 'Manchow Soup', category: 'Soups', price: 140, available: true, offer: 'Spicy', offerPercent: 0, timeSlots: ['evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1ccd22?auto=format&fit=crop&w=800&q=80' },
  { name: 'Cream of Mushroom', category: 'Soups', price: 150, available: true, offer: '', offerPercent: 0, timeSlots: ['evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80' },
  { name: 'Minestrone Soup', category: 'Soups', price: 160, available: true, offer: '', offerPercent: 0, timeSlots: ['evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1603105037880-880cd44db5a1?auto=format&fit=crop&w=800&q=80' },

  // Salads
  { name: 'Caesar Salad', category: 'Salads', price: 190, available: true, offer: 'Classic', offerPercent: 0, timeSlots: ['morning', 'evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80' },
  { name: 'Greek Salad', category: 'Salads', price: 210, available: true, offer: 'Fresh', offerPercent: 10, timeSlots: ['morning', 'evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80' },
  { name: 'Quinoa Salad', category: 'Salads', price: 240, available: true, offer: '', offerPercent: 0, timeSlots: ['morning', 'evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80' },
  { name: 'Fruit Medley', category: 'Salads', price: 150, available: true, offer: '', offerPercent: 0, timeSlots: ['morning', 'evening'], imageUrl: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80' },
  { name: 'Chickpea Salad', category: 'Salads', price: 170, available: true, offer: 'High Protein', offerPercent: 0, timeSlots: ['morning', 'evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80' },
  { name: 'Caprese Salad', category: 'Salads', price: 230, available: true, offer: '', offerPercent: 0, timeSlots: ['evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?auto=format&fit=crop&w=800&q=80' },

  // Snacks
  { name: 'Samosa (2pcs)', category: 'Snacks', price: 40, available: true, offer: '', offerPercent: 0, timeSlots: ['morning', 'evening'], imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80' },
  { name: 'French Fries', category: 'Snacks', price: 90, available: true, offer: '', offerPercent: 0, timeSlots: ['morning', 'evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80' },
  { name: 'Vada Pav', category: 'Snacks', price: 30, available: true, offer: '', offerPercent: 0, timeSlots: ['morning', 'evening'], imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea8c5119c85?auto=format&fit=crop&w=800&q=80' },
  { name: 'Onion Pakoda', category: 'Snacks', price: 80, available: true, offer: 'Rainy Day Spl', offerPercent: 5, timeSlots: ['evening'], imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80' },
  { name: 'Aloo Tikki', category: 'Snacks', price: 60, available: true, offer: '', offerPercent: 0, timeSlots: ['evening'], imageUrl: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=800&q=80' },
  { name: 'Chicken Wings (6pcs)', category: 'Snacks', price: 210, available: true, offer: 'Hot', offerPercent: 10, timeSlots: ['evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=800&q=80' },

  // Breakfast
  { name: 'Masala Dosa', category: 'Breakfast', price: 85, available: true, offer: 'Special Sambar', offerPercent: 0, timeSlots: ['morning'], imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80' },
  { name: 'Idli Vada Combo', category: 'Breakfast', price: 70, available: true, offer: '', offerPercent: 0, timeSlots: ['morning'], imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80' },
  { name: 'Poha', category: 'Breakfast', price: 50, available: true, offer: 'Light', offerPercent: 0, timeSlots: ['morning'], imageUrl: 'https://images.unsplash.com/photo-1626132646247-41eb3f76903f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Puri Bhaji', category: 'Breakfast', price: 90, available: true, offer: '', offerPercent: 0, timeSlots: ['morning'], imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea8c5119c85?auto=format&fit=crop&w=800&q=80' },
  { name: 'Aloo Paratha', category: 'Breakfast', price: 80, available: true, offer: 'With Curd', offerPercent: 0, timeSlots: ['morning'], imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80' },
  { name: 'English Breakfast', category: 'Breakfast', price: 250, available: true, offer: 'Full Set', offerPercent: 10, timeSlots: ['morning'], imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80' },

  // Biryani & Rice
  { name: 'Hyderabadi Chicken Biryani', category: 'Biryani & Rice', price: 320, available: true, offer: 'Finest', offerPercent: 0, timeSlots: ['morning', 'evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&w=800&q=80' },
  { name: 'Mutton Dum Biryani', category: 'Biryani & Rice', price: 450, available: true, offer: '', offerPercent: 0, timeSlots: ['morning', 'evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80' },
  { name: 'Veg Pulao', category: 'Biryani & Rice', price: 180, available: true, offer: '', offerPercent: 0, timeSlots: ['morning', 'evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc3a2?auto=format&fit=crop&w=800&q=80' },
  { name: 'Jeera Rice', category: 'Biryani & Rice', price: 140, available: true, offer: '', offerPercent: 0, timeSlots: ['morning', 'evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc3a2?auto=format&fit=crop&w=800&q=80' },
  { name: 'Paneer Biryani', category: 'Biryani & Rice', price: 260, available: true, offer: '', offerPercent: 0, timeSlots: ['morning', 'evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1567188040759-fbba1883dbde?auto=format&fit=crop&w=800&q=80' },
  { name: 'Egg Fried Rice', category: 'Biryani & Rice', price: 190, available: true, offer: '', offerPercent: 0, timeSlots: ['morning', 'evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80' },

  // Breads
  { name: 'Butter Naan', category: 'Breads', price: 50, available: true, offer: '', offerPercent: 0, timeSlots: ['morning', 'evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80' },
  { name: 'Garlic Naan', category: 'Breads', price: 70, available: true, offer: 'Popular', offerPercent: 0, timeSlots: ['morning', 'evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=800&q=80' },
  { name: 'Tandoori Roti', category: 'Breads', price: 25, available: true, offer: '', offerPercent: 0, timeSlots: ['morning', 'evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=800&q=80' },
  { name: 'Lacha Paratha', category: 'Breads', price: 60, available: true, offer: '', offerPercent: 0, timeSlots: ['morning', 'evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80' },
  { name: 'Missi Roti', category: 'Breads', price: 45, available: true, offer: '', offerPercent: 0, timeSlots: ['morning', 'evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=800&q=80' },
  { name: 'Stuffed Kulcha', category: 'Breads', price: 80, available: true, offer: '', offerPercent: 0, timeSlots: ['morning', 'evening', 'night'], imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80' },
];

async function run() {
  try {
    await client.connect();
    console.log('Connected to MongoDB.');
    const db = client.db('menumagic');
    
    // NATIVE CLEARING
    await db.collection('dishes').deleteMany({});
    await db.collection('menuItems').deleteMany({});
    console.log('Force-cleared both "dishes" and "menuItems" collections.');
    
    // NATIVE INSERTION
    const result = await db.collection('dishes').insertMany(dishes);
    console.log(`Successfully inserted ${result.insertedCount} dishes into "dishes" collection.`);
    
    await client.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
