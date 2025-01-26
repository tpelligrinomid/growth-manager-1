import express from 'express';
import cors from 'cors';
import accountRoutes from './routes/accountRoutes';
import authRoutes from './routes/authRoutes';
import invitationRoutes from './routes/invitationRoutes';
import userRoutes from './routes/userRoutes';

const app = express();

// Configure CORS to allow requests from your frontend
app.use(cors({
  origin: 'https://growth-manager-1-frontend.onrender.com',
  credentials: true
}));
app.use(express.json());

// Add a test route
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'Server is running!' });
});

// Register routes
app.use('/api/accounts', accountRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/users', userRoutes);

// Add error logging middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Global error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

console.log('Server initialized');

export default app; 