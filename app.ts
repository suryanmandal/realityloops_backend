import express from 'express';
import type { Request, Response, Application } from 'express';
import { config } from 'dotenv';
import morgan from 'morgan';
import apiRouter from './routes';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';
import cors from 'cors';
import path from 'path';

config({
    quiet: true,
});

const app: Application = express();

// Disable ETags globally to ensure responses are always sent with status 200 rather than 304
app.set('etag', false);

// Morgan HTTP request logger
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    // Custom morgan format for production
    app.use(morgan('combined', {
        stream: {
            write: (message: string) => logger.http(message.trim())
        }
    }));
}

// CORS middleware
app.use(cors({
    origin: '*',
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public folder (for uploaded 3D models)
app.use('/uploads', express.static(path.join(process.cwd() + '/uploads')));

// Health check route
app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({
        status: 'success',
        message: 'Reality Loops API Server is running',
        timestamp: new Date().toISOString(),
    });
});

// API routes
app.use('/api/v1', apiRouter);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
