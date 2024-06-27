import React from "react";
import { objSemanticBuilder } from "./objSemanticBuilder";
import objCpeLookup from "./objCpelookup";
import objCvelookup from "./objCvelookup";

export class objWebTemplating extends React.Component {
  constructor(props) {
    super(props);
    // Assuming you have an array of items as a state
    this.state = {
      items: ["Item 1", "Item 2", "Item 3", "Item 4"],
    };
    var oSemBuild = new objSemanticBuilder();
    this.oSemBuild = oSemBuild;
  }

  setStats(cacheStats) {
    this.cacheStats = cacheStats;
  }

  renderList() {
    const { items } = this.state;
    const listItems = [];

    for (let i = 0; i < items.length; i++) {
      listItems.push(<li key={i}>{items[i]}</li>);
    }

    return <ul>{listItems}</ul>;
  }

  renderCachStats() {
    var showStatsTbl = <></>;

    showStatsTbl = (
      <div class="ui container">
        <h1 class="ui header">Show stats of maps</h1>
        {this.oSemBuild.renderSimpleJsonToTable(this.cacheStats, "inverted")}
      </div>
    );

    return showStatsTbl;
  }

  async renderCpelookup(search, ssrRender) {
    var oCpelookup = new objCpeLookup();
    if (search == null) {
      return oCpelookup.render(false, "");
    } else if (ssrRender) {
      return oCpelookup.render(true, search);
    } else {
      return await oCpelookup.renderSearchResults(search);
    }
  }

  async renderCvelookup(search, ssrRender) {
    var oCvelookup = new objCvelookup();
    if (search == null) {
      return oCvelookup.render(false, "");
    } else if (ssrRender) {
      return oCvelookup.render(true, search);
    } else {
      return await oCvelookup.renderSearchResults(search);
    }
  }

  render(content) {
    return (
      <body>
        <div class="ui top fixed menu inverted fluid six item">
          <div class="header item">cyber sentry series</div>
          <a class="item" href="/">
            home
          </a>
          <a class="item" href="/cpesearch">
            cpelookup
          </a>

          <a class="item" href="/cvesearch">
            cvelookup
          </a>
        </div>
        <div class="main content scrollable">
          <div class="contentPg">{content}</div>
        </div>
      </body>
    );
  }
}

/*<a class="item">bewear</a>
          <a class="item">go get galaxy</a>
          
            <div class="ui bottom fixed menu inverted">
          <a class="item">Features</a>
          <a class="item">Testimonials</a>
          <a class="item">Sign-in</a>
        </div>
          
          */
