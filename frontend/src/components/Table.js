import React from "react";

export default function Table({ header, rows }) {
  return (
    <div className="table-wrap">
      <table className="table-ui">
        <thead><tr>{header}</tr></thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}
