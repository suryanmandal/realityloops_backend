import express from 'express';
import type { Request, Response, Application } from 'express';
import dotenv from 'dotenv';

dotenv.config({
    quiet: true,
});

const app: Application = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({
        status: 'success',
        message: 'Server is running',
    });
});

app.listen(PORT, () => {
    console.log(`> ✅ Server is running at http://localhost:${PORT}`);
});