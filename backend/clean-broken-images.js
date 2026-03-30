
const mongoose = require('mongoose');
require('dotenv').config();

async function cleanData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const collection = db.collection('dishes');
    
    // Find dishes with local Windows paths
    const dishes = await collection.find({ imageUrl: { $regex: /^C:\\/i } }).toArray();
    console.log(`Found ${dishes.length} dishes with broken local paths.`);
    
    for (const dish of dishes) {
      console.log(`Cleaning dish: ${dish.name}`);
      await collection.updateOne(
        { _id: dish._id },
        { $set: { imageUrl: '' } } // Clearing the path so the frontend's placeholder logic kicks in
      );
    }
    
    console.log('Cleanup complete.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

cleanData();
