import Express from 'express';
import UserRouter from './user.routes.js';
const router = Express.Router();


router.use('/users', UserRouter);

export default router;