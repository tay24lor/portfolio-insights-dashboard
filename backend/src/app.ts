import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import holdingsRoutes from './routes/holdings.routes';
import portfolioRoutes from './routes/portfolio.routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/holdings', holdingsRoutes);
app.use('/api/portfolio', portfolioRoutes);

app.use(errorMiddleware);

export default app;
