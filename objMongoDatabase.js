const { MongoClient } = require("mongodb");

class objMongoDatabase {
  constructor(databaseUrl, databaseName, un, pwd) {
    this.databaseUrl = `mongodb://${un}:${pwd}@${databaseUrl}`;
    this.databaseName = databaseName;
    this.client = null;
    //this.connect();
  }

  async testing() {
    const MDBUN = process.env.MDBUN;
    const MDBPWD = process.env.MDBPWD;
    const MDBName = process.env.MDBName;
    const MDBURL = process.env.MDBURL;

    // Construct the MongoDB connection string
    const uri = `mongodb://${MDBUN}:${MDBPWD}@${MDBURL}`;

    // Create a new MongoClient without deprecated options
    const client = new MongoClient(uri);

    try {
      // Connect to the MongoDB cluster
      await client.connect();

      // Specify the database and collection
      const database = client.db(MDBName);
      const collection = database.collection("testCollection");

      // Insert a document
      const insertResult = await collection.insertOne({
        name: "John Doe",
        age: 30,
      });
      console.log("Inserted document:", insertResult.insertedId);

      // Find the inserted document
      const findResult = await collection.findOne({
        _id: insertResult.insertedId,
      });
      console.log("Found document:", findResult);
    } catch (e) {
      console.error("Error connecting to MongoDB:", e);
    } finally {
      // Ensure that the client will close when you finish/error
      await client.close();
    }
  }

  /*async connect() {
    this.client = await MongoClient.connect(this.databaseUrl, {
      //useNewUrlParser: true,
      //useUnifiedTopology: true,
    });
    return this.client.db(this.databaseName);
  }*/

  async connect() {
    if (!this.client) {
      // Create the connection only once
      try {
        this.client = await MongoClient.connect(this.databaseUrl, {
          //useNewUrlParser: true,
          //useUnifiedTopology: true,
        });
      } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error; // Propagate the error for proper handling
      }
    }
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

  async findAllInCollection(collectionName) {
    const db = await this.connect();
    const collection = db.collection(collectionName);
    const results = await collection.find({}).toArray(); // Empty query {} selects all
    return results;
  }

  async findFirstInEachCollection() {
    const db = await this.connect();
    const collectionNames = await db.listCollections().toArray();

    const firstDocuments = await Promise.all(
      collectionNames.map(async (collectionInfo) => {
        const collection = db.collection(collectionInfo.name);
        return await collection.findOne({}); // Find the first document in each collection
      })
    );

    return firstDocuments;
  }

  async getDatabaseSize() {
    const db = await this.connect();
    const stats = await db.stats();
    const sizeInMB = stats.storageSize / (1024 * 1024);
    return sizeInMB;
  }
}

module.exports = {
  objMongoDatabase,
};
