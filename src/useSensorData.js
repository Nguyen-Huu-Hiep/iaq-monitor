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

  const channelRef = useRef(null);

  const refetch = () => {
    if (loading) return;
    setRefreshKey((prev) => !prev);
  };

  const retryRef = useRef(0);
  const MAX_RETRY = 5;
  const reconnectingRef = useRef(false);

  function reconnectChannel() {
    if (reconnectingRef.current) return;
    if (retryRef.current >= MAX_RETRY) {
      console.warn("❌ Realtime reconnect stopped after 5 attempts");
      return;
    }
    reconnectingRef.current = true;
    retryRef.current += 1;
    console.log(`🔁 Reconnect attempt ${retryRef.current}/${MAX_RETRY}`);
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    setTimeout(() => {
      channelRef.current = createChannel();
      reconnectingRef.current = false;
    }, 2000);
  }

  function createChannel() {
    return supabase
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
        console.log("Channel status:", status);
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.log("Realtime → reconnect");
          reconnectChannel();
        }
      });
  }

  useEffect(() => {
    let mounted = true;

    async function fetchInitial(retried = false) {
      setErr(false);
      setLoading(true);
      const { data, error } = await supabase
        .from("sensor_data_one_row_latest")
        .select("*");

      if (error) {
        console.error("Fetch error:", error);
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
    }

    fetchInitial();

    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  useEffect(() => {
    channelRef.current = createChannel();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  return { dataByRoom, refetch, loading, error };
}
