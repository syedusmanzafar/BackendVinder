import cyber from "../2-utils/cyber";
import dal from "../2-utils/dal";
import CredentialsModel from "../4-models/credentials-model";
import { UnauthorizedError } from "../4-models/error-models";
import Role from "../4-models/role-model";
import UserModel from "../4-models/user-model";
import { OkPacket } from "mysql";
import { v4 as uuid } from "uuid";
import { ValidationError } from "./../4-models/error-models";

async function register(user: UserModel): Promise<string> {
  // adding role to user:
  user.Role = Role.User;

  // Validate POST:
  const errors = user.validatePost();
  if (errors) {
    throw new ValidationError(errors);
  }

  user.userName = user.userName.toLowerCase();

  // Get all users:
  const sqlGetUsers = `SELECT * FROM users WHERE userName = '${user.userName}'`;
  const users = await dal.execute(sqlGetUsers);

  // If userName already exists:
  if (users.length > 0) {
    throw new UnauthorizedError(
      "User Name already taken, choose a different one"
    );
  }

  // Save user to database
  const addedUser = await addUser(user);

  // Generate token:
  const token = cyber.getNewToken(addedUser);

  // Return the token:
  return token;
}

async function addUser(user: UserModel): Promise<UserModel> {
  // Hash password and id before saving in db:
  user.password = cyber.hash(user.password);
  user.userId = uuid();

  // Save user to database:
  const sqlAddUser = "INSERT INTO users VALUES(?, ?, ?, ?, ?, ?)";
  const values = [
    user.userId,
    user.firstName,
    user.lastName,
    user.userName,
    user.password,
    user.Role,
  ];

  const result: OkPacket = await dal.execute(sqlAddUser, values);

  // Delete password before returning user:
  delete user.password;

  return user;
}

async function login(credentials: CredentialsModel): Promise<string> {
  credentials.userName = credentials.userName.toLowerCase();

  // Validate POST:
  const errors = credentials.validatePost();
  if (errors) {
    throw new ValidationError(errors);
  }

  // Hash password AND id before comparing to db:
  credentials.password = cyber.hash(credentials.password);

  const sql = `SELECT * FROM users WHERE userName = ? AND password = ?`;
  const users = await dal.execute(sql, [
    credentials.userName,
    credentials.password,
  ]);

  if (users.length === 0) return null;
  const user = users[0];

  // If user not exist:
  if (!user) {
    throw new UnauthorizedError("Incorrect username or password");
  }

  // Delete password before returning user:
  delete user.password;

  // Generate token:
  const token = cyber.getNewToken(user);

  // Return the token:
  return token;
}

export default {
  register,
  login,
};
