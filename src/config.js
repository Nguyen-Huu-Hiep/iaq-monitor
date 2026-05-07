// Centralized configuration for all keys used in the application

// Database keys
export const DB_KEYS = {
  ROOM_ID: "room_id",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
  AQI: "aqi",
  TEMPERATURE: "temperature",
  HUMIDITY: "humidity",
  PM2_5: "pm2_5",
  PM1: "pm1",
  PM10: "pm10",
  TVOC: "tvoc",
  ECO2: "eco2",
  CO: "co",
  STATUS: "status",
  IN_ACTIVE: "in_active",
};

// Table names
export const TABLES = {
  LIST_ONE: "api_room",
  ALL_DATA: "api_room_history",
};

// Metric definitions — driven by DB_KEYS use for room detail
export const METRICS = [
  { key: DB_KEYS.AQI, label: "AQI", unit: null },
  { key: DB_KEYS.TEMPERATURE, label: "Temperature", unit: "°C" },
  { key: DB_KEYS.HUMIDITY, label: "Humidity", unit: "%" },
  { key: DB_KEYS.PM2_5, label: "PM2.5", unit: "µg/m³" },
  { key: DB_KEYS.PM1, label: "PM1", unit: "µg/m³" },
  { key: DB_KEYS.PM10, label: "PM10", unit: "µg/m³" },
  { key: DB_KEYS.TVOC, label: "TVOC", unit: "ppb" },
  { key: DB_KEYS.ECO2, label: "eCO₂", unit: "ppm" },
  { key: DB_KEYS.CO, label: "CO", unit: "ppm" },
];

// Realtime configuration
export const REALTIME_CONFIG = {
  CHANNEL_NAME: "sensor_data_realtime",
  MAX_RETRY: 3,
  INACTIVE_THRESHOLD_MS: 60_000,
};

// Chart configuration
export const CHART_CONFIG = {
  MAX_POINTS_24H: 72,
  MAX_POINTS_1H: 60,
  CACHE_TTL_MS: 5 * 60 * 1000,
};

// Fetch configuration
export const FETCH_CONFIG = {
  MAX_RETRY: 3,
  RETRY_DELAY_MS: 2000,
};
