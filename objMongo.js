const { MongoClient } = require('mongodb');

class objMongoDatabase {
  constructor(databaseUrl, databaseName) {
    this.databaseUrl = databaseUrl;
    this.databaseName = databaseName;
    this.client = null;
  }

  async connect() {
    this.client = await MongoClient.connect(this.databaseUrl, {
       useNewUrlParser: true,
       useUnifiedTopology: true 
    });
    return this.client.db(this.databaseName);
  }

  async insertDocument(collectionName, document) {
    const db = await this.connect();
    const collection = db.collection(collectionName);
    const result = await collection.insertOne(document);
    return result; 
  }

  async findDocuments(collectionName, query = {}) {
    const db = await this.connect();
    const collection = db.collection(collectionName);
    const results = await collection.find(query).toArray();
    return results;
  }
}


module.exports = {
    objMongoDatabase,
};