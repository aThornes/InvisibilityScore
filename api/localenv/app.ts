import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import defineRoutes from "./router";

dotenv.config();

const port = 8080;

const options: cors.CorsOptions = {
  origin: `http://localhost:${port}`,
  optionsSuccessStatus: 200,
};

const runServer = () => {
  /* Instantiate express application */
  const app = express();

  /* Set up CORS */
  app.use(cors(options));

  /* Use JSON middleware - tells express to expect JSON body in requests */
  app.use(express.json());

  defineRoutes(app);

  /* Open listener in order to recieve requests */
  const server = app.listen(port, () => {
    console.log("Server started, listening on port", port);
  });

  /* Handle unexpected shutdown to ensure listener doesn't remain open */
  process.on("SIGTERM", () => {
    console.log("Shutting down server");
    server.close();
  });
};

runServer();
