const express = require("express");
const bodyParser = require("body-parser");
const { parseString } = require("xml2js");
const path = require("path");
const app = express();
const methodOverride = require("method-override");
const mime = require("mime");

import { objDownloadManager } from "./objDownloadManager";
const oLoadFiles = require("./hashFiles");

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

    this.dynamicCacheApi("/cvelookup", this.cache.lstCve);
    this.dynamicCacheApi("/cpelookup", this.cache.lstUniqCpe);
    this.dynamicCacheApi("/cpetocvelookup", this.cache.lstCpeToCve);
    this.dynamicCacheApi("/searchsploitlookup", this.cache.lstSearchsploit);
    this.dynamicCacheApi(
      "/cvetoexpliotlookup",
      this.cache.lstCveToSearchsploit
    );
    this.dynamicCacheApi(
      "/cvetometasploitlookup",
      this.cache.lstCveToMetasploit
    );

    this.loadPublicIntoCache();

    app.listen(this.port, () => {
      console.log("Server is running on port " + this.port);
    });
  }

  dynamicCacheApi(path) {
    app.get(path, (req, res) => {
      var json = {
        path: path,
        search: "",
        found: "",
        possible: [],
      };
      if (req.query.search) {
        const searchQuery = req.query.search;
        json.search = searchQuery;
        if (this.cache.has(searchQuery)) {
          json.found = this.cache.get(searchQuery);
        } else {
          var possible = [];
          // var count = 0;
          for (const [key, value] of this.cache.entries()) {
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
    });
  }

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

      switch (req.path) {
        case "/":
          pageFound = true;

          break;
      }

      try {
        if (!pageFound) {
          res.status(404).send("404 - Not Found");
          return;
        } else {
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

          res.send(`
          
  <!DOCTYPE html>
  <html>
  <head>
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
  
  
    <script src="/js/engine.js"></script>
    
  </head>
  <body>
  <div id="particles-js"></div>
  <div class="ui main text container">
  <h1 class="ui header">Sticky Example</h1>
  <p>This example shows how to use lazy loaded images, a sticky menu, and a simple text container</p>
  </div>
  
  
  <div class="ui borderless main menu">
  <div class="ui text container">
    <div class="header item">
      <img class="logo" src="assets/images/logo.png">
      Project Name
    </div>
    <a href="#" class="item">Blog</a>
    <a href="#" class="item">Articles</a>
    <a href="#" class="ui right floated dropdown item">
      Dropdown <i class="dropdown icon"></i>
      <div class="menu">
        <div class="item">Link Item</div>
        <div class="item">Link Item</div>
        <div class="divider"></div>
        <div class="header">Header Item</div>
        <div class="item">
          <i class="dropdown icon"></i>
          Sub Menu
          <div class="menu">
            <div class="item">Link Item</div>
            <div class="item">Link Item</div>
          </div>
        </div>
        <div class="item">Link Item</div>
      </div>
    </a>
  </div>
  </div>
  
  <div class="ui text container">
  <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>
  <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>
  <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>
  <div class="overlay">
    <div class="ui labeled icon vertical menu">
      <a class="item"><i class="twitter icon"></i> Tweet</a>
      <a class="item"><i class="facebook icon"></i> Share</a>
      <a class="item"><i class="mail icon"></i> E-mail</a>
    </div>
  </div>
  <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>
  <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>
  <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>
  <img class="ui medium left floated image" data-src="assets/images/wireframe/square-image.png">
  <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>
  <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.
  <img class="ui medium right floated image" data-src="assets/images/wireframe/square-image.png">
  Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>
  <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>
  <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>
  <img class="ui medium left floated image" data-src="assets/images/wireframe/square-image.png">
  <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>
  <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.
  <img class="ui medium right floated image" data-src="assets/images/wireframe/square-image.png">
  Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>
  <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>
  <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>
  </div>
  
  <div class="ui inverted vertical footer segment">
  <div class="ui center aligned container">
    <div class="ui stackable inverted divided grid">
      <div class="three wide column">
        <h4 class="ui inverted header">Group 1</h4>
        <div class="ui inverted link list">
          <a href="#" class="item">Link One</a>
          <a href="#" class="item">Link Two</a>
          <a href="#" class="item">Link Three</a>
          <a href="#" class="item">Link Four</a>
        </div>
      </div>
      <div class="three wide column">
        <h4 class="ui inverted header">Group 2</h4>
        <div class="ui inverted link list">
          <a href="#" class="item">Link One</a>
          <a href="#" class="item">Link Two</a>
          <a href="#" class="item">Link Three</a>
          <a href="#" class="item">Link Four</a>
        </div>
      </div>
      <div class="three wide column">
        <h4 class="ui inverted header">Group 3</h4>
        <div class="ui inverted link list">
          <a href="#" class="item">Link One</a>
          <a href="#" class="item">Link Two</a>
          <a href="#" class="item">Link Three</a>
          <a href="#" class="item">Link Four</a>
        </div>
      </div>
      <div class="seven wide column">
        <h4 class="ui inverted header">Footer Header</h4>
        <p>Extra space for a call to action inside the footer that could help re-engage users.</p>
      </div>
    </div>
    <div class="ui inverted section divider"></div>
    <img src="assets/images/logo.png" class="ui centered mini image">
    <div class="ui horizontal inverted small divided link list">
      <a class="item" href="#">Site Map</a>
      <a class="item" href="#">Contact Us</a>
      <a class="item" href="#">Terms and Conditions</a>
      <a class="item" href="#">Privacy Policy</a>
    </div>
  </div>
  </div>
  
  
              <script src="/particles.min.js"></script>
  <script src="/particles.min.js"></script>
  </body>
  
  </html>
  
          
          `);
        }
      } catch (ex) {
        console.log(ex);
        res.status(404).send("404 - Not Found");
        return;
      }
    });
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
