import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";

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
  const inflightRef = useRef(null);
  const refetch = () => setRefreshKey((prev) => !prev);

  useEffect(() => {
    let mounted = true;

    async function fetchInitial(retried = false) {
      if (inflightRef.current) return inflightRef.current;

      const promise = (async () => {
        setErr(false);
        setLoading(true);

        const { data, error } = await supabase
          .from("sensor_data_one_row_latest")
          .select("*");

        if (error) {
          console.error("Fetch error:", error);
          inflightRef.current = null;
          if (!retried) {
            setTimeout(() => {
              console.error("Retry fetch data after 2s");
              fetchInitial(true);
            }, 2000);
            return;
          }

          if (mounted) {
            setErr(true);
            setLoading(false);
          }
          return;
        }

        const grouped = {};

        for (const item of data || []) {
          const row = normalizeRow(item);
          const room = row.room_id;

          if (!grouped[room]) grouped[room] = [];
          grouped[room].push(row);
        }

        if (mounted) {
          setDataByRoom(grouped);
          setLoading(false);
        }
      })();

      inflightRef.current = promise;

      promise.finally(() => {
        inflightRef.current = null;
        if (mounted) {
          setLoading(false);
        }
      });

      return promise;
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
            return {
              ...prev,
              [room]: [row],
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
