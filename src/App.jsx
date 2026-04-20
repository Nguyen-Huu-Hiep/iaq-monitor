import "./App.css";
import useSensorData from "./useSensorData";
import usePullToRefresh from "./usePullToRefresh";
import { getAqiColor } from "./utils";
import RoomDetail from "./RoomDetail";
import { useQueryParam } from "./useQueryParam";
import Header from "./Header";

function App() {
  const { dataByRoom, refetch } = useSensorData();
  const [selectedRoom, setSelectedRoom] = useQueryParam("room");
  const { visible, fading } = usePullToRefresh(refetch);

  return (
    <div className="app">
      {visible && (
        <div className={`pull-indicator${fading ? " fade-out" : ""}`}>
          ↓ Thả để tải lại
        </div>
      )}
      <Header />
      {selectedRoom ? (
        <RoomDetail
          roomId={selectedRoom}
          items={dataByRoom[selectedRoom]}
          onBack={() => setSelectedRoom(null)}
        />
      ) : (
        <div className="card-grid">
          {Object.entries(dataByRoom).map(([roomId, items]) => {
            const latestAqi = items[0]?.aqi ?? null;
            return (
              <div
                key={roomId}
                className="room-card"
                onClick={() => setSelectedRoom(roomId)}
                style={{ backgroundColor: getAqiColor(latestAqi) }}
              >
                <h3>Room {roomId}</h3>
                <div className="aqi-label">AQI</div>
                <div className="aqi-value">{latestAqi ?? "N/A"}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default App;
