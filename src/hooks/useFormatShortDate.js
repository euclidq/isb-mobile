import { useCallback } from 'react';

const useFormatShortDate = () => {
    const formatShortDate = useCallback((dateString) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', options);
    }, []);

    return formatShortDate;
};

export default useFormatShortDate;
