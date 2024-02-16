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

  async getCollectionSizes() {
    const db = await this.connect();
    const collections = await db.listCollections().toArray();

    const collectionSizes = await Promise.all(
      collections.map(async (collectionInfo) => {
        const stats = await db.stats({
          scale: 1024 * 1024,
          collName: collectionInfo.name,
        }); // Call stats on the db object
        return {
          name: collectionInfo.name,
          sizeInMB: stats.storageSize / (1024 * 1024),
        };
      })
    );

    return collectionSizes;
  }

  async insertMap(collectionName, mapData) {
    console.log("bulk map insert", collectionName);
    //console.log(mapData);
    const db = await this.connect();

    // Check if the collection exists
    const collectionExists = await db
      .listCollections({ name: collectionName })
      .hasNext();
    if (collectionExists) {
      console.log(
        `Collection ${collectionName} already exists. Skipping insert.`
      );
      return; // Skip the insertion
    }

    // Proceed with the original insert logic since the collection is new
    const collection = db.collection(collectionName);
    const result = await collection.insertOne(Object.fromEntries(mapData));
    return result;
  }

  async insertMapItemsIndividually(collectionName, mapData) {
    console.log("Inserting items individually into:", collectionName);
    const db = await this.connect();

    // Check for collection existence (you can reuse your existing logic here)
    const collectionExists = await db
      .listCollections({ name: collectionName })
      .hasNext();
    if (collectionExists) {
      console.log(`Collection ${collectionName} already exists.`);
      return;
    } else {
      console.log(`Collection ${collectionName} is new.`);
    }

    const collection = db.collection(collectionName);

    for (const [key, value] of mapData.entries()) {
      try {
        // Optionally, add a key field if your items don't have one:
        // const document = { _id: key, ...value };

        let document = {}; // Empty document object

        if (Array.isArray(value)) {
          document.lst = value; // If an array, store it within the 'lst' field
          document.key = key; // If an array, store it within the 'lst' field
        } else {
          //document = value; //  If not an array, it can be inserted directly
          document.key = key;
          document.value = value;
        }

        const result = await collection.insertOne(document);

        console.log(`Item inserted with key: ${key}`);
      } catch (error) {
        console.error(`Error inserting item with key ${key}:`, error);
        console.log("Value to key:", key);
        console.log("Value to insert:", value);
      }
    }
  }

  async searchKeyContain(collectionName, key, value, limit = 10) {
    const db = await this.connect();
    const collection = db.collection(collectionName);

    // Construct query using a regular expression within a template literal
    const searchQuery = { [key]: { $regex: `^${value}`, $options: "i" } };

    const results = await collection.find(searchQuery).limit(limit).toArray();
    return results;
  }

  async searchByKeyValue(collectionName, key, value, limit = 10) {
    const db = await this.connect();
    const collection = db.collection(collectionName);

    const searchQuery = { [key]: value };

    // Execute the search using find and limit
    const results = await collection.find(searchQuery).limit(limit).toArray();

    return results;
  }

  async getDocumentsByKeyValues(collectionName, key, valuesList) {
    const db = await this.connect();
    const collection = db.collection(collectionName);

    // Build the query to find documents with the specified key matching any of the values in the list
    const query = {
      [key]: { $in: valuesList },
    };

    // Retrieve the matching documents
    const documents = await collection.find(query).toArray();

    return documents;
  }

  async searchByKeyValueContain(collectionName, value, limit = 10) {
    const db = await this.connect();
    const collection = db.collection(collectionName);

    // Construct the regular expression
    const searchRegex = new RegExp(value, "i");

    // Build the filtering function (only checks top-level keys)
    const filterFunction = function () {
      return Object.keys(this).some((key) => searchRegex.test(key));
    };

    // Use $where operator with the filtering function
    const searchQuery = { $where: filterFunction };

    const results = await collection.find(searchQuery).limit(limit).toArray();
    return results;
  }
}

module.exports = {
  objMongoDatabase,
};
