import { useEffect, useState } from "react";
import { supabase } from "./supabase";

const MAX_POINTS = 30;

function normalizeRow(row) {
  return {
    id: row.id,
    room_id: row.room_id,
    temperature: row.temperature,
    humidity: row.humidity,
    pm25: row.pm25,
    co: row.co,
    aqi: row.aqi,
    status: row.status,
    created_at: row.created_at,
  };
}

export default function useSensorData() {
  const [dataByRoom, setDataByRoom] = useState({});

  useEffect(() => {
    let mounted = true;

    async function fetchInitial() {
      const { data, error } = await supabase
        .from("sensor_data")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch error:", error);
        return;
      }

      const grouped = {};

      for (const item of data) {
        const row = normalizeRow(item);
        const room = row.room_id;

        if (!grouped[room]) grouped[room] = [];

        if (grouped[room].length < MAX_POINTS) {
          grouped[room].push(row);
        }
      }

      if (mounted) {
        setDataByRoom(grouped);
      }
    }

    fetchInitial();

    const channel = supabase
      .channel("sensor_data_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sensor_data",
        },
        (payload) => {
          const row = normalizeRow(payload.new);

          setDataByRoom((prev) => {
            const room = row.room_id;
            const current = prev[room] ?? [];

            return {
              ...prev,
              [room]: [row, ...current].slice(0, MAX_POINTS),
            };
          });
        }
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      });

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return dataByRoom;
}
