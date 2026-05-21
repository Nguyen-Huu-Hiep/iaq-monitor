import "./App.css";

function Header({ realtimeStatus = "connecting", onHiddenClick }) {
  return (
    <div className="header">
      <h1>AQI MONITOR PROMAX</h1>
      <p>Created by HuuHiep</p>
      <div
        onClick={(e) => {
          e.stopPropagation();
          onHiddenClick?.();
        }}
        className={`realtime-dot realtime-dot--${realtimeStatus}`}
        title={`Realtime: ${realtimeStatus}`}
      />
    </div>
  );
}
export default Header;
