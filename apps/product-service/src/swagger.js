import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Product Service API",
    description: "Product Service",
  },
  host: "localhost:6002",
  schemes: ["http"],
  basePath: "/api",
};


const outputFile = "./swagger-output.json";
const endpointsFiles = ["./routes/product.router.ts"];

swaggerAutogen()(outputFile, endpointsFiles, doc);
