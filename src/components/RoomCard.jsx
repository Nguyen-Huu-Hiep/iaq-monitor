import React, { useState } from "react";
import { DB_KEYS, TABLES } from "../config";
import "../App.css";
import { getApiStatusIcon, getAqiColor } from "../utils";
import Modal from "./Modal";
import { supabase } from "../supabase";

const RoomCard = ({ roomId, items, setSelectedRoom, onSaveSuccess }) => {
  const latestAqi = items?.[DB_KEYS.AQI] ?? null;
  const color = getAqiColor(latestAqi, items?.[DB_KEYS.IN_ACTIVE]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [roomNameDraft, setRoomNameDraft] = useState(items?.roomName ?? "");

  const handleOpenEdit = (event) => {
    event.stopPropagation();
    setRoomNameDraft(items?.roomName ?? "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!roomNameDraft.trim()) {
      setError("Room name cannot be empty");
      return;
    }
    setError(null);
    await supabase.from(TABLES.LIST_NAME_MAPPING).upsert(
      {
        room_id: roomId,
        name: roomNameDraft,
      },
      {
        onConflict: "room_id",
      },
    );
    setIsEditing(false);
    onSaveSuccess?.();
  };

  return (
    <div className="room-card" onClick={() => setSelectedRoom(roomId)}>
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
            {items?.roomName || "Unknown Room"}
          </span>
        </div>
        <div>
          <button
            type="button"
            className="edit-button"
            onClick={handleOpenEdit}
          >
            ✏️
          </button>
        </div>
      </div>
      <div className="room-card-body">
        <div
          className="room-card-value"
          style={{
            color: color ?? "#444",
          }}
        >
          {latestAqi ?? "N/A"}
          {getApiStatusIcon(latestAqi, items?.[DB_KEYS.IN_ACTIVE])}
        </div>
        <div className="room-card-status">AQI</div>
      </div>

      <Modal
        visible={isEditing}
        title="Edit room name"
        onCancel={() => setIsEditing(false)}
        onOk={handleSave}
        okText="Save"
        cancelText="Cancel"
      >
        <div className="modal-form-row">
          <label htmlFor={`room-name-${roomId}`}>Room name</label>
          <input
            id={`room-name-${roomId}`}
            value={roomNameDraft}
            onChange={(event) => {
              setRoomNameDraft(event.target.value);
              setError(null);
            }}
            className="modal-input"
            autoFocus
            onFocus={(e) => e.target.select()}
          />
          {error && <div className="modal-error">{error}</div>}
        </div>
      </Modal>
    </div>
  );
};

export default RoomCard;
