//require("dotenv").config();

import { objWebHosting } from "./objWebHosting";

var RunType = process.env.TYPE;

(async () => {
  console.log("welcome to the bewear project");
  console.log("RunType", RunType);

  var oWebHosting = new objWebHosting(8123);

  if (RunType == "BUILDDATABASE") {
    await oWebHosting.buildCache();
    var showDataStructure = oWebHosting.cache.getFirstItemOfAllMaps();

    console.log("---------Showing data structure--------------");
    console.log(showDataStructure);

    await oWebHosting.cache.remoteDBsaving();
    console.log("Done restart");
  } else if (RunType == "DATABASE") {
    await oWebHosting.blankObjCollector();
    await oWebHosting.startHosting();
  } else if (RunType == "BUILDMONGODATABASE") {
    console.log("inserting data into mongo db");
    await oWebHosting.buildCache();
    await oWebHosting.cache.testForMongoDatabaseConnection();
    await oWebHosting.cache.bulkInsertIntoMongo();
  } else {
    console.log("running default setup");
    await oWebHosting.buildCache();
    await oWebHosting.startHosting();
  }
})();
