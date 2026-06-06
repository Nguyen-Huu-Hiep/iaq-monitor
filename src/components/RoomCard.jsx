import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { DB_KEYS, TABLES } from "../config";
import "../App.css";
import { getApiStatusIcon, getAqiColor } from "../utils";
import Modal from "./Modal";
import { supabase } from "../supabase";

const RoomCard = ({
  roomId,
  items,
  setSelectedRoom,
  onSaveSuccess,
  allowEdit,
}) => {
  const latestAqi = items?.[DB_KEYS.AQI] ?? null;
  const color = getAqiColor(latestAqi, items?.[DB_KEYS.IN_ACTIVE]);

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
            {items?.status || `Phòng ${roomId}`}
          </span>
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
          <FontAwesomeIcon
            icon={getApiStatusIcon(latestAqi, items?.[DB_KEYS.IN_ACTIVE])}
          />
          {}
        </div>
        <div className="room-card-status">AQI</div>
      </div>
    </div>
  );
};

export default RoomCard;
