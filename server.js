import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import encryptRouter from "./routes/encrypt.js";
import decryptRouter from "./routes/decrypt.js";
import secureRouter from "./routes/secure.js";
import aesRouter from "./routes/aes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();

// CORS - allow all origins for development
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    credentials: false
}));

app.use(express.json({ limit: "200kb" }));

app.use("/api/encrypt", encryptRouter);
app.use("/api/decrypt", decryptRouter);
app.use("/api/secure", secureRouter);
app.use("/api/aes", aesRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Nexus Encryptor backend running on port ${PORT}`);
});
