import React from "react";

export class objWebTemplating extends React.Component {
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
      
      
        <script src="/js/engine.js"></script>
        
      </head>`;
  }

  render() {
    return (
      <html>
        {this.getHead()}
        <body>
          <div class="ui fixed inverted menu">
            <div class="ui container">
              <a href="#" class="header item">
                My Website
              </a>
            </div>
          </div>

          <div class="content scrollable">
            <div class="ui container">
              <h1 class="ui header">Article Title</h1>
              <p>Here goes the scrolling content of the web page...</p>

              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
            </div>
          </div>

          <div class="ui fixed inverted footer menu">
            <div class="ui container">
              <span>&copy; 2023 My Website</span>
            </div>
          </div>
        </body>
      </html>
    );
  }
}
