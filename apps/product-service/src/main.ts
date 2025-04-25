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
import productRouter from './routes/product.router';

const port = process.env.PORT ? Number(process.env.PORT) : 6002;

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

app.get("/", (req, res) => {
    res.send("Product service is running");
})

// // Swagger
app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs-json", (req, res) => {
    res.send(swaggerDocument);
})

// Routers
app.use("/api", productRouter);

// Error Middleware
app.use(errorMiddleware)

const server = app.listen(port, () => {
    console.log(`Product service is running at http://localhost:${port}`);
    console.log(`Swagger docs at http://localhost:${port}/api-doc`);
});

server.on('error', (err)=>{
    console.log('Server error in Auth service',err);
});