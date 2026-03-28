const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));
  
  const dishesCount = await db.collection('dishes').countDocuments();
  const menuItemsCount = await db.collection('menuItems').countDocuments();
  console.log('dishes count:', dishesCount);
  console.log('menuItems count:', menuItemsCount);
  process.exit(0);
}

check();
