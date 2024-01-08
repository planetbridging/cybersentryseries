//require("dotenv").config();

import { objWebHosting } from "./objWebHosting";

var RunType = process.env.TYPE; 


(async () => {
  console.log("welcome to planetbridging");
  console.log("RunType",RunType);

  var oWebHosting = new objWebHosting(8123);


  if(RunType == "BUILDDATABASE"){
    await oWebHosting.buildCache();
    var showDataStructure = oWebHosting.cache.getFirstItemOfAllMaps();

    console.log("---------Showing data structure--------------");
    console.log(showDataStructure);

    await oWebHosting.cache.remoteDBsaving();
  }else{
    await oWebHosting.buildCache();
    await oWebHosting.startHosting();
  }
  
  
})();
