import "./App.css";
import { DB_KEYS } from "./config";
import ErrorState from "./components/ErrorState";
import Header from "./Header";
import RoomDetail from "./RoomDetail";
import usePullToRefresh from "./usePullToRefresh";
import { useQueryParam } from "./useQueryParam";
import useSensorData from "./useSensorData";
import { getAqiColor } from "./utils";

function App() {
  const { dataByRoom, refetch, loading, error, statusMsg, realtimeStatus } =
    useSensorData();
  const [selectedRoom, setSelectedRoom] = useQueryParam("room");
  const { visible, fading } = usePullToRefresh(refetch);

  function renderContent() {
    if (selectedRoom) {
      return (
        <RoomDetail
          roomId={selectedRoom}
          item={dataByRoom[selectedRoom] ?? null}
          onBack={() => setSelectedRoom(null)}
        />
      );
    }

    switch (true) {
      case loading:
        return (
          <div className="card-grid">
            {Array.from({ length: 18 }, (_, i) => (
              <div key={i} className="room-card room-card-skeleton">
                <div className="skeleton-line skeleton-title" />
                <div className="skeleton-line skeleton-label" />
                <div className="skeleton-line skeleton-value" />
              </div>
            ))}
          </div>
        );
      case error:
        return <ErrorState onRetry={refetch} />;
      default:
        return (
          <div className="card-grid">
            {Object.entries(dataByRoom)
              .sort(([, a], [, b]) => {
                const aInactive = a?.[DB_KEYS.IN_ACTIVE] ? 1 : 0;
                const bInactive = b?.[DB_KEYS.IN_ACTIVE] ? 1 : 0;
                return aInactive - bInactive;
              })
              .map(([roomId, items]) => {
                const latestAqi = items?.[DB_KEYS.AQI] ?? null;
                return (
                  <div
                    key={roomId}
                    className="room-card"
                    onClick={() => setSelectedRoom(roomId)}
                    style={{
                      backgroundColor: getAqiColor(
                        latestAqi,
                        items?.[DB_KEYS.IN_ACTIVE],
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
        );
    }
  }

  return (
    <div className="app">
      {visible && (
        <div className={`pull-indicator${fading ? " fade-out" : ""}`}>
          ↓ Reload
        </div>
      )}
      <Header realtimeStatus={realtimeStatus} />
      {statusMsg && <div className="status-toast">{statusMsg}</div>}
      {renderContent()}
    </div>
  );
}

export default App;
