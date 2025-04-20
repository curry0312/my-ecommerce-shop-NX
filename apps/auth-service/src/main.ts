import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import cookie from 'cookie-parser';

// Middleware
import { errorMiddleware } from '@packages/error-handler/error-middleware';

// Swagger
import swaggerUi from "swagger-ui-express";
const swaggerDocument = require("./swagger-output.json");

// Routers
import { authRouter } from './routes/auth.router';

const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const app = express();

//Common Middleware
app.use(
    cors({
      origin: ["http://localhost:3000"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookie());
app.use(cookieParser());

// Swagger
app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs-json", (req, res) => {
    res.send(swaggerDocument);
})

// Routers
app.use("/api", authRouter);

// Error Middleware
app.use(errorMiddleware)

const server = app.listen(port, () => {
    console.log(`Auth service is running at http://localhost:${port}`);
    console.log(`Swagger docs at http://localhost:${port}/api-doc`);
});

server.on('error', (err)=>{
    console.log('Server error in Auth service',err);
});