import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../App.css";
import { DB_KEYS } from "../config";
import { getApiStatusIcon, getAqiColor } from "../utils";

const RoomCard = ({ roomId, items, setSelectedRoom }) => {
  const latestAqi = items?.[DB_KEYS.AQI] ?? null;
  const color = getAqiColor(latestAqi, items?.[DB_KEYS.IN_ACTIVE]);

  return (
    <div
      className="room-card"
      onClick={() => {
        setSelectedRoom(roomId);
      }}
    >
      <div className="room-card-top">
        <div className="room-card-header">
          <span
            className="room-card-icon"
            style={{
              color: items?.[DB_KEYS.IN_ACTIVE] ? "unset" : color,
            }}
          >
            {roomId}
          </span>
          <span className="room-card-room-name">
            {items?.status || `Phòng ${roomId}`}
          </span>
        </div>
      </div>
      <div className="room-card-body">
        <div
          className="room-card-value"
          style={{
            color: color ?? "var(--text-backup)",
          }}
        >
          {latestAqi ?? "N/A"}
          <FontAwesomeIcon
            icon={getApiStatusIcon(latestAqi, items?.[DB_KEYS.IN_ACTIVE])}
          />
        </div>
        <div className="room-card-status">AQI</div>
      </div>
    </div>
  );
};

export default RoomCard;
