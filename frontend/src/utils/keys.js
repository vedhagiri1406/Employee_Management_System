// src/utils/keys.js
export function keyFromLabel(label) {
  return (label || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}
