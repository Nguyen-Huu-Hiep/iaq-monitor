import "./App.css";
import ErrorState from "./components/ErrorState";
import RoomCard from "./components/RoomCard";
import { DB_KEYS } from "./config";
import Header from "./Header";
import RoomDetail from "./RoomDetail";
import usePullToRefresh from "./usePullToRefresh";
import { useQueryParam } from "./useQueryParam";
import useSensorData from "./useSensorData";

function App() {
  const { dataByRoom, refetch, loading, error, statusMsg, realtimeStatus } =
    useSensorData();
  const [selectedRoom, setSelectedRoom] = useQueryParam("room");
  const { visible, fading } = usePullToRefresh(refetch);

  function renderContent() {
    if (selectedRoom) {
      return (
        <RoomDetail
          key={selectedRoom}
          roomId={selectedRoom}
          item={dataByRoom[selectedRoom] ?? null}
          onBack={() => setSelectedRoom(null)}
        />
      );
    }

    switch (true) {
      case loading:
        return (
          <>
            <Header realtimeStatus={realtimeStatus} />
            <div className="card-grid">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="room-card room-card-skeleton">
                  <div className="skeleton-line skeleton-title" />
                  <div className="skeleton-line skeleton-label" />
                  <div className="skeleton-line skeleton-value" />
                </div>
              ))}
            </div>
          </>
        );
      case error:
        return (
          <>
            <Header realtimeStatus={realtimeStatus} />
            <ErrorState onRetry={refetch} />
          </>
        );
      default:
        return (
          <>
            <Header realtimeStatus={realtimeStatus} />
            <div className="card-grid">
              {Object.entries(dataByRoom)
                .sort(([roomIdA, a], [roomIdB, b]) => {
                  const aInactive = a?.[DB_KEYS.IN_ACTIVE] ? 1 : 0;
                  const bInactive = b?.[DB_KEYS.IN_ACTIVE] ? 1 : 0;
                  if (aInactive !== bInactive) return aInactive - bInactive;
                  const aZero = roomIdA === "0" ? 1 : 0;
                  const bZero = roomIdB === "0" ? 1 : 0;
                  return aZero - bZero;
                })
                .map(([roomId, items]) => {
                  return (
                    <RoomCard
                      key={roomId}
                      roomId={roomId}
                      items={items}
                      setSelectedRoom={setSelectedRoom}
                      onSaveSuccess={refetch}
                    />
                  );
                })}
            </div>
          </>
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
      {statusMsg && <div className="status-toast">{statusMsg}</div>}
      {renderContent()}
    </div>
  );
}

export default App;
