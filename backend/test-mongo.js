const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

mongoose.connect(uri)
  .then(async () => {
    console.log('Connected!');
    const adminDb = mongoose.connection.client.db('storeorder').admin();
    const dbs = await adminDb.listDatabases();
    console.log('Databases:', dbs.databases.map(db => db.name));
    
    // Check collections in storeorder
    const collections = await mongoose.connection.client.db('storeorder').listCollections().toArray();
    console.log('Collections in storeorder:', collections.map(c => c.name));

    // Also check what's in 'test' db just in case
    const testCollections = await mongoose.connection.client.db('test').listCollections().toArray();
    console.log('Collections in test:', testCollections.map(c => c.name));

    if (testCollections.some(c => c.name === 'menus')) {
      const menusInTest = await mongoose.connection.client.db('test').collection('menus').find({}).toArray();
      console.log('Menus in test db:', menusInTest.length);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
