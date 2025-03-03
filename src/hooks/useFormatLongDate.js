import { useCallback } from 'react';

const useFormatLongDate = () => {
    const formatLongDate = useCallback((dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }, []);

    return formatLongDate;
};

export default useFormatLongDate;