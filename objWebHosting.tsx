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

var oWebTemplate;

export class objWebHosting {
  constructor(port) {
    this.oDownloadManager = new objDownloadManager();

    this.port = port;
  }

  async buildCache() {
    var cache = await this.oDownloadManager.startup();
    this.oDownloadManager = null;
    this.cache = cache;

    oWebTemplate = new objWebTemplating();
    oWebTemplate.setStats(this.cache.createStatsJson());
    //console.log(this.getCve("CVE-2013-2737"));
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
      var content = null;
      var pageWrapper = true;
      var pageExactResultsType = -1;

      switch (req.path) {
        case "/":
          pageFound = true;
          content = oWebTemplate.renderCachStats();
          break;
        case "/cvelookup":
          pageFound = true;
          tmpCache = this.cache.lstCve;
          break;
        case "/cpelookup":
          pageFound = true;
          tmpCache = this.cache.lstUniqCpe;
          pageExactResultsType = 0;
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
        case "/cpesearch":
          pageFound = true;
          content = await oWebTemplate.renderCpelookup(null);
          break;
        case "/cpesearchresults":
          console.log(req.query.search);
          pageFound = true;
          pageWrapper = false;
          content = await oWebTemplate.renderCpelookup(req.query.search);
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
            var tmpResults = tmpCache.get(searchQuery);

            if (pageExactResultsType == 0 && tmpResults.length > 0) {
              var lstTmp = [];
              for (var r in tmpResults) {
                lstTmp.push(this.getCve(tmpResults[r]));
              }
              json.found = lstTmp;
            } else {
              json.found = tmpCache.get(searchQuery);
            }
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
          if (pageWrapper) {
            var html =
              `<!DOCTYPE html><html>` +
              this.getHead() +
              this.convert(oWebTemplate.render(content)) +
              `</html>`;
            res.send(html);
          } else {
            var html = this.convert(content);
            res.send(html);
          }
        }
      } catch (ex) {
        console.log(ex);
        res.status(404).send("404 - Not Found");
        return;
      }
    });
  }

  getCve(cve) {
    var tmp = {
      exploits: [],
      metasploits: [],
    };
    if (this.cache.lstCve.has(cve)) {
      tmp["cve"] = this.cache.lstCve.get(cve);
      if (this.cache.lstCveToSearchsploit.has(cve)) {
        var tExploits = this.cache.lstCveToSearchsploit.get(cve);
        tmp["exploits"] = tExploits;
      }
      if (this.cache.lstCveToMetasploit.has(cve)) {
        var tMetasploits = this.cache.lstCveToMetasploit.get(cve);
        tmp["metasploits"] = tMetasploits;
      }
    }

    return tmp;
  }

  getHead() {
    return `<head>
        <!-- Standard Meta -->
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      
        <!-- Site Properties -->
        <title>Homepage - Semantic</title>
        <link rel="stylesheet" type="text/css" href="/dist/semantic.css">
        <link rel="stylesheet" type="text/css" href="/css/master.css">
      
      
        <style type="text/css">
      
      
        </style>
      
        <script src="/js/jquery.min.js"></script>
        <script src="/dist/semantic.js"></script>
        <script src="htmx.min.js"></script>
      
      
        <script src="/js/engine.js"></script>
        
      </head>`;
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
