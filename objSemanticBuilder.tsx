export class objSemanticBuilder {
  renderSimpleJsonToTable(data, classNames) {
    const rows = Object.entries(data).map(([key, value]) => (
      <tr key={key}>
        <td>{key}</td>
        <td>{value.toString()}</td>
      </tr>
    ));

    return (
      <table className={"ui celled table " + classNames}>
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }
}
