import "./App.css";

function Header({ realtimeStatus = "connecting" }) {
  return (
    <div className="header">
      <h1>IAQ MONITOR SYSTEM</h1>
      <p>Hệ thống giám sát chất lượng không khí phòng học</p>
      <div
        // onClick={(e) => {
        //   e.stopPropagation();
        //   onHiddenClick?.();
        // }}
        className={`realtime-dot realtime-dot--${realtimeStatus}`}
        title={`Realtime: ${realtimeStatus}`}
      />
    </div>
  );
}
export default Header;
