import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import FollowersModel from "../4-models/followers-model";
import VacationModel from "../4-models/vacation-model";

let socketServer: SocketServer;

function init(httpServer: HttpServer): void {
  // Create socket server:
  socketServer = new SocketServer(httpServer, { cors: { origin: "*" } });

  // Listen to clients connection:
  socketServer.sockets.on("connection", (socket: Socket) => {
    console.log("Client has been connected...");
  });
}

// Reporting a new vacation added by the admin:
function reportAddVacation(vacation: VacationModel): void {
  console.log("emit - add");
  socketServer.sockets.emit("admin-added-vacation", vacation);
}

// Reporting a vacation updated by the admin:
function reportUpdateVacation(vacation: VacationModel): void {
  console.log("emit - update");
  socketServer.sockets.emit("admin-updated-vacation", vacation);
}

// Reporting a vacation deleted by the admin:
function reportDeleteVacation(vacationId: number): void {
  console.log("emit - delete");
  socketServer.sockets.emit("admin-deleted-vacation", vacationId);
}

// Reporting a new follower:
function reportAddFollower(follower: FollowersModel): void {
  console.log("emit - add Follower");
  socketServer.sockets.emit("follower-added", follower);
}

// Reporting a user UnFollows:
function reportDeleteFollower(follower: FollowersModel): void {
  console.log("emit - delete");
  socketServer.sockets.emit("follower-deleted", follower);
}
export default {
  init,
  reportAddVacation,
  reportUpdateVacation,
  reportDeleteVacation,
  reportAddFollower,
  reportDeleteFollower,
};
