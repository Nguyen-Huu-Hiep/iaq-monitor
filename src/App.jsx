import "./App.css";
import useSensorData from "./useSensorData";
import { getAqiColor } from "./utils";
import RoomDetail from "./RoomDetail";
import { useQueryParam } from "./useQueryParam";
import Header from "./Header";

function App() {
  const dataByRoom = useSensorData();
  const [selectedRoom, setSelectedRoom] = useQueryParam("room");

  if (selectedRoom) {
    return (
      <RoomDetail
        roomId={selectedRoom}
        items={dataByRoom[selectedRoom]}
        onBack={() => setSelectedRoom(null)}
      />
    );
  }

  return (
    <div className="app">
      <Header />
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
              <div className="aqi-value">{latestAqi ?? "N/A"}</div>
              <div className="aqi-label">AQI</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
