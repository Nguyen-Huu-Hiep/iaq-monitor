import { useState, useEffect } from "react";

export function useQueryParam(key, defaultValue = null) {
  const [value, setValue] = useState(
    () => new URLSearchParams(window.location.search).get(key) ?? defaultValue
  );

  const set = (newValue) => {
    const params = new URLSearchParams(window.location.search);
    if (newValue == null) {
      params.delete(key);
    } else {
      params.set(key, newValue);
    }
    const search = params.toString();
    window.history.pushState(
      {},
      "",
      search ? `?${search}` : window.location.pathname
    );
    setValue(newValue);
  };

  useEffect(() => {
    const onPop = () => {
      setValue(
        new URLSearchParams(window.location.search).get(key) ?? defaultValue
      );
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [key]);

  return [value, set];
}
