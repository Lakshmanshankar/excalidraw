import { useQuery } from '@tanstack/react-query';
import { SERVER_URL } from '../consts';
import { KEY } from './ReactQuery';

interface Session {
    user: {
        id: string;
        name: string;
        email: string;
        image: string;
        created_at: string;
    };
    expires: string;
}

export const useAuthUser = () => {
    return useQuery<Session>({
        queryKey: [KEY.AUTH_USER],
        queryFn: async () => {
            const res = await fetch(`${SERVER_URL}/api/auth/session`, {
                credentials: 'include',
            });
            if (!res.ok) {
                throw new Error('Failed to fetch auth session');
            }
            return res.json();
        },
    });
};
