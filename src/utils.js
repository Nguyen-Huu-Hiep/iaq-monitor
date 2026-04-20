/**
 * Format ISO timestamp to "DD/MM/YYYY HH:mm:ss"
 * @param {string} isoString - e.g. "2026-04-20T15:52:06.627952"
 * @returns {string} e.g. "20/04/2026 15:52:06"
 */
export function formatDate(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function getAqiColor(aqi) {
  if (aqi == null) return "#cccccc";
  if (aqi <= 50) return "rgb(0,228,0)";
  if (aqi <= 100) return "rgb(255,255,0)";
  if (aqi <= 150) return "rgb(255,126,0)";
  if (aqi <= 200) return "rgb(255,0,0)";
  if (aqi <= 300) return "rgb(143,63,151)";
  return "rgb(126,0,35)";
}

export const METRICS = [
  { key: "aqi", label: "AQI", unit: null },
  { key: "temperature", label: "Temperature", unit: "°C" },
  { key: "humidity", label: "Humidity", unit: "%" },
  { key: "pm25", label: "PM2.5", unit: "µg/m³" },
  { key: "co", label: "CO", unit: "ppm" },
];
