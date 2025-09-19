import express, { json } from 'express';
import cors from 'cors';
import routes from './routes/index.js';
const app = express();

app.use(json());
app.use(express.json());

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'] 
}));

const PORT = 3000;

// Import all the routes from routes/index.js
app.use('/api', routes);

// app.get('/callback', (req, res) => {
//   const { interact_ref } = req.query;
  
//   console.log('Payment authorization callback received');
//   console.log('Interact ref:', interact_ref);
  
//   res.send(`
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <title>Payment Authorized</title>
//       <style>
//         body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
//         .success { color: green; }
//       </style>
//     </head>
//     <body>
//       <h1 class="success">Payment Authorized!</h1>
//       <p>Miguel has successfully authorized the remittance.</p>
//       <p><strong>Reference:</strong> ${interact_ref}</p>
//       <p>You can close this window.</p>
//       <script>
//         setTimeout(() => window.close(), 3000);
//       </script>
//     </body>
//     </html>
//   `);
// });


app.get('/', (req, res) => {
  res.send('ILÚ Backend is running');
});

app.listen(PORT, () => {
  console.log(`ILÚ Backend running on port ${PORT}`);
});