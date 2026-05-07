import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";
import { TABLES, DB_KEYS, REALTIME_CONFIG, FETCH_CONFIG } from "./config";

export default function useSensorData() {
  const [dataByRoom, setDataByRoom] = useState({});
  const [refreshKey, setRefreshKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [realtimeStatus, setRealtimeStatus] = useState("connecting"); // "connecting" | "connected" | "error"

  const channelRef = useRef(null);
  const realtimeRoomsRef = useRef(new Set());

  const refetch = () => {
    if (loading) return;
    setRefreshKey((prev) => !prev);
  };

  const retryRef = useRef(0);
  const MAX_RETRY = REALTIME_CONFIG.MAX_RETRY;
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
      .channel(REALTIME_CONFIG.CHANNEL_NAME)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: TABLES.ALL_DATA,
        },
        (payload) => {
          const row = withInactive(payload.new);

          setDataByRoom((prev) => {
            const room = row[DB_KEYS.ROOM_ID];
            realtimeRoomsRef.current.add(room);
            return {
              ...prev,
              [room]: row,
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
  const MAX_FETCH_RETRY = FETCH_CONFIG.MAX_RETRY;

  function withInactive(row) {
    const updateAt = new Date(row[DB_KEYS.UPDATED_AT]);
    const inactive =
      Date.now() - updateAt.getTime() > REALTIME_CONFIG.INACTIVE_THRESHOLD_MS;
    return { ...row, [DB_KEYS.IN_ACTIVE]: inactive };
  }

  useEffect(() => {
    let mounted = true;
    fetchRetryRef.current = 0;
    retryRef.current = 0;
    reconnectingRef.current = false;
    setRealtimeStatus("connecting");
    realtimeRoomsRef.current.clear();

    // start realtime immediately, parallel with fetch
    if (!channelRef.current) {
      channelRef.current = createChannel();
    }

    async function fetchInitial() {
      setErr(false);
      setLoading(true);
      const { data, error } = await supabase.from(TABLES.LIST_ONE).select("*");

      if (error) {
        if (fetchRetryRef.current < MAX_FETCH_RETRY) {
          fetchRetryRef.current += 1;
          if (mounted)
            setStatusMsg(
              `Fetch data failed, retrying attempt ${fetchRetryRef.current}/${MAX_FETCH_RETRY}.`,
            );
          setTimeout(() => {
            if (mounted) fetchInitial();
          }, FETCH_CONFIG.RETRY_DELAY_MS);
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
        const row = withInactive(item);
        const room = row[DB_KEYS.ROOM_ID];

        // skip if realtime already set this room
        if (realtimeRoomsRef.current.has(room)) continue;

        grouped[room] = row;
      }

      if (mounted) {
        setDataByRoom(grouped);
        setLoading(false);
        setStatusMsg(null);
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
