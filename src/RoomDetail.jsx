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
  { label: "1h", hours: 1 },
  { label: "24h", hours: 24 },
];

function RoomDetail({ roomId, items, onBack }) {
  const latest = items?.[0] ?? {};
  const inActive = items?.[0]?.in_active;
  const [activeMetric, setActiveMetric] = useQueryParam("details", "aqi", {
    replace: true,
  });
  const [timeRange, setTimeRange] = useQueryParam("range", "1", {
    replace: true,
  });

  const hours = parseInt(timeRange, 10) || 1;
  const {
    data: chartItems,
    loading,
    refetch,
  } = useChartData({
    roomId,
    hours,
    inActive: inActive ?? false,
    ready: items != null && items.length > 0,
  });

  const labels = chartItems.map((d) => formatDate(d.created_at));
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
      x: { ticks: { maxTicksLimit: 6 } },
      y: {
        ticks: { callback: (v) => `${+v.toFixed(1)}${metricMeta?.unit ?? ""}` },
      },
    },
  };

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
        ← Dashboard
      </button>
      <div className="detail-header">
        <h2>Room {roomId}</h2>
      </div>
      <p className="detail-time">
        {latest.created_at ? formatDate(latest.created_at, true) : "N/A"}
      </p>

      <div className="metric-grid">
        {METRICS.map(({ key, label, unit }) => (
          <div
            key={key}
            className={`metric-card clickable${activeMetric === key ? " active" : ""}`}
            style={{
              backgroundColor: getMetricColor(key, latest[key]) ?? "#1e1e2e",
            }}
            onClick={() => setActiveMetric(key)}
          >
            <div className="metric-label">{label}</div>
            <div className="metric-value">
              {latest[key] ?? "N/A"}
              {latest[key] != null && unit && (
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
        {inActive ? (
          <div className="no-data">
            <div className="no-data-icon">📭</div>
            <div>No data to show!</div>
          </div>
        ) : loading ? (
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
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}

export default RoomDetail;
