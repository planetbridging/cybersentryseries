import React from "react";

class ObjCveBulkView extends React.Component {
  renderMetrics(metrics) {
    if (!metrics) return null;

    const version = metrics.cvssV3 ? "V3" : "V2";
    const cvss = metrics[`cvss${version}`];

    return (
      <div className="ui segment">
        <h4 className="ui header">CVSS {version}</h4>
        <table className="ui celled table">
          <tbody>
            {Object.entries(cvss).map(([key, value]) => (
              <tr key={key}>
                <th>{key}</th>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  renderCVEInfo(cveInfo) {
    return (
      <div className="ui segment">
        <h3 className="ui header">{cveInfo.cve}</h3>
        <p>{cveInfo.description}</p>
        {this.renderMetrics(cveInfo.baseMetricV3 || cveInfo.baseMetricV2)}
        <div className="ui segment">
          <h4 className="ui header">CPE List</h4>
          <div className="ui labels">
            {cveInfo.lstCpe.map((cpe, index) => (
              <div key={index} className="ui label">
                {cpe}
              </div>
            ))}
          </div>
        </div>
        {cveInfo.categories && cveInfo.categories.length > 0 && (
          <div className="ui segment">
            <h4 className="ui header">Categories</h4>
            <div className="ui labels">
              {cveInfo.categories.map((category, index) => (
                <div key={index} className="ui green label">
                  {category}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  render(data) {
    //const { data } = this.props;

    return (
      <div className="ui container">
        <div className="ui segments">
          <div className="ui segment">
            <p>
              <strong>Path:</strong> {data.path}
            </p>
          </div>
          <div className="ui segment">
            <p>
              <strong>Search:</strong> {data.search}
            </p>
          </div>
          {data.found && (
            <div className="ui segment">
              <h3 className="ui header">Found CVE</h3>
              {this.renderCVEInfo(data.found)}
            </div>
          )}
          {data.possible && data.possible.length > 0 && (
            <div className="ui segment">
              <h3 className="ui header">Possible CVEs</h3>
              {data.possible.map(([cve, info]) => (
                <div key={cve} className="ui segment">
                  {this.renderCVEInfo(info)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default ObjCveBulkView;
