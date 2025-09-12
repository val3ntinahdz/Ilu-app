import express, { json } from 'express';
import cors from 'cors';
import routes from './routes/index.js';
const app = express();

app.use(json());
app.use(express.json());

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'] 
}));

const PORT = process.env.PORT || 3000;

// Import all the routes from routes/index.js
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`ILÚ Backend running on port ${PORT}`);
});