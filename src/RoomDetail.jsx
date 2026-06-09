import {
  faBoxOpen,
  faHouse,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "./App.css";
import ErrorState from "./components/ErrorState";
import { DB_KEYS, TABLES } from "./config";
import { supabase } from "./supabase";
import useChartData from "./useChartData";
import { useQueryParam } from "./useQueryParam";
import { formatDate, getMetricColor, METRICS } from "./utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
);

const TIME_RANGES = [
  { label: "1 hour", hours: 1 },
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

  const [timeRangeFor1H, setTimeRangeFor1H] = useQueryParam("range1h", "24", {
    replace: true,
  });

  const hours = parseInt(timeRange, 10) || 1;
  const hoursFor1H = parseInt(timeRangeFor1H, 10) || 24;
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

  const [dataHour, setDataHour] = useState([]);
  const [fetching, setFetching] = useState(true);

  const loadHourData = async () => {
    setFetching(true);

    const pageSize = 1000;
    let from = 0;
    let allData = [];

    while (true) {
      const { data, error } = await supabase
        .from(TABLES.HOURLY_TABLE)
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) {
        break;
      }

      if (!data?.length) break;

      allData.push(...data);

      if (data.length < pageSize) break;

      from += pageSize;
    }

    setDataHour(allData);
    setFetching(false);
  };

  useEffect(() => {
    if (roomId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadHourData();
    }
  }, [roomId]);

  const hourlyItems = (() => {
    const all = dataHour ?? [];
    // eslint-disable-next-line react-hooks/purity
    const cutoff = new Date(Date.now() - hoursFor1H * 60 * 60 * 1000);
    return (
      all?.filter((d) => new Date(d.created_at) >= cutoff)?.reverse() ?? []
    );
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
      case loading || fetching:
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
      case inActive:
      case values?.every((v) => v == null):
      case item == null:
        return (
          <div className="no-data">
            <div className="no-data-icon">
              <FontAwesomeIcon icon={faBoxOpen} />
            </div>
            <div>No data to show!</div>
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
          setTimeRangeFor1H(null);
        }}
      >
        <FontAwesomeIcon icon={faHouse} />
      </button>
      <div className="detail-header">
        <h2>{item?.status || `Phòng ${roomId}`}</h2>
      </div>
      <div className="detail-time">
        {formatDate(item?.displayTime, { seconds: true })}
      </div>

      <div className="metric-grid">
        {loading && item === null ? (
          <>
            <div className="metric-row-aqi">
              <div className="metric-card aqi-card room-card-skeleton">
                <div className="skeleton-line skeleton-title" />
                <div className="skeleton-line skeleton-value" />
              </div>
            </div>
            <div className="metric-row-others">
              {Array.from({ length: METRICS.length - 1 }, (_, i) => (
                <div key={i} className="metric-card room-card-skeleton">
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
                    {unit && <span className="metric-unit"> {unit}</span>}
                  </div>
                </div>
              );
            };

            const renderCardAQI = () => {
              const aqiVal = item?.[DB_KEYS.AQI];
              const aqiColor = getMetricColor(DB_KEYS.AQI, aqiVal);

              const aqiAvg1h = dataHour?.[0]?.aqi_h;
              const pm25Avg1h = dataHour?.[0]?.pm25_h.toFixed(0);

              return (
                <div
                  className={`metric-card aqi-card clickable${activeMetric === DB_KEYS.AQI || activeMetric === "aqi1h" ? " active" : ""}`}
                >
                  <div
                    className={`aqi-col aqi-col-left${activeMetric === "aqi1h" ? " active" : ""}`}
                    onClick={() => {
                      setActiveMetric("aqi1h");
                      setTimeRangeFor1H("24");
                    }}
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
                    className={`aqi-col aqi-col-right${activeMetric === DB_KEYS.AQI ? " active" : ""}`}
                    onClick={() => {
                      setActiveMetric(DB_KEYS.AQI);
                    }}
                  >
                    <span className="aqi-col-label">Realtime</span>
                    <span
                      className="aqi-col-value"
                      style={{ color: aqiColor ?? "#444" }}
                    >
                      {aqiVal ?? "N/A"}
                    </span>
                    <span className="aqi-col-unit">AQI</span>
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
            {TIME_RANGES.filter(
              ({ hours }) => !(activeMetric === "aqi1h" && hours === 1),
            ).map(({ label, hours }) => (
              <button
                key={label}
                className={`time-range-btn${(activeMetric === "aqi1h" ? timeRangeFor1H : timeRange) === String(hours) ? " active" : ""}`}
                onClick={() => {
                  if (activeMetric === "aqi1h") {
                    setTimeRangeFor1H(String(hours));
                  } else {
                    setTimeRange(String(hours));
                  }
                }}
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
