import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotateRight,
  faBoxOpen,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";
import "./App.css";
import ErrorState from "./components/ErrorState";
import useChartData from "./useChartData";
import { useQueryParam } from "./useQueryParam";
import { formatDate, getMetricColor, METRICS } from "./utils";
import { DB_KEYS, TABLES } from "./config";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
);

const TIME_RANGES = [
  { label: "1h", hours: 1 },
  { label: "1 day", hours: 24 },
  { label: "1 week", hours: 168 },
];

function RoomDetail({ roomId, item, onBack }) {
  const inActive = item?.[DB_KEYS.IN_ACTIVE];
  const [activeMetric, setActiveMetric] = useQueryParam(
    "details",
    DB_KEYS.AQI,
    {
      replace: true,
    },
  );
  const [timeRange, setTimeRange] = useQueryParam("range", "1", {
    replace: true,
  });

  const hours = parseInt(timeRange, 10) || 1;
  const {
    data: chartItems,
    loading,
    error: chartError,
    refetch,
  } = useChartData({
    roomId,
    hours,
    inActive: inActive,
    ready: item != null && activeMetric != "aqi1h",
  });

  const [dataHour, setDataHour] = useState({});
  const [fetching, setFetching] = useState(true);

  const loadHourData = async () => {
    setFetching(true);
    const { data } = await supabase.from(TABLES.HOURLY_TABLE).select("*");
    const grouped = (data ?? []).reduce((acc, row) => {
      const id = row.room_id;
      if (!acc[id]) acc[id] = [];
      acc[id].push(row);
      return acc;
    }, {});

    for (const id of Object.keys(grouped)) {
      const latest = grouped[id].reduce((a, b) =>
        new Date(a.updated_at) > new Date(b.updated_at) ? a : b,
      );
      grouped[id].displayAQI = latest.aqi_h;
      grouped[id].displayPM25 = latest.pm25_h.toFixed(0);
    }
    setFetching(false);
    setDataHour(grouped);
  };

  useEffect(() => {
    if (roomId) {
      loadHourData();
    }
  }, [roomId]);

  const hourlyItems = (() => {
    const all = dataHour?.[roomId] ?? [];
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return all.filter((d) => new Date(d.created_at) >= cutoff);
  })();

  const labels =
    activeMetric === "aqi1h"
      ? hourlyItems.map((d) =>
          formatDate(d.created_at, { compact: true, shortYear: true }),
        )
      : chartItems.map((d) =>
          formatDate(d[DB_KEYS.CREATED_AT], { compact: true, shortYear: true }),
        );

  const values =
    activeMetric === "aqi1h"
      ? hourlyItems.map((d) => d.aqi_h ?? null)
      : chartItems.map((d) => d[activeMetric] ?? null);

  const metricMeta =
    activeMetric === "aqi1h"
      ? null
      : METRICS.find((m) => m.key === activeMetric);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        borderColor: "#4f9cf9",
        backgroundColor: "rgba(79,156,249,0.15)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { maxTicksLimit: window.innerWidth > 768 ? 6 : 3 } },
      y: {
        ticks: { callback: (v) => `${+v.toFixed(1)}${metricMeta?.unit ?? ""}` },
      },
    },
  };

  function renderChart() {
    switch (true) {
      case inActive:
        return (
          <div className="no-data">
            <div className="no-data-icon">
              <FontAwesomeIcon icon={faBoxOpen} />
            </div>
            <div>No data to show!</div>
          </div>
        );
      case loading || fetching:
      case item == null:
        return (
          <div className="chart-loading">
            <div className="chart-skeleton-bars">
              {Array.from({ length: 30 }, (_, i) => (
                <span
                  key={i}
                  style={{
                    height: `${30 + Math.sin(i * 0.8) * 25 + Math.cos(i * 0.4) * 20}%`,
                    animationDelay: `${(i * 0.05) % 0.6}s`,
                  }}
                />
              ))}
            </div>
            <div className="chart-skeleton-axis" />
          </div>
        );
      case chartError:
        return <ErrorState compact onRetry={refetch} />;
      default:
        return <Line data={chartData} options={chartOptions} />;
    }
  }

  return (
    <div className="detail">
      <button
        className="back-btn"
        onClick={() => {
          onBack();
          setActiveMetric(null);
          setTimeRange(null);
        }}
      >
        <FontAwesomeIcon icon={faHouse} />
      </button>
      <div className="detail-header">
        <h2>{item?.status || `Phòng ${roomId}`}</h2>
      </div>
      <div className="detail-time">
        {item?.displayTime ? (
          formatDate(item?.displayTime, { seconds: true })
        ) : (
          <div
            style={{ width: "100px" }}
            className="skeleton-line skeleton-label"
          />
        )}
      </div>

      <div className="metric-grid">
        {item == null ? (
          <>
            <div className="metric-row-aqi">
              <div className="metric-card aqi-card room-card-skeleton">
                <div className="skeleton-line skeleton-title" />
                <div className="skeleton-line skeleton-value" />
              </div>
            </div>
            <div className="metric-row-others">
              {Array.from({ length: METRICS.length - 1 }, (_, i) => (
                <div key={i} className="room-card room-card-skeleton">
                  <div className="skeleton-line skeleton-title" />
                  <div className="skeleton-line skeleton-value" />
                </div>
              ))}
            </div>
          </>
        ) : (
          (() => {
            const aqiMetric = METRICS.find((m) => m.key === DB_KEYS.AQI);
            const otherMetrics = METRICS.filter((m) => m.key !== DB_KEYS.AQI);

            const renderCard = ({ key, label, unit, icon, iconBg }) => {
              const color = getMetricColor(key, item?.[key]);
              const isNull = item?.[key] == null;
              return (
                <div
                  key={key}
                  className={`metric-card clickable${activeMetric === key ? " active" : ""}`}
                  onClick={() => setActiveMetric(key)}
                >
                  <div className="metric-card-top">
                    <span
                      className="metric-icon"
                      style={{ background: iconBg }}
                    >
                      <FontAwesomeIcon icon={icon} />
                    </span>
                    <span className="metric-label">{label}</span>
                  </div>
                  <div
                    className="metric-value"
                    style={{ color: isNull ? "#444" : (color ?? "#444") }}
                  >
                    {item?.[key] ?? "N/A"}
                    {item?.[key] != null && unit && (
                      <span className="metric-unit"> {unit}</span>
                    )}
                  </div>
                </div>
              );
            };

            const renderCardAQI = () => {
              const aqiVal = item?.[DB_KEYS.AQI];
              const aqiColor = getMetricColor(DB_KEYS.AQI, aqiVal);

              const aqiAvg1h = dataHour?.[roomId]?.displayAQI;
              const pm25Avg1h = dataHour?.[roomId]?.displayPM25;

              return (
                <div
                  className={`metric-card aqi-card clickable${activeMetric === DB_KEYS.AQI || activeMetric === "aqi1h" ? " active" : ""}`}
                >
                  <div
                    className="aqi-col aqi-col-left"
                    onClick={() => setActiveMetric("aqi1h")}
                  >
                    <span className="aqi-col-label">AQI 1h</span>
                    <span
                      className="aqi-col-value"
                      style={{
                        color: getMetricColor(DB_KEYS.AQI, aqiAvg1h) ?? "#444",
                      }}
                    >
                      {aqiAvg1h ?? "N/A"}
                    </span>
                    <span className="aqi-col-sub">
                      <span className="aqi-col-sub-label">PM2.5 1h</span>
                      <span
                        className="aqi-col-sub-value"
                        style={{
                          color:
                            getMetricColor(DB_KEYS.PM2_5, pm25Avg1h) ?? "#444",
                        }}
                      >
                        {pm25Avg1h ?? "N/A"}{" "}
                        <span style={{ color: "#ccc", fontWeight: "normal" }}>
                          µg/m³
                        </span>
                      </span>
                    </span>
                  </div>

                  <div
                    className="aqi-col aqi-col-right"
                    onClick={() => setActiveMetric(DB_KEYS.AQI)}
                  >
                    <span className="aqi-col-label">Realtime</span>
                    <span
                      className="aqi-col-value"
                      style={{ color: aqiColor ?? "#444" }}
                    >
                      {aqiVal ?? "N/A"}
                    </span>
                  </div>
                </div>
              );
            };

            return (
              <>
                {aqiMetric && (
                  <div className="metric-row-aqi">{renderCardAQI()}</div>
                )}
                <div className="metric-row-others">
                  {otherMetrics.map(renderCard)}
                </div>
              </>
            );
          })()
        )}
      </div>

      <div className="chart-container">
        <div className="chart-header">
          <div className="chart-title">
            {activeMetric === "aqi1h"
              ? "AQI 1H"
              : `${metricMeta?.label}${metricMeta?.unit ? ` ${metricMeta?.unit}` : ""}`}
          </div>
          <div className="time-range-selector">
            {TIME_RANGES.map(({ label, hours: h }) => (
              <button
                key={label}
                className={`time-range-btn${hours === h ? " active" : ""}`}
                onClick={() => setTimeRange(String(h))}
              >
                {label}
              </button>
            ))}
            <button
              className="time-range-btn"
              onClick={() => {
                activeMetric === "aqi1h" ? loadHourData() : refetch();
              }}
              disabled={loading}
              title={loading ? "Getting new data" : "Reload chart"}
            >
              <FontAwesomeIcon icon={faRotateRight} spin={loading} />
            </button>
          </div>
        </div>
        {renderChart()}
      </div>
    </div>
  );
}

export default RoomDetail;
