import axios from "axios";
import React from "react";

import objCveView from "./objCveView";
import { objSemanticBuilder } from "./objSemanticBuilder";
//o:microsoft:windows_7:sp1
class objCpeLookup extends React.Component {
  state = {};

  constructor() {
    super();
    this.oSemaBuilder = new objSemanticBuilder();
  }

  async renderSearchResults(search) {
    //console.log(search);
    var searchResults = await axios.get(
      "http://localhost:8123/cpelookup?search=" + search
    );
    var data = searchResults["data"];
    //console.log(data);

    return (
      <div id="search-results-cpelookup">
        <div className="ui container">
          <h2 className="ui header">Search: {data.search}</h2>
          {data["found"] != ""
            ? this.renderFoundItems(data["found"], search)
            : ""}
          {data["possible"] != ""
            ? this.renderPossibleCards(data["possible"])
            : ""}
        </div>
      </div>
    );
  }

  renderPossibleCveCards(cveList) {
    return cveList.map((cve, idx) => (
      <div key={idx} className="ui card">
        <div className="content">
          <div className="item">{cve}</div>
        </div>
      </div>
    ));
  }

  /*htmx implementation
  renderPossibleCards(possible) {
    return possible.map((item, index) => (
      <div key={index} className="card">
        <div className="content">
          <button
            class="ui primary button"
            hx-get={"/cpesearchresults?search=" + item[0]}
            hx-trigger="click"
            hx-target="#search-results-cpelookup"
            hx-swap="outerHTML"
          >
            {item[0]}
          </button>
          <div className="description">
            <div className="ui cards">
              {this.renderPossibleCveCards(item[1])}
            </div>
          </div>
        </div>
      </div>
    ));
  }*/

  renderPossibleCards(possible) {
    return possible.map((item, index) => (
      <div key={index} className="card">
        <div className="content">
          <a href={"/cpesearch?search=" + item[0]} class="ui primary button">
            {item[0]}
          </a>
          <div className="description">
            <div className="ui cards">
              {this.renderPossibleCveCards(item[1])}
            </div>
          </div>
        </div>
      </div>
    ));
  }

  getUniqCategories(found) {
    var lstUniqCategories = new Map();
    for (var c in found) {
      for (var cats in found[c].cve.categories) {
        const category = found[c].cve.categories[cats];
        if (category) {
          // We need to check if the category is already present, otherwise initialize an empty array
          if (!lstUniqCategories.has(category)) {
            lstUniqCategories.set(category, true); // Set value to true or any other value just to acknowledge the existence of the key
          }
        }
      }
    }

    // Now retrieve the unique categories from the Map
    var uniqCat = Array.from(lstUniqCategories.keys());
    //console.log(uniqCat);

    var tmp = uniqCat.map((item, index) => (
      <div key={index} className="ui card">
        <div className="content">{item}</div>
      </div>
    ));

    return [
      <div className="ui link cards">{tmp}</div>,
      uniqCat.length,
      uniqCat,
    ];
  }

  getUniqExploits(found) {
    var lstUniqCategories = new Map();
    for (var c in found) {
      for (var cats in found[c].exploits) {
        const category = found[c].exploits[cats];
        if (category) {
          // We need to check if the category is already present, otherwise initialize an empty array
          if (!lstUniqCategories.has(category)) {
            lstUniqCategories.set(category, true); // Set value to true or any other value just to acknowledge the existence of the key
          }
        }
      }
    }

    // Now retrieve the unique categories from the Map
    var uniqCat = Array.from(lstUniqCategories.keys());
    var tmp = uniqCat.map((item, index) => (
      <div key={index} className="ui card">
        <div className="content">
          <a
            href={`https://www.exploit-db.com/exploits/${item[0]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ui small blue basic label"
          >
            {`https://www.exploit-db.com/exploits/${item[0]}`}
            {this.oSemaBuilder.renderSimpleJsonToTable(item[1], " inverted")}
          </a>
        </div>
      </div>
    ));

    return [
      <div className="ui link cards">{tmp}</div>,
      uniqCat.length,
      uniqCat,
    ];
  }

  renderFoundItems(found, search) {
    /*for (var f in found) {
      console.log(found[f].metasploits);
    }*/

    var oCveView = new objCveView();

    var tmp = found.map((item, index) => (
      <div key={index} className="ui card">
        <div className="content">
          <div className="description">
            <div className="ui list">
              <div className="item">{oCveView.render(item)}</div>
              <div className="item">
                <strong>Exploits:</strong>
                {item.exploits && item.exploits.length > 0 ? (
                  <div className="ui list">
                    {item.exploits.map((exploitId, index) => (
                      <a
                        key={index}
                        href={`https://www.exploit-db.com/exploits/${exploitId[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ui small blue basic label"
                      >
                        {exploitId[0]}
                      </a>
                    ))}
                  </div>
                ) : (
                  <div>None</div>
                )}
              </div>
              <div className="item">
                <strong>Metasploits:</strong>
                {item.metasploits && item.metasploits.length > 0 ? (
                  <div className="ui list">
                    {item.metasploits.map((metasploit, index) => (
                      <div key={index} className="item">
                        <div className="content">
                          <div className="header">{metasploit.name}</div>
                          <div className="description">
                            {metasploit.fullname}
                          </div>
                          <div className="meta">{metasploit.type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>None</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    ));

    var uniqCat = this.getUniqCategories(found);
    var uniqExploits = this.getUniqExploits(found);
    return (
      <div>
        <a
          href={"http://localhost:8123/cpesearchresultspdf?search=" + search}
          className="ui large fluid button"
          target="_blank"
        >
          Export {search} to pdf
        </a>

        <h3 class="ui center aligned header">
          Unique Categories {uniqCat[1].toString()}
        </h3>
        {uniqCat[0]}
        <h3 class="ui center aligned header">
          Unique Exploits {uniqExploits[1].toString()}
        </h3>
        {uniqExploits[0]}
        <h3 class="ui center aligned header">
          Unique Cve {found.length.toString()}
        </h3>
        <div class="ui link cards">{tmp}</div>
      </div>
    );
  }

  async render(ssrRender, search) {
    var loadSearchResults = null;
    if (ssrRender) {
      loadSearchResults = await this.renderSearchResults(search);
    }
    return (
      <div className="ui container">
        <h1 className="ui center aligned header">CPE Lookup</h1>
        <div id="search-container-cpelookup" className="ui category search">
          <div className="ui massive fluid icon input">
            <input
              id="search-input-cpelookup"
              className="prompt"
              type="text"
              placeholder="o:microsoft:windows_7:sp1"
              name="search"
              hx-get="/cpesearchresults"
              hx-trigger="click from:#search-button-cpelookup"
              hx-target="#search-results-cpelookup"
              hx-swap="outerHTML"
            />
            <i className="search icon"></i>
          </div>
          <button
            id="search-button-cpelookup"
            className="ui large fluid button"
            style={{ marginTop: "10px" }}
          >
            Search
          </button>
        </div>
        <div id="search-results-cpelookup">{loadSearchResults}</div>
      </div>
    );
  }
}

export default objCpeLookup;
