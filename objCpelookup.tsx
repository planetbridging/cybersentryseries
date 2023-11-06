import axios from "axios";
import React from "react";

class objCpeLookup extends React.Component {
  state = {};

  async renderSearchResults(search) {
    console.log(search);
    var searchResults = await axios.get(
      "http://localhost:8123/cpelookup?search=" + search
    );
    var data = searchResults["data"];
    console.log(data);

    return (
      <div id="search-results-cpelookup">
        <div className="ui container">
          <h2 className="ui header">CPE Lookup: {data.search}</h2>
          {data["found"] != "" ? this.renderFoundItems(data["found"]) : ""}
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
  }

  renderFoundItems(found) {
    var tmp = found.map((item, index) => (
      <div key={index} className="ui card">
        <div className="content">
          <div className="description">
            <div className="ui list">
              <div className="item">
                <strong>CVEs:</strong>
                {item.cve && item.cve.length > 0
                  ? item.cve.map((cveItem, cveIndex) => (
                      <div key={cveIndex} className="ui label">
                        {cveItem}
                      </div>
                    ))
                  : "None"}
              </div>
              <div className="item">
                <strong>Exploits:</strong>
                {item.exploits.length > 0 ? item.exploits.join(", ") : "None"}
              </div>
              <div className="item">
                <strong>Metasploits:</strong>
                {item.metasploits.length > 0
                  ? item.metasploits.join(", ")
                  : "None"}
              </div>
            </div>
          </div>
        </div>
      </div>
    ));

    return <div class="ui link cards">{tmp}</div>;
  }

  async render() {
    return (
      <div id="search-container-cpelookup" class="ui category search">
        <p>hello</p>
        <div class="ui icon input">
          <input
            id="search-input-cpelookup"
            class="prompt"
            type="text"
            placeholder="Search..."
            name="search"
            hx-get="/cpesearchresults"
            hx-trigger="click from:#search-button-cpelookup"
            hx-target="#search-results-cpelookup"
            hx-swap="outerHTML"
          />
          <button id="search-button-cpelookup" class="ui button">
            Search
          </button>
        </div>
        <div id="search-results-cpelookup"></div>
      </div>
    );
  }
}

export default objCpeLookup;
