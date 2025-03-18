import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ExpressAuth } from '@auth/express';
import userRoutes from '~/routes/userRoutes';
import fileRoutes from '~/routes/fileRoutes';
import { authConfig } from '~/config/auth';
import { authMiddleware, currentSession } from '~/config/auth.middleware';

dotenv.config();
const app = express();

app.set('trust proxy', true);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    cors({
        origin: 'http://localhost:3001',
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
        methods: ['GET', 'POST'],
    }),
);

//Set up ExpressAuth to handle authentication
// IMPORTANT: It is highly encouraged set up rate limiting on this route
app.use('/api/auth/*', ExpressAuth(authConfig));
app.use('/api/user_session',currentSession)
app.use('/api/v1', authMiddleware);
app.use('/api/v1/file', fileRoutes);
app.use('/api', userRoutes);

// Now in your route
app.get('/', (req, res) => {
    const { session } = res.locals;
    res.json({ status: 'express is running', user: session?.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
