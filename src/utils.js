/**
 * Format ISO timestamp to "DD/MM/YYYY HH:mm:ss"
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
  if (aqi == null) return null;
  if (aqi <= 50) return "rgb(0,228,0)";
  if (aqi <= 100) return "rgb(255,255,0)";
  if (aqi <= 150) return "rgb(255,126,0)";
  if (aqi <= 200) return "rgb(255,0,0)";
  if (aqi <= 300) return "rgb(143,63,151)";
  return "rgb(126,0,35)";
}

// Temperature: xanh lạnh → vàng → đỏ nóng
export function getTemperatureColor(v) {
  if (v == null) return null;
  if (v <= 16) return "rgb(100,180,255)";
  if (v <= 20) return "rgb(144,213,255)";
  if (v <= 25) return "rgb(0,228,0)";
  if (v <= 30) return "rgb(255,255,0)";
  if (v <= 35) return "rgb(255,126,0)";
  return "rgb(255,0,0)";
}

// Humidity: khô → ổn → ẩm
export function getHumidityColor(v) {
  if (v == null) return null;
  if (v <= 25) return "rgb(255,200,100)";
  if (v <= 40) return "rgb(255,255,0)";
  if (v <= 60) return "rgb(0,228,0)";
  if (v <= 75) return "rgb(100,200,255)";
  return "rgb(80,120,255)";
}

// PM2.5 (µg/m³) — theo WHO/AQI
export function getPm25Color(v) {
  if (v == null) return null;
  if (v <= 12) return "rgb(0,228,0)";
  if (v <= 35) return "rgb(255,255,0)";
  if (v <= 55) return "rgb(255,126,0)";
  if (v <= 150) return "rgb(255,0,0)";
  if (v <= 250) return "rgb(143,63,151)";
  return "rgb(126,0,35)";
}

// CO (ppm)
export function getCoColor(v) {
  if (v == null) return null;
  if (v <= 4) return "rgb(0,228,0)";
  if (v <= 9) return "rgb(255,255,0)";
  if (v <= 35) return "rgb(255,126,0)";
  if (v <= 70) return "rgb(255,0,0)";
  return "rgb(143,63,151)";
}

export function getMetricColor(key, value) {
  switch (key) {
    case "aqi":
      return getAqiColor(value);
    case "temperature":
      return getTemperatureColor(value);
    case "humidity":
      return getHumidityColor(value);
    case "pm25":
      return getPm25Color(value);
    case "co":
      return getCoColor(value);
    default:
      return null;
  }
}

export const METRICS = [
  { key: "aqi", label: "AQI", unit: null },
  { key: "temperature", label: "Temperature", unit: "°C" },
  { key: "humidity", label: "Humidity", unit: "%" },
  { key: "pm25", label: "PM2.5", unit: "µg/m³" },
  { key: "co", label: "CO", unit: "ppm" },
];
