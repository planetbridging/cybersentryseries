const express = require("express");
const bodyParser = require("body-parser");
const { parseString } = require("xml2js");
const path = require("path");
const app = express();
const methodOverride = require("method-override");
const mime = require("mime");
var ReactDOMServer = require("react-dom/server");
const React = require("react");

import { objDownloadManager } from "./objDownloadManager";
import { objWebTemplating } from "./objWebTemplating";
const oLoadFiles = require("./hashFiles");

var oWebTemplate = new objWebTemplating();

export class objWebHosting {
  constructor(port) {
    this.oDownloadManager = new objDownloadManager();

    this.port = port;
  }

  async buildCache() {
    var cache = await this.oDownloadManager.startup();
    this.oDownloadManager = null;
    this.cache = cache;
  }

  async startHosting() {
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(logErrors);
    app.use(clientErrorHandler);
    app.use(errorHandler);
    //app.use(express.static(path.join(__dirname, "public")));

    this.loadPublicIntoCache();

    app.listen(this.port, () => {
      console.log("Server is running on port " + this.port);
    });
  }

  dynamicCacheApi(path, tmpCache, req, res) {}

  async loadPublicIntoCache() {
    const filesMap = oLoadFiles.loadFilesFromDirectory(
      path.join(__dirname, "public")
    );
    app.get("*", async (req, res) => {
      var searchCache = req.path.substring(1);
      //console.log(searchCache);
      //console.log(filesMap);
      if (filesMap.has(searchCache)) {
        //console.log("found");
        const mimeType = mime.getType(searchCache);

        if (mimeType) {
          res.setHeader("Content-Type", mimeType);
          //console.log(mimeType);
        }
        var cacheFile = filesMap.get(searchCache);
        var filePath = req.path;
        const ext = path.extname(filePath);
        //console.log(ext);

        /*if (ext === ".js") {
          var obfuscatedCode = JavaScriptObfuscator.obfuscate(cacheFile);
  
          res.type(".js");
          res.send(obfuscatedCode._obfuscatedCode);
          return;
        }*/
        res.send(cacheFile);
        return;
      }
      var pageFound = false;
      var tmpCache = null;

      switch (req.path) {
        case "/":
          pageFound = true;
          break;
        case "/cvelookup":
          pageFound = true;
          tmpCache = this.cache.lstCve;
          break;
        case "/cpelookup":
          pageFound = true;
          tmpCache = this.cache.lstUniqCpe;
          break;
        case "/cpetocvelookup":
          pageFound = true;
          tmpCache = this.cache.lstCpeToCve;
          break;
        case "/searchsploitlookup":
          pageFound = true;
          tmpCache = this.cache.lstSearchsploit;

          break;
        case "/cvetoexpliotlookup":
          pageFound = true;
          tmpCache = this.cache.lstCveToSearchsploit;
          break;
        case "/cvetometasploitlookup":
          pageFound = true;
          tmpCache = this.cache.lstCveToMetasploit;
          break;
      }

      if (tmpCache != null) {
        var json = {
          path: req.path,
          search: "",
          found: "",
          possible: [],
        };
        if (req.query.search) {
          const searchQuery = req.query.search;
          json.search = searchQuery;
          if (tmpCache.has(searchQuery)) {
            json.found = tmpCache.get(searchQuery);
          } else {
            var possible = [];
            // var count = 0;
            for (const [key, value] of tmpCache.entries()) {
              //console.log(`Key: ${key}, Value: ${value}`);
              if (key.includes(searchQuery)) {
                possible.push([key, value]);
              }
              if (possible.length >= 100) {
                break;
              }
              // count += 1;
            }

            json.possible = possible;
          }
        }

        res.send(json);
        return;
      }

      try {
        if (!pageFound) {
          res.status(404).send("404 - Not Found");
          return;
        } else {
          console.log("load page");

          /*const content = ReactDOMServer.renderToString(component);
          const html = `
            <!DOCTYPE html>
            <html>
                ${ReactDOMServer.renderToStaticMarkup(<Head />)}
                <body>
                    <div id="root">${content}</div>
                </body>
            </html>
        `;*/
          // Create your React element

          res.send(this.convert(oWebTemplate.render()));
        }
      } catch (ex) {
        console.log(ex);
        res.status(404).send("404 - Not Found");
        return;
      }
    });
  }

  convert(json) {
    if (typeof json === "string") {
      return json;
    }

    if (Array.isArray(json)) {
      return json.map((element) => this.convert(element)).join("");
    }

    const { type, props } = json;
    const attributes = props
      ? Object.keys(props)
          .filter(
            (key) => key !== "children" && key !== "dangerouslySetInnerHTML"
          )
          .map((key) => {
            let value = props[key];
            if (key === "className") key = "class"; // React className to HTML class
            return `${key}="${value}"`;
          })
          .join(" ")
      : "";

    const content = props?.children ? this.convert(props.children) : "";

    const dangerouslySetInnerHTML =
      props?.dangerouslySetInnerHTML?.__html || "";

    return `<${type} ${attributes}>${dangerouslySetInnerHTML}${content}</${type}>`;
  }
}

function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({ error: "Something failed!" });
  } else {
    next(err);
  }
}

function errorHandler(err, req, res, next) {
  res.status(500);
  res.render("error", { error: err });
}
