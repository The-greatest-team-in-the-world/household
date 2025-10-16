import { useEffect, useState } from "react";

export const useDebounce = <T>(value:T, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timeout);
    },[value, delay]);

    return debouncedValue;
}

/*
Så länge value fortsätter att ändras innan delay/timeout är uppnåd så kommer värdet inte att ändras. 
Det är först när tiden uppnåtts och inget nytt hänt, användare slutat skriva, som värdet sätts i debounceValue.
https://www.youtube.com/watch?v=gwIkg1acujU
*/