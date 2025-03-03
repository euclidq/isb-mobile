import { useCallback } from 'react';

const useFormatShortDateTime = () => {
    const formatShortDateTime = useCallback((dateString) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true };
        const date = new Date(dateString);
        return date.toLocaleString('en-US', options).replace(',', '');
    }, []);

    return formatShortDateTime;
};

export default useFormatShortDateTime;