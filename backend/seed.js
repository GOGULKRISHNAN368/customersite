const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Menu = require('./models/Menu');

dotenv.config();

const dummyMenus = [
  {
    name: "Classic Butter Chicken",
    category: "Main Course",
    price: 320,
    available: true,
    offer: "Best Seller",
    offerPercent: 10,
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Garlic Naan",
    category: "Breads",
    price: 60,
    available: true,
    offer: "",
    offerPercent: 0,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Chocolate Lava Cake",
    category: "Desserts",
    price: 150,
    available: true,
    offer: "New",
    offerPercent: 15,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Paneer Tikka Masala",
    category: "Main Course",
    price: 280,
    available: true,
    offer: "Chef's Special",
    offerPercent: 5,
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing
    await Menu.deleteMany({});
    console.log('Cleared existing menus');
    
    // Insert new
    await Menu.insertMany(dummyMenus);
    console.log('Dummy menus inserted successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
