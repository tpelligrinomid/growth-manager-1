import express from 'express';
import cors from 'cors';
import accountRoutes from './routes/accountRoutes';
import bigQueryRoutes from './routes/bigQueryRoutes';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/accounts', accountRoutes);
app.use('/api/bigquery', bigQueryRoutes);

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 