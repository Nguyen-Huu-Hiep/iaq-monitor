import "./App.css";
import Header from "./Header";
import RoomDetail from "./RoomDetail";
import usePullToRefresh from "./usePullToRefresh";
import { useQueryParam } from "./useQueryParam";
import useSensorData from "./useSensorData";
import { getAqiColor } from "./utils";

function App() {
  const { dataByRoom, refetch, loading } = useSensorData();
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
          items={dataByRoom[selectedRoom] ?? []}
          onBack={() => setSelectedRoom(null)}
        />
      ) : loading ? (
        <div className="card-grid">
          {Array.from({ length: 18 }, (_, i) => (
            <div key={i} className="room-card room-card-skeleton">
              <div className="skeleton-line skeleton-title" />
              <div className="skeleton-line skeleton-label" />
              <div className="skeleton-line skeleton-value" />
            </div>
          ))}
        </div>
      ) : (
        <div className="card-grid">
          {Object.entries(dataByRoom)
            .sort(([, a], [, b]) => {
              const aInactive = a[0]?.in_active ? 1 : 0;
              const bInactive = b[0]?.in_active ? 1 : 0;
              return aInactive - bInactive;
            })
            .map(([roomId, items]) => {
              const latestAqi = items[0]?.aqi ?? null;
              return (
                <div
                  key={roomId}
                  className="room-card"
                  onClick={() => setSelectedRoom(roomId)}
                  style={{
                    backgroundColor: getAqiColor(
                      latestAqi,
                      items[0]?.in_active,
                    ),
                  }}
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
