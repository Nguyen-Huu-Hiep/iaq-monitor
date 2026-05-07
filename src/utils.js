/**
 * Format ISO timestamp to "DD/MM/YYYY HH:mm:ss"
 */
export function formatDate(isoString, options = {}) {
  const { seconds = false, compact = false, shortYear = false } = options;

  if (!isoString) return "—";
  const d = new Date(isoString);

  const pad2 = (n) => String(n).padStart(2, "0");
  const maybePad = (n) => (compact ? String(n) : pad2(n));

  const day = maybePad(d.getDate());
  const month = maybePad(d.getMonth() + 1);

  const year = shortYear ? String(d.getFullYear()).slice(-2) : d.getFullYear();

  return `${day}/${month}/${year} ${pad2(d.getHours())}:${pad2(
    d.getMinutes(),
  )}${seconds ? `:${pad2(d.getSeconds())}` : ""}`;
}

export function getAqiColor(aqi, inActive = false) {
  if (inActive) return "rgba(78, 78, 78, 1)";
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

// PM1 / PM10 (µg/m³) — dùng thang tương tự PM2.5
export function getPmColor(v) {
  if (v == null) return null;
  if (v <= 12) return "rgb(0,228,0)";
  if (v <= 35) return "rgb(255,255,0)";
  if (v <= 55) return "rgb(255,126,0)";
  if (v <= 150) return "rgb(255,0,0)";
  if (v <= 250) return "rgb(143,63,151)";
  return "rgb(126,0,35)";
}

// TVOC (ppb)
export function getTvocColor(v) {
  if (v == null) return null;
  if (v <= 220) return "rgb(0,228,0)";
  if (v <= 660) return "rgb(255,255,0)";
  if (v <= 2200) return "rgb(255,126,0)";
  if (v <= 5500) return "rgb(255,0,0)";
  return "rgb(143,63,151)";
}

// eCO2 (ppm)
export function getEco2Color(v) {
  if (v == null) return null;
  if (v <= 600) return "rgb(0,228,0)";
  if (v <= 1000) return "rgb(255,255,0)";
  if (v <= 2500) return "rgb(255,126,0)";
  if (v <= 5000) return "rgb(255,0,0)";
  return "rgb(143,63,151)";
}

import { DB_KEYS, METRICS } from "./config";

export { METRICS };

export function getMetricColor(key, value) {
  switch (key) {
    case DB_KEYS.AQI:
      return getAqiColor(value);
    case DB_KEYS.TEMPERATURE:
      return getTemperatureColor(value);
    case DB_KEYS.HUMIDITY:
      return getHumidityColor(value);
    case DB_KEYS.PM2_5:
      return getPm25Color(value);
    case DB_KEYS.PM1:
    case DB_KEYS.PM10:
      return getPmColor(value);
    case DB_KEYS.TVOC:
      return getTvocColor(value);
    case DB_KEYS.ECO2:
      return getEco2Color(value);
    case DB_KEYS.CO:
      return getCoColor(value);
    default:
      return null;
  }
}
