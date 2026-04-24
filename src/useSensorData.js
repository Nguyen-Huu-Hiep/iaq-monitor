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
  const [statusMsg, setStatusMsg] = useState(null);
  const [realtimeStatus, setRealtimeStatus] = useState("connecting"); // "connecting" | "connected" | "error"

  const channelRef = useRef(null);

  const refetch = () => {
    if (loading) return;
    setRefreshKey((prev) => !prev);
  };

  const retryRef = useRef(0);
  const MAX_RETRY = 3;
  const reconnectingRef = useRef(false);

  function reconnectChannel() {
    if (reconnectingRef.current) return;
    if (retryRef.current >= MAX_RETRY) {
      setStatusMsg("Realtime failed!. Please reload the page.");
      setRealtimeStatus("error");
      return;
    }
    reconnectingRef.current = true;
    retryRef.current += 1;
    setRealtimeStatus("connecting");
    setStatusMsg(
      `Realtime failed, reconnecting attempt ${retryRef.current}/${MAX_RETRY}.`,
    );
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    setTimeout(
      () => {
        channelRef.current = createChannel();
        reconnectingRef.current = false;
      },
      (retryRef.current + 1) * 1000,
    );
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
        if (status === "SUBSCRIBED") {
          setRealtimeStatus("connected");
          retryRef.current = 0;
          setStatusMsg(null);
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setRealtimeStatus("connecting");
          reconnectChannel();
        }
      });
  }

  const fetchRetryRef = useRef(0);
  const MAX_FETCH_RETRY = 3;

  useEffect(() => {
    let mounted = true;
    fetchRetryRef.current = 0;

    async function fetchInitial() {
      setErr(false);
      setLoading(true);
      const { data, error } = await supabase
        .from("sensor_data_one_row_latest")
        .select("*");

      if (error) {
        if (fetchRetryRef.current < MAX_FETCH_RETRY) {
          fetchRetryRef.current += 1;
          if (mounted)
            setStatusMsg(
              `Fetch data failed, retrying attempt ${fetchRetryRef.current}/${MAX_FETCH_RETRY}.`,
            );
          setTimeout(() => {
            if (mounted) fetchInitial();
          }, 2000);
          return;
        }

        if (mounted) {
          setStatusMsg(null);
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
        setStatusMsg(null);
        // start realtime after fetch completes
        if (!channelRef.current) {
          channelRef.current = createChannel();
        }
      }
    }

    fetchInitial();

    return () => {
      mounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [refreshKey]);

  return { dataByRoom, refetch, loading, error, statusMsg, realtimeStatus };
}
