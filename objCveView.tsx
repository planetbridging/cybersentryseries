import React from "react";

class objCveView extends React.Component {
  render(data) {
    const { exploits, metasploits, cve } = data || {};

    // Ensure the cve object and its properties exist before trying to render them
    if (!cve) {
      return <div className="ui message">No CVE data available.</div>;
    }

    const { baseMetricV2, description, lstCpe, categories, cve: cveId } = cve;

    return (
      <div className="ui container">
        {cveId && <h2 className="ui header">{cveId}</h2>}
        {categories.length > 0 ? categories.join(", ") : "None"}
      </div>
    );
  }
}

export default objCveView;
