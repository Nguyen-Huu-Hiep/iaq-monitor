import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ThemeButton from "./components/ThemeButton";

function Header({
  realtimeStatus = "connecting",
  theme = "dark",
  onToggleTheme,
}) {
  return (
    <div className="header">
      <ThemeButton theme={theme} onToggleTheme={onToggleTheme} />
      <h1>IAQ MONITOR SYSTEM</h1>
      <p>Hệ thống giám sát chất lượng không khí phòng học</p>
      <div
        className={`realtime-dot realtime-dot--${realtimeStatus}`}
        title={`Realtime: ${realtimeStatus}`}
      />
    </div>
  );
}
export default Header;
