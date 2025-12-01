import { Router } from 'express';
import usersRouter from './users';
import votesRouter from './votes';
import lookupRouter from './lookup';
import notificationsRouter from './notifications';
import adminRouter from './admin';

const api = Router();

api.use('/users', usersRouter);
api.use('/votes', votesRouter);
api.use('/lookup', lookupRouter);
api.use('/notifications', notificationsRouter);
api.use('/admin', adminRouter);

export default api;
