import { useEffect, useRef, useState } from "react";
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
  const [allowEdit, setAllowEdit] = useState(false);
  const [key, setKey] = useState("");
  console.log("🚀 ~ App ~ key:", key);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!key) return;
    if (key.toLowerCase().includes("edit")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAllowEdit(true);
      setKey("");
    }
    if (key.toLowerCase().includes("reset")) {
      setAllowEdit(false);
      setKey("");
    }
  }, [key]);

  useEffect(() => {
    let buffer = "";

    const handleKeyDown = (event) => {
      const active = event.target;

      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active.isContentEditable
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "escape") {
        buffer = "";
        setAllowEdit(false);
        setKey("");
        return;
      }

      if (!/^[a-z]$/.test(key)) {
        return;
      }

      buffer += key;

      buffer = buffer.slice(-5);

      if (buffer === "eeeee") {
        setAllowEdit(true);
        buffer = "";
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
            {Array.from({ length: 8 }, (_, i) => (
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
                return (
                  <RoomCard
                    key={roomId}
                    roomId={roomId}
                    items={items}
                    setSelectedRoom={setSelectedRoom}
                    onSaveSuccess={refetch}
                    allowEdit={allowEdit}
                  />
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
      <Header
        realtimeStatus={realtimeStatus}
        onHiddenClick={() => inputRef.current?.focus()}
      />
      {statusMsg && <div className="status-toast">{statusMsg}</div>}
      {renderContent()}
      <input
        ref={inputRef}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        style={{
          opacity: 0,
          position: "fixed",
          width: 1,
          height: 1,
        }}
        value={key}
        onChange={(e) => setKey(e.target.value)}
      />
    </div>
  );
}

export default App;
