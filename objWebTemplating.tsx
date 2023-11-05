import React from "react";

export class objWebTemplating extends React.Component {
  constructor(props) {
    super(props);
    // Assuming you have an array of items as a state
    this.state = {
      items: ["Item 1", "Item 2", "Item 3", "Item 4"],
    };
  }

  renderList() {
    const { items } = this.state;
    const listItems = [];

    for (let i = 0; i < items.length; i++) {
      listItems.push(<li key={i}>{items[i]}</li>);
    }

    return <ul>{listItems}</ul>;
  }

  render() {
    return (
      <body>
        <div class="ui top fixed menu inverted fluid six item">
          <div class="header item">cyber sentry series</div>
          <a class="item">home</a>
          <a class="item">cpelookup</a>
          <a class="item">cvelookup</a>
          <a class="item">bewear</a>
          <a class="item">go get galaxy</a>
        </div>
        <div id="main" class="content scrollable">
          <div class="ui container">
            <h1 class="ui header">Article Title</h1>
            <p>Here goes the scrolling content of the web page...</p>

            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
          </div>
        </div>
        <div class="ui bottom fixed menu inverted">
          <a class="item">Features</a>
          <a class="item">Testimonials</a>
          <a class="item">Sign-in</a>
        </div>
      </body>
    );
  }
}
