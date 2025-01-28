import { useEffect, useState } from "react";

const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  // Define a state to track whether the component is mounted (client-side)
  const [isMounted, setIsMounted] = useState(false);

  const [storedValue, setStoredValue] = useState<T>(() => {
    // Check if window is defined (i.e., we're on the client-side)
    if (typeof window !== "undefined") {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    }
    return initialValue; // Return initialValue if on server-side
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    }
  };

  useEffect(() => {
    setIsMounted(true); // Set to true once the component has mounted on the client

    if (typeof window !== "undefined") {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    }
  }, [key]);

  // Ensure that localStorage access happens only after the component is mounted
  if (!isMounted) {
    return [initialValue, setValue]; // Prevent rendering issues during SSR
  }

  return [storedValue, setValue];
};

export default useLocalStorage;
