import {useState} from "react";
export default function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    const item = window.localStorage.getItem(key);
    if (item) {
      return Uint8Array.from(JSON.parse(item));
    } else {
      if (initialValue instanceof Function) {
        const initialValueResult = initialValue();
        window.localStorage.setItem(
          key,
          JSON.stringify(Array.from(initialValueResult))
        );
        return initialValueResult;
      } else {
        return initialValue;
      }
    }
  });
  const setValue = (value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(Array.from(valueToStore)));
  };
  return [storedValue, setValue];
}
