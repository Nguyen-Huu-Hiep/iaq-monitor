import "./App.css";

function Header({ realtimeStatus = "connecting" }) {
  return (
    <div className="header">
      <h1>AQI MONITOR PROMAX</h1>
      <p>Created by HuuHiep</p>
      <div
        className={`realtime-dot realtime-dot--${realtimeStatus}`}
        title={`Realtime: ${realtimeStatus}`}
      />
    </div>
  );
}
export default Header;
