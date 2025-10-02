import express from 'express';
import type { Request, Response, Application } from 'express';
import { config } from 'dotenv';
import apiRouter from './routes';

config({
    quiet: true,
});

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', apiRouter);

app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({
        status: 'success',
        message: 'Server is running',
    });
});

export default app;