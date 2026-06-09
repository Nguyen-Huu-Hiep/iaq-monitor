import { useEffect, useMemo, useState } from "react";
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
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "dark";
    }
    return window.localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const [selectedRoom, setSelectedRoom] = useQueryParam("room");

  const { visible, fading } = usePullToRefresh(refetch);

  const sortedRooms = useMemo(() => {
    return Object.entries(dataByRoom).sort(([roomIdA, a], [roomIdB, b]) => {
      const aInactive = a?.[DB_KEYS.IN_ACTIVE] ? 1 : 0;
      const bInactive = b?.[DB_KEYS.IN_ACTIVE] ? 1 : 0;

      if (aInactive !== bInactive) {
        return aInactive - bInactive;
      }

      const aZero = roomIdA === "0" ? 1 : 0;
      const bZero = roomIdB === "0" ? 1 : 0;

      return aZero - bZero;
    });
  }, [dataByRoom]);

  return (
    <div className="app">
      {visible && (
        <div className={`pull-indicator${fading ? " fade-out" : ""}`}>
          ↓ Reload
        </div>
      )}

      {statusMsg && <div className="status-toast">{statusMsg}</div>}

      {/* DASHBOARD */}
      <div
        style={{
          display: selectedRoom ? "none" : "block",
        }}
      >
        <Header
          realtimeStatus={realtimeStatus}
          theme={theme}
          onToggleTheme={() =>
            setTheme((current) => (current === "dark" ? "light" : "dark"))
          }
        />

        {loading && (
          <div className="card-grid">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="room-card room-card-skeleton">
                <div className="skeleton-line skeleton-title" />
                <div className="skeleton-line skeleton-label" />
                <div className="skeleton-line skeleton-value" />
              </div>
            ))}
          </div>
        )}

        {error && !loading && <ErrorState onRetry={refetch} />}

        {!loading && !error && (
          <div className="card-grid">
            {sortedRooms.map(([roomId, items]) => {
              return (
                <RoomCard
                  key={roomId}
                  roomId={roomId}
                  items={items}
                  onSaveSuccess={refetch}
                  setSelectedRoom={(id) => {
                    requestAnimationFrame(() => {
                      requestAnimationFrame(() => {
                        setSelectedRoom(id);
                      });
                    });
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* DETAIL */}
      <div
        style={{
          display: selectedRoom ? "block" : "none",
        }}
      >
        {selectedRoom && (
          <RoomDetail
            key={selectedRoom}
            roomId={selectedRoom}
            item={dataByRoom[selectedRoom] ?? null}
            realtimeStatus={realtimeStatus}
            onBack={() => setSelectedRoom(null)}
            theme={theme}
            onToggleTheme={() =>
              setTheme((current) => (current === "dark" ? "light" : "dark"))
            }
          />
        )}
      </div>
    </div>
  );
}

export default App;
