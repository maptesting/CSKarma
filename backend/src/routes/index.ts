import { Router } from 'express';
import usersRouter from './users';
import votesRouter from './votes';
import lookupRouter from './lookup';
import notificationsRouter from './notifications';
import adminRouter from './admin';
import leaderboardsRouter from './leaderboards';

const api = Router();

api.use('/users', usersRouter);
api.use('/votes', votesRouter);
api.use('/lookup', lookupRouter);
api.use('/notifications', notificationsRouter);
api.use('/admin', adminRouter);
api.use('/leaderboards', leaderboardsRouter);

export default api;
