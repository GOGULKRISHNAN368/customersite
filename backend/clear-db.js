
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function clear() {
  const client = new MongoClient(process.env.MONGO_URI);
  try {
    await client.connect();
    const db = client.db('menumagic');
    await db.collection('dishes').deleteMany({});
    await db.collection('menuItems').deleteMany({});
    console.log('✅ All menu data cleared successfully from "menumagic" database.');
  } catch (err) {
    console.error('❌ Error clearing DB:', err);
  } finally {
    await client.close();
    process.exit(0);
  }
}

clear();
