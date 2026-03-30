
const mongoose = require('mongoose');
require('dotenv').config();

async function checkImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const dishes = await db.collection('dishes').find({}).toArray();
    
    console.log('--- Current Dishes in Database ---');
    dishes.forEach(dish => {
      console.log(`Dish: ${dish.name}`);
      console.log(`imageUrl: ${dish.imageUrl || 'MISSING'}`);
      console.log(`image: ${dish.image || 'MISSING'}`);
      console.log('--------------------------------');
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkImages();
