import axios from "axios";
import React from "react";

import objCveView from "./objCveView";
import objCveBulkView from "./objCveBulkView";
import { objSemanticBuilder } from "./objSemanticBuilder";

class objCvelookup extends React.Component {
  state = {};

  constructor() {
    super();
    this.oSemaBuilder = new objSemanticBuilder();
    this.objCveBulkView = new objCveBulkView();
  }

  async renderSearchResults(search) {
    //console.log(search);
    var searchResults = await axios.get(
      "http://localhost:8123/cvelookup?search=" + search
    );
    var data = searchResults["data"];
    //console.log(data);
    var cveBulkViewRender = this.objCveBulkView.render(data);

    return <div id="search-results-cvelookup">{cveBulkViewRender}</div>;
  }

  async render(ssrRender, search) {
    var loadSearchResults = null;
    if (ssrRender) {
      loadSearchResults = await this.renderSearchResults(search);
    }
    return (
      <div className="ui container">
        <h1 className="ui center aligned header">CVE Lookup</h1>
        <div id="search-container-cvelookup" className="ui category search">
          <div className="ui massive fluid icon input">
            <input
              id="search-input-cvelookup"
              className="prompt"
              type="text"
              placeholder="CVE-2017-0143"
              name="search"
              hx-get="/cvesearchresults"
              hx-trigger="click from:#search-button-cvelookup"
              hx-target="#search-results-cvelookup"
              hx-swap="outerHTML"
            />
            <i className="search icon"></i>
          </div>
          <button
            id="search-button-cvelookup"
            className="ui large fluid button"
            style={{ marginTop: "10px" }}
          >
            Search
          </button>
        </div>
        <div id="search-results-cvelookup">{loadSearchResults}</div>
      </div>
    );
  }
}

export default objCvelookup;
