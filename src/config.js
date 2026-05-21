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
  LIST_NAME_MAPPING: "api_room_name_mapping",
};

// Metric definitions — driven by DB_KEYS use for room detail
export const METRICS = [
  {
    key: DB_KEYS.AQI,
    label: "AQI",
    unit: null,
    icon: "🪟",
    iconBg: "rgba(100,120,200,0.2)",
  },
  {
    key: DB_KEYS.TEMPERATURE,
    label: "Temperature",
    unit: "°C",
    icon: "🌡️",
    iconBg: "rgba(255,100,80,0.2)",
  },
  {
    key: DB_KEYS.HUMIDITY,
    label: "Humidity",
    unit: "%",
    icon: "💧",
    iconBg: "rgba(80,160,255,0.2)",
  },
  {
    key: DB_KEYS.PM2_5,
    label: "PM2.5",
    unit: "µg/m³",
    icon: "🧹",
    iconBg: "rgba(180,140,80,0.2)",
  },
  {
    key: DB_KEYS.PM1,
    label: "PM1",
    unit: "µg/m³",
    icon: "🧹",
    iconBg: "rgba(180,140,80,0.2)",
  },
  {
    key: DB_KEYS.PM10,
    label: "PM10",
    unit: "µg/m³",
    icon: "🧹",
    iconBg: "rgba(180,140,80,0.2)",
  },
  {
    key: DB_KEYS.TVOC,
    label: "TVOC",
    unit: "ppb",
    icon: "🧪",
    iconBg: "rgba(160,80,200,0.2)",
  },
  {
    key: DB_KEYS.ECO2,
    label: "eCO₂",
    unit: "ppm",
    icon: "🌿",
    iconBg: "rgba(60,180,100,0.2)",
  },
  {
    key: DB_KEYS.CO,
    label: "CO",
    unit: "ppm",
    icon: "⚠️",
    iconBg: "rgba(255,160,40,0.2)",
  },
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
