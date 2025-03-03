import { useCallback } from 'react';

const useCalculateTimeAgo = () => {
    const calculateTimeAgo = useCallback((dateString) => {
        const now = new Date();
        const pastDate = new Date(dateString);
        const differenceInMs = now - pastDate;

        const minutes = Math.floor(differenceInMs / 60000);
        const hours = Math.floor(differenceInMs / 3600000);
        const days = Math.floor(differenceInMs / 86400000);
        const months = Math.floor(differenceInMs / 2592000000);

        if (differenceInMs < 60000) {
            return 'Just now';
        } else if (minutes < 60) {
            return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
        } else if (hours < 24) {
            return `${hours} hour${hours === 1 ? '' : 's'} ago`;
        } else if (days < 30) {
            return `${days} day${days === 1 ? '' : 's'} ago`;
        } else {
            return `${months} month${months === 1 ? '' : 's'} ago`;
        }
    }, []);

    return calculateTimeAgo;
};

export default useCalculateTimeAgo;