// hooks/useOnBackButton.ts
import { useEffect } from 'react';

export const useOnBackButton = (callback: () => void) => {
    useEffect(() => {
        const handlePopState = () => {
            callback();
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [callback]);
};