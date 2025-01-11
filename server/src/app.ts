import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import accountRoutes from './routes/accountRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/accounts', accountRoutes);

// Error handling
app.use(errorHandler);

export default app; 