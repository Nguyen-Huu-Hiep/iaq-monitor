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
import "./App.css";
import ErrorState from "./components/ErrorState";
import useChartData from "./useChartData";
import { useQueryParam } from "./useQueryParam";
import { formatDate, getMetricColor, METRICS } from "./utils";
import { DB_KEYS } from "./config";

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
  { label: "24h", hours: 24 },
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
    ready: item != null,
  });

  const labels = chartItems.map((d) =>
    formatDate(d[DB_KEYS.CREATED_AT], { compact: true, shortYear: true }),
  );
  const values = chartItems.map((d) => d[activeMetric] ?? null);

  const metricMeta = METRICS.find((m) => m.key === activeMetric);

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
            <div className="no-data-icon">📭</div>
            <div>No data to show!</div>
          </div>
        );
      case loading:
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
        ← Back
      </button>
      <div className="detail-header">
        <h2>Room {roomId}</h2>
      </div>
      <p className="detail-time">
        {item?.[DB_KEYS.CREATED_AT]
          ? formatDate(item?.[DB_KEYS.CREATED_AT], { seconds: true })
          : "N/A"}
      </p>

      <div className="metric-grid">
        {item == null
          ? Array.from({ length: METRICS.length }, (_, i) => (
              <div key={i} className="room-card room-card-skeleton">
                <div className="skeleton-line skeleton-title" />
                <div className="skeleton-line skeleton-value" />
              </div>
            ))
          : METRICS.sort((a, b) => {
              const aNull = item?.[a.key] == null ? 1 : 0;
              const bNull = item?.[b.key] == null ? 1 : 0;
              return aNull - bNull;
            }).map(({ key, label, unit }) => (
              <div
                key={key}
                className={`metric-card clickable${activeMetric === key ? " active" : ""}`}
                style={{
                  backgroundColor:
                    getMetricColor(key, item?.[key]) ?? "#1e1e2e",
                }}
                onClick={() => setActiveMetric(key)}
              >
                <div className="metric-label">{label}</div>
                <div className="metric-value">
                  {item?.[key] ?? "N/A"}
                  {item?.[key] != null && unit && (
                    <span className="metric-unit"> {unit}</span>
                  )}
                </div>
              </div>
            ))}
      </div>

      <div className="chart-container">
        <div className="chart-header">
          <div className="chart-title">
            {metricMeta?.label} {metricMeta?.unit}
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
              onClick={refetch}
              disabled={loading}
              title={loading ? "Getting new data" : "Reload chart"}
            >
              {loading ? "⏳" : "↻"}
            </button>
          </div>
        </div>
        {renderChart()}
      </div>
    </div>
  );
}

export default RoomDetail;
