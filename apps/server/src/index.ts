import express, { Application, NextFunction, Request, Response } from 'express';
import config from './config';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import errorHandler from './middlewares/error-handler';
import cookieParser from 'cookie-parser';

const app: Application = express();

// middlewares
app.use(express.json());
app.use(
  cors({
    origin: [config.APP_URL],
    credentials: true,
  }),
);
app.use(cookieParser());

// test route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// routes
app.use('/api/v1/auth', authRoutes);

// global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

app.listen(config.PORT, () => {
  console.log(`Server is running on port ${config.PORT}`);
});

export default app;
