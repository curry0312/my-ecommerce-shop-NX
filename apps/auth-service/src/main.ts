import express from 'express';
import cors from 'cors';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import cookie from 'cookie-parser';
import swaggerUi from "swagger-ui-express";
const swaggerDocument = require("./swagger-output.json");
import { authRouter } from './routes/auth.router';

const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const app = express();

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

app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/docs-json", (req, res) => {
    res.send(swaggerDocument);
})

app.use("/api", authRouter);

app.use(errorMiddleware)

const server = app.listen(port, () => {
    console.log(`Auth service is running at http://localhost:${port}`);
    console.log(`Swagger docs at http://localhost:${port}/doc`);
});

server.on('error', (err)=>{
    console.log('Server error in Auth service',err);
});