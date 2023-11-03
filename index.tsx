//require("dotenv").config();

import { objWebHosting } from "./objWebHosting";

(async () => {
  console.log("welcome to planetbridging");

  var oWebHosting = new objWebHosting(8123);
  await oWebHosting.buildCache();
  await oWebHosting.startHosting();
})();
