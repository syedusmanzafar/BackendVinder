import express, { NextFunction, Request, Response } from "express";
import logic from "../5-logic/logic";
import verifyLoggedIn from "../3-middleware/verify-logged-in";
import verifyAdmin from "../3-middleware/verify-admin";
import VacationModel from "../4-models/vacation-model";
import multer from "../3-middleware/multer";
import FollowersModel from "../4-models/followers-model";

const router = express.Router();

// GET http://localhost:3001/api/vacations
router.get(
  "/vacations",
  verifyLoggedIn,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      // Get all vacations:
      const vacations = await logic.getAllVacations();

      // Return json (status code = 200):
      response.json(vacations);
    } catch (err: any) {
      next(err);
    }
  }
);

// GET http://localhost:3001/api/vacations-by-followers/:userId
router.get(
  "/vacations-by-followers/:userId",
  verifyLoggedIn,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      // getting userId:
      const userId = request.params.userId;
      // Get all vacations:
      const vacations = await logic.getVacationsByUserFollow(userId);

      // Return json (status code = 200):
      response.json(vacations);
    } catch (err: any) {
      next(err);
    }
  }
);

// POST http://localhost:3001/api/vacations-by-followers
router.post(
  "/vacations-by-followers/",
  verifyLoggedIn,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      // Take the json object sent by frontend from the body.
      // Note: we must tell express to extract json object from the request body and create the following request.body object! This is done in app.ts

      const vacationToFollow = new FollowersModel(request.body);

      // Add vacation to database:
      const addedVacation = await logic.followVacation(vacationToFollow);

      // Return added vacation with status code 201:
      response.status(201).json(addedVacation);
    } catch (err: any) {
      next(err);
    }
  }
);

// DELETE http://localhost:3001/api/vacations/3 <-- ids are always sent in the route!
router.delete(
  "/vacations-by-followers/:vacationId([0-9]+)",
  verifyLoggedIn,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      // Take id from the route:
      const vacationId = +request.params.vacationId;
      const follower = new FollowersModel(request.body.follower);
      follower.vacationId = vacationId;

      // Delete follower:
      await logic.deleteFollower(follower);

      // Return empty response:
      response.sendStatus(204); // status + send empty body
    } catch (err: any) {
      next(err);
    }
  }
);

// POST http://localhost:3001/api/vacations
router.post(
  "/vacations",
  multer.single("image"),
  verifyAdmin,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      // Take the json object sent by frontend from the body.
      // Note: we must tell express to extract json object from the request body and create the following request.body object! This is done in app.ts

      const vacation = new VacationModel(request.body);

      // Add vacation to database:
      const addedVacation = await logic.addVacation(vacation);

      // Return added vacation with status code 201:
      response.status(201).json(addedVacation);
    } catch (err: any) {
      next(err);
    }
  }
);

// PUT http://localhost:3001/api/vacations/3 <-- ids are always sent in the route!
router.put(
  "/vacations/:vacationId([0-9]+)",
  multer.single("image"),
  verifyAdmin,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      // Take id from the route:
      const vacationId = +request.params.vacationId;

      // Enter id to request.body which not mandatory to contain id:
      request.body.vacationId = vacationId;

      // Take vacation from the body (can contain id but not mandatory)
      const vacation = new VacationModel(request.body);

      // Update given vacation:
      const updatedVacation = await logic.updateFullVacation(vacation);

      // Return json (status code = 200):
      response.json(updatedVacation);
    } catch (err: any) {
      next(err);
    }
  }
);

// PATCH http://localhost:3001/api/vacations/3 <-- ids are always sent in the route!
router.patch(
  "/vacations/:vacationId([0-9]+)",
  multer.single("image"),
  verifyAdmin,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      // Take id from the route:
      const vacationId = +request.params.vacationId;

      // Enter id to request.body which not mandatory to contain id:
      request.body.vacationId = vacationId;

      // Take vacation from the body (can contain id but not mandatory)
      const vacation = new VacationModel(request.body);

      // Update given vacation:
      const updatedVacation = await logic.updatePartialVacation(vacation);

      // Return json (status code = 200):
      response.json(updatedVacation);
    } catch (err: any) {
      next(err);
    }
  }
);

// DELETE http://localhost:3001/api/vacations/3 <-- ids are always sent in the route!
router.delete(
  "/vacations/:vacationId([0-9]+)",
  verifyAdmin,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      // Take id from the route:
      const vacationId = +request.params.vacationId;

      // Delete vacation:
      await logic.deleteVacation(vacationId);

      // Return empty response:
      response.sendStatus(204); // status + send empty body
    } catch (err: any) {
      next(err);
    }
  }
);

export default router;
