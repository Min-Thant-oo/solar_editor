"use client";
import { useEffect, useState } from "react";

// For hydration error. Server is returning one thing and client local storage is updating it.
const useMounted = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
};
export default useMounted;