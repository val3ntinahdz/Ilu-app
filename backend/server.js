import express, { json } from 'express';
import cors from 'cors';
const app = express();

app.use(json());
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173'  // the vite port
}));

const PORT = process.env.PORT || 3000;



// app.get('/api/saldo', (req, res) => {
//     res.json({ mensaje: "Los usuarios", usuarios})
// })


let users = [
    {
    id: 1,
    name: 'Miguel García',
    location: 'Los Angeles, CA',
    totalSent: 2400,
    avgSavingsRate: 4.2,
    transactions: []
  },
  {
    id: 2, 
    name: 'Dominga García',
    location: 'Santa María Tlahuitoltepec, Oaxaca',
    totalReceived: 2040,
    totalSaved: 384,
    currentBalance: 170,
    transactions: []
  }
]

// code to save the transactions made
let transactions = [];


app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: `ILÚ Backend running, ${users[0].id}` });
});

app.listen(PORT, () => {
  console.log(`ILÚ Backend running on port ${PORT}`);
});

// // Agrega esto antes de las otras rutas
// app.get('/', (req, res) => {
//     res.json({ 
//         message: "Bienvenido a la API",
//         endpoints: {
//             saldo: "/api/saldo",
//             usuarios: "/api/saldo"
//         }
//     });
// });

// app.listen(3000, () => {
//     console.log("Running port 3000")
// })