import express from "express";
import wanderlog from './routes/wanderlog.js';
import cors from "cors";
import dotenv from "dotenv";

const app = express();
const PORT = 3000;

dotenv.config();

// CORS setup
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use existing route files
app.use("/api/wanderlogs", wanderlog);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
