import { useEffect, useState } from "react";
import { supabase } from "./supabase";

const MAX_POINTS_24H = 72;
const MAX_POINTS_1H = 60;

export default function useChartData({ roomId, hours, inActive, ready }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(false);
  const MAX_POINTS = hours === 1 ? MAX_POINTS_1H : MAX_POINTS_24H;

  const refetch = () => setRefetchTrigger((prev) => !prev);

  useEffect(() => {
    if (!roomId || !ready || inActive) return;

    let mounted = true;
    setLoading(true);

    async function fetchData() {
      const slotMs = (hours * 60 * 60 * 1000) / MAX_POINTS;

      const queries = Array.from({ length: MAX_POINTS }, (_, i) => {
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

      const results = await Promise.all(queries);

      if (!mounted) return;

      // Reverse để chronological order (slot 59 = oldest, slot 0 = newest)
      const result = results
        .map((r) => r.data)
        .filter(Boolean)
        .reverse();

      setData(result);
      setLoading(false);
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [roomId, hours, inActive, ready, refetchTrigger]);

  return { data, loading, refetch };
}
