import Role from "./role-model";
import Joi from "joi";

class UserModel {
  public userId: string;
  public firstName: string;
  public lastName: string;
  public userName: string;
  public password: string;
  public Role: Role;

  public constructor(user: UserModel) {
    this.userId = user.userId;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.userName = user.userName;
    this.password = user.password;
    this.Role = user.Role;
  }

  private static postValidationSchema = Joi.object({
    userId: Joi.forbidden(),
    firstName: Joi.string().required().min(2).max(50),
    lastName: Joi.string().required().min(2).max(50),
    userName: Joi.string().required().min(3).max(40),
    password: Joi.string().required().min(5).max(20),
    Role: Joi.string().required().valid(Role.User),
  });

  public validatePost(): string {
    const result = UserModel.postValidationSchema.validate(this);
    return result.error?.message;
  }
}

export default UserModel;
