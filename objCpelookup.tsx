import axios from "axios";
import React from "react";

class objCpeLookup extends React.Component {
  state = {};

  async renderSearchResults(search) {
    console.log(search);
    var searchResults = await axios.get(
      "http://localhost:8123/cpelookup?search=" + search
    );
    console.log(searchResults["data"]);
    return <div id="search-results-cpelookup">{new Date().toDateString()}</div>;
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
