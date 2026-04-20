import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "./App.css";
import { formatDate, getMetricColor, METRICS } from "./utils";
import { useQueryParam } from "./useQueryParam";
import Header from "./Header";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
);

function RoomDetail({ roomId, items, onBack }) {
  const latest = items?.[0] ?? {};
  const [activeMetric, setActiveMetric] = useQueryParam("details", "aqi");

  const reversed = [...(items ?? [])].reverse();
  const labels = reversed.map((d) => formatDate(d.created_at));
  const values = reversed.map((d) => d[activeMetric] ?? null);

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
        }}
      >
        ← Dashboard
      </button>
      <div className="detail-header">
        <h2>Room {roomId}</h2>
      </div>
      <p className="detail-time">
        {latest.created_at ? formatDate(latest.created_at) : "N/A"}
      </p>

      <div className="metric-grid">
        {METRICS.map(({ key, label, unit }) => (
          <div
            key={key}
            className={`metric-card clickable${
              activeMetric === key ? " active" : ""
            }`}
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
        <div className="chart-title">
          {metricMeta?.label} {metricMeta?.unit}
        </div>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

export default RoomDetail;
