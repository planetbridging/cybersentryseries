import React from "react";

class objCveView extends React.Component {
  render(data) {
    const { exploits, metasploits, cve } = data || {};

    // Ensure the cve object and its properties exist before trying to render them
    if (!cve) {
      return <div className="ui message">No CVE data available.</div>;
    }

    const { baseMetricV2, description, lstCpe, categories, cve: cveId } = cve;
    //console.log(categories);
    return (
      <div className="ui container">
        {cveId && (
          <a
            href={"/cvesearch?search=" + cveId}
            target="_blank"
            className="ui header"
          >
            <h2>{cveId}</h2>
          </a>
        )}
        {categories.length > 0 ? categories.join(", ") : "None"}
      </div>
    );
  }
}

export default objCveView;
