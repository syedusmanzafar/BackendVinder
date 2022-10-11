import {
  ResourceNotFoundError,
  ValidationError,
} from "./../4-models/error-models";
import { OkPacket } from "mysql";
import dal from "../2-utils/dal";
import FollowersModel from "../4-models/followers-model";
import VacationModel from "../4-models/vacation-model";
import path from "path";
import socketLogic from "./socket-logic";
import fs from "fs";

// Get all vacations:
async function getAllVacations(): Promise<VacationModel[]> {
  const sql = "SELECT * FROM vacations";
  const vacations = await dal.execute(sql);
  return vacations;
}

// Get one vacation:
async function getOneVacation(vacationId: number): Promise<VacationModel> {
  const sql = "SELECT * FROM vacations WHERE vacationId = " + vacationId;
  const vacation = await dal.execute(sql);
  return vacation;
}

// Get all vacations that has followers:
async function getVacationsByUserFollow(
  userId: string
): Promise<FollowersModel[]> {
  const sql = `SELECT DISTINCT
                V.*,
                EXISTS(SELECT * FROM followers WHERE vacationId = F.vacationId AND userId = '${userId}') AS isFollowing,
                COUNT(F.userId) AS followersCount
                FROM vacations as V LEFT JOIN followers as F
                ON V.vacationId = F.vacationId
                GROUP BY vacationId
                ORDER BY isFollowing DESC ,followersCount DESC;`;
  const vacations = await dal.execute(sql);
  return vacations;
}

// add new follower:
async function followVacation(
  vacationToFollow: FollowersModel
): Promise<FollowersModel> {
  const sql = `INSERT into followers(vacationId, userId) VALUES(${vacationToFollow.vacationId}, '${vacationToFollow.userId}')`;
  const result: OkPacket = await dal.execute(sql);

  // Report via socket.io an existing vacation has been updated by the admin:
  socketLogic.reportAddFollower(vacationToFollow);

  return vacationToFollow;
}

// delete follower:
async function deleteFollower(deleteFollower: FollowersModel): Promise<void> {
  const sql = `DELETE FROM followers WHERE vacationId = ${deleteFollower.vacationId} AND userId = '${deleteFollower.userId}'`;
  const result = await dal.execute(sql);
  if (result.affectedRows === 0) {
    throw new ResourceNotFoundError(deleteFollower.vacationId);
  }
  // Report via socket.io an existing vacation has been deleted by the admin:
  socketLogic.reportDeleteFollower(deleteFollower);
}

// Add new vacation:
async function addVacation(vacation: VacationModel): Promise<VacationModel> {
  // Validate POST:
  const errors = vacation.validatePost();
  if (errors) {
    throw new ValidationError(errors);
  }

  const sql = "INSERT INTO vacations VALUES(DEFAULT, ?, ?, ?, ?, ?, ?)";
  const values = [
    vacation.vacationInfo,
    vacation.destination,
    vacation.imageName,
    vacation.fromDate,
    vacation.untilDate,
    vacation.price,
  ];

  const result: OkPacket = await dal.execute(sql, values);
  vacation.vacationId = result.insertId;

  // Report via socket.io a new vacation has been added by the admin:
  const addedVacation = await getOneVacation(vacation.vacationId);
  socketLogic.reportAddVacation(addedVacation);

  return vacation;
}

// Update full game:
async function updateFullVacation(
  vacation: VacationModel
): Promise<VacationModel> {
  // Validate PUT:
  const errors = vacation.validatePut();
  if (errors) {
    throw new ValidationError(errors);
  }
  // Deleting previous image from assets:
  await deleteImageHandler(vacation.vacationId);

  const sql = `UPDATE vacations SET  
                vacationInfo = '${vacation.vacationInfo}',
                destination = '${vacation.destination}',
                imageName = '${vacation.imageName}',
                fromDate = '${vacation.fromDate}',
                untilDate = '${vacation.untilDate}',
                price = ${vacation.price}
                WHERE vacationId = ${vacation.vacationId}
                `;
  const result: OkPacket = await dal.execute(sql);

  if (result.affectedRows === 0) {
    throw new ResourceNotFoundError(vacation.vacationId);
  }
  // Report via socket.io an existing vacation has been updated by the admin:
  const updatedVacation = await getOneVacation(vacation.vacationId);
  socketLogic.reportUpdateVacation(updatedVacation);

  return vacation;
}

// Update partial vacation:
async function updatePartialVacation(
  vacation: VacationModel
): Promise<VacationModel> {
  const errors = vacation.validatePatch();
  if (errors) {
    throw new ValidationError(errors);
  }

  const dbVacation = await getOneVacation(vacation.vacationId);
  for (const prop in dbVacation) {
    if (vacation[prop] !== undefined) {
      dbVacation[prop] = vacation[prop];
    }
  }

  // Add new update to DB and report via socket.io:
  const updatedVacation = await updateFullVacation(
    new VacationModel(dbVacation)
  );

  return updatedVacation;
}

// Delete existing vacation:
async function deleteVacation(vacationId: number): Promise<void> {
  // Deleting image from assets:
  await deleteImageHandler(vacationId);

  const sql = `DELETE FROM vacations WHERE vacationId = ${vacationId}`;
  const result = await dal.execute(sql);
  if (result.affectedRows === 0) {
    throw new ResourceNotFoundError(vacationId);
  }
  // Report via socket.io an existing vacation has been deleted by the admin:
  socketLogic.reportDeleteVacation(vacationId);
}

async function deleteImageHandler(vacationId: number) {
  try {
    const vacation = await getOneVacation(vacationId);
    const imagePath = path.resolve(
      ".",
      "src/1-assets/images/" + vacation[0].imageName
    );
    fs.exists(imagePath, (exists) => {
      if (exists) {
        fs.unlink(imagePath, (err) => {
          if (err) {
            throw new ResourceNotFoundError(vacationId);
          }
        });
      }
    });
  } catch (err) {
    throw new ResourceNotFoundError(vacationId);
  }
}

export default {
  getAllVacations,
  getVacationsByUserFollow,
  addVacation,
  deleteVacation,
  updateFullVacation,
  getOneVacation,
  updatePartialVacation,
  followVacation,
  deleteFollower,
};
