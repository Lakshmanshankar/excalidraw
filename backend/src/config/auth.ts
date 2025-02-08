import Google from '@auth/core/providers/google';
import type { Session } from '@auth/core/types';
import { getUserByEmailFn, createUserWithObjectStore } from '~/controllers/users';
import type { SelectUser } from '~/drizzle/schema';

export const authConfig = {
    trustHost: true,
    providers: [Google],
    callbacks: {
        async redirect() {
            return 'http://localhost:5173';
        },

        async session({ session }: { session: Session }) {
            try {
                const userData: SelectUser[] = await getUserByEmailFn(session?.user?.email || '');
                const sessionUser = session?.user;
                if (
                    !userData.length &&
                    sessionUser?.email &&
                    sessionUser?.name &&
                    sessionUser?.image
                ) {
                    try {
                        const res = await createUserWithObjectStore({
                            email: sessionUser?.email,
                            name: sessionUser?.name,
                            image: sessionUser?.image,
                        });
                        userData[0] = res as SelectUser;
                    } catch (error) {
                        console.log(error);
                    }
                }

                session.user = {
                    ...session.user,
                    ...userData[0],
                };
                return session;
            } catch (error) {
                console.error('Error in generating session callback:', error);
                return session;
            }
        },
    },
};
