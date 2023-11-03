const express = require("express");
const bodyParser = require("body-parser");
const { parseString } = require("xml2js");
const path = require("path");
const app = express();
//require("dotenv").config();

import { objDownloadManager } from "./objDownloadManager";

var oDownloadManager = new objDownloadManager();

var cache = null;
(async () => {
  console.log("welcome to planetbridging");
  cache = await oDownloadManager.startup();
  oDownloadManager = null;
})();
