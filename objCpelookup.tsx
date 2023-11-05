import React from "react";

class objCpeLookup extends React.Component {
  state = {};
  render() {
    return (
      <div id="search-container" class="ui category search">
        <p>hello</p>
        <div class="ui icon input">
          <input
            id="search-input"
            class="prompt"
            type="text"
            placeholder="Search..."
            name="query"
            hx-get="/search"
            hx-trigger="click from:#search-button"
            hx-target="#search-results"
            hx-swap="outerHTML"
          />
          <button id="search-button" class="ui button">
            Search
          </button>
        </div>
        <div id="search-results"></div>
      </div>
    );
  }
}

export default objCpeLookup;
