import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import config from "./2-utils/config";
import catchAll from "./3-middleware/catch-all";
import { RouteNotFoundError } from "./4-models/error-models";
import controller from "./6-controllers/controllers";
import preventGarbage from "./3-middleware/prevent-garbage";
import authController from "./6-controllers/auth-controller";
import socketLogic from "./5-logic/socket-logic";
import path from "path";

// Create server:
const expressServer = express();

// Middleware to run before controllers:
expressServer.use(preventGarbage);

if (config.isDevelopment) expressServer.use(cors());

// Tell express to extract json object from request body into request.body variable:
expressServer.use(express.json());
expressServer.use(express.urlencoded({ extended: false }));

// Transfer requests to the controller:
expressServer.use("/api", authController);
expressServer.use("/api", controller);
expressServer.use(
  "/images",
  express.static(path.join(__dirname, "1-assets/images"))
);

expressServer.use(
  "*",
  (request: Request, response: Response, next: NextFunction) => {
    next(new RouteNotFoundError(request.method, request.originalUrl));
  }
);

expressServer.use(catchAll);

const httpServer = expressServer.listen(config.port, () =>
  console.log("Listening...")
);

socketLogic.init(httpServer);
