import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import config from './config';
import errorHandler from './middlewares/error-handler';
import { default as authRoutes } from './routes/auth.routes';
import { default as workflowRoutes } from './routes/workflow.routes';

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
app.use('/api/v1/workflow', workflowRoutes);

// global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

app.listen(config.PORT, () => {
  console.log(`Server is running on port ${config.PORT}`);
});

export default app;
