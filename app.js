import Express from 'express';
import cors from 'cors';
import { CORS_ORIGIN } from './constants.js';
import router from './routes/index.js';

const app = Express();

app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true,
}));

// server only accepts json of 16kb size
app.use(Express.json({ limit: "16kb" }));

app.use(Express.urlencoded({ extended: true, limit: "16kb" }));
app.use(Express.static("public"));

// routes
app.use('/api/v1', router);


export { app };