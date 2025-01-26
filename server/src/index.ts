import express from 'express';
import cors from 'cors';
import accountRoutes from './routes/accountRoutes';
import bigQueryRoutes from './routes/bigQueryRoutes';
import invitationRoutes from './routes/invitationRoutes';

const app = express();

// Configure CORS with specific options
app.use(cors({
  origin: 'https://growth-manager-1-frontend.onrender.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Add a root test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.use('/api/accounts', accountRoutes);
app.use('/api/bigquery', bigQueryRoutes);
app.use('/api/invitations', invitationRoutes);

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 