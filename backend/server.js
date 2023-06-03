import express, { urlencoded } from "express";
import dotenv from "dotenv";
dotenv.config();
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js";
const PORT = process.env.PORT || 5000;
import userRoutes from "./routes/userRoutes.js";

connectDB();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`server started on ${PORT}`));
