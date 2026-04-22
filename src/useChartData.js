import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";

const MAX_POINTS_24H = 96;
const MAX_POINTS_1H = 60;
const CACHE_TTL_MS = 5 * 60 * 1000;

const cache = new Map();
// Lưu promise đang chạy để tránh fetch trùng khi mount lại giữa chừng
const inflight = new Map();

function getCacheKey(roomId, hours) {
  return `${roomId}-${hours}`;
}

function fetchSlots(roomId, hours, maxPoints) {
  const key = getCacheKey(roomId, hours);

  // Nếu đã có promise đang chạy cho key này, dùng lại
  if (inflight.has(key)) return inflight.get(key);

  const slotMs = (hours * 60 * 60 * 1000) / maxPoints;
  const queries = Array.from({ length: maxPoints }, (_, i) => {
    const slotEnd = new Date(Date.now() - i * slotMs).toISOString();
    const slotStart = new Date(Date.now() - (i + 1) * slotMs).toISOString();
    return supabase
      .from("sensor_data")
      .select("*")
      .eq("room_id", roomId)
      .gte("created_at", slotStart)
      .lt("created_at", slotEnd)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
  });

  const promise = Promise.all(queries)
    .then((results) =>
      results
        .map((r) => r.data)
        .filter(Boolean)
        .reverse(),
    )
    .finally(() => inflight.delete(key)); // Xóa khỏi inflight khi xong

  inflight.set(key, promise);
  return promise;
}

export default function useChartData({ roomId, hours, inActive, ready }) {
  const MAX_POINTS = hours === 1 ? MAX_POINTS_1H : MAX_POINTS_24H;
  const slotMsRef = useRef((hours * 60 * 60 * 1000) / MAX_POINTS);

  const [data, setData] = useState(
    () => cache.get(getCacheKey(roomId, hours))?.data ?? [],
  );
  const [loading, setLoading] = useState(() => {
    const hit = cache.get(getCacheKey(roomId, hours));
    return !(hit && Date.now() - hit.timestamp < CACHE_TTL_MS);
  });
  const [refetchTrigger, setRefetchTrigger] = useState(false);

  const refetch = () => {
    cache.delete(getCacheKey(roomId, hours));
    inflight.delete(getCacheKey(roomId, hours));
    setRefetchTrigger((prev) => !prev);
  };

  useEffect(() => {
    if (!roomId || !ready || inActive) return;

    const key = getCacheKey(roomId, hours);
    const hit = cache.get(key);
    const fresh = hit && Date.now() - hit.timestamp < CACHE_TTL_MS;

    if (fresh) {
      setData(hit.data);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    slotMsRef.current = (hours * 60 * 60 * 1000) / MAX_POINTS;

    fetchSlots(roomId, hours, MAX_POINTS).then((result) => {
      cache.set(key, { data: result, timestamp: Date.now() });
      if (mounted) {
        setData(result);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [roomId, hours, inActive, ready, refetchTrigger]);

  return { data, loading, refetch };
}
