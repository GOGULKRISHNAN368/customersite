const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

mongoose.connect(uri)
  .then(async () => {
    const adminDb = mongoose.connection.client.db().admin();
    const dbs = await adminDb.listDatabases();
    
    for (const dbInfo of dbs.databases) {
      const db = mongoose.connection.client.db(dbInfo.name);
      const collections = await db.listCollections().toArray();
      
      for (const coll of collections) {
        if (coll.name.startsWith('system.')) continue;
        
        const sample = await db.collection(coll.name).findOne({});
        if (sample && (sample.name || sample.price || sample.category)) {
           console.log(`FOUND IN DB: ${dbInfo.name}, COLLECTION: ${coll.name}`);
           console.log(`Data: ${JSON.stringify(sample)}`);
        }
      }
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
