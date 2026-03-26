import { useCallback, useRef } from "react";

const useDebounce = (callback, delay) => {
    const timeoutRef = useRef(null);
  
    const debouncedFunction = useCallback((...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }, [callback, delay]);
  
    const cancel = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  
    return [debouncedFunction, cancel];
  }

  export default useDebounce