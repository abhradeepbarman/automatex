import config from '@repo/server-common/config';
import { errorHandler } from '@repo/server-common/middlewares';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import { connectionRoutes as oauthRoutes } from './routes';
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
  res.send('Hello, World! from credentials service');
});

// routes
app.use('/api/v1/oauth', oauthRoutes);

// global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

app.listen(config.PORT, () => {
  console.log(`Server is running on port ${config.PORT}`);
});

export default app;
