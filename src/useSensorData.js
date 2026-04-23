import { useEffect, useState } from "react";
import { supabase } from "./supabase";

const MAX_POINTS = 1;

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
    in_active: row.in_active,
  };
}

export default function useSensorData() {
  const [dataByRoom, setDataByRoom] = useState({});
  const [refreshKey, setRefreshKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState(false);

  const refetch = () => setRefreshKey((prev) => !prev);

  useEffect(() => {
    let mounted = true;

    async function fetchInitial() {
      setLoading(true);
      const { data, error } = await supabase
        .from("sensor_data_one_row_latest")
        .select("*");

      if (error) {
        console.error("Fetch error:", error);
        setErr(true);
        setLoading(false);
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
        setLoading(false);
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
        },
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      });

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [refreshKey]);

  return { dataByRoom, refetch, loading, error };
}
