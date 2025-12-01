import { Router } from 'express';
import usersRouter from './users';
import votesRouter from './votes';
import lookupRouter from './lookup';

const api = Router();

api.use('/users', usersRouter);
api.use('/votes', votesRouter);
api.use('/lookup', lookupRouter);

export default api;
