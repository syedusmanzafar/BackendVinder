import { UploadedFile } from "express-fileupload";
import Joi from "joi";

class VacationModel {
  public vacationId: number;
  public vacationInfo: string;
  public destination: string;
  public imageName: string;
  public image: UploadedFile;
  public fromDate: string;
  public untilDate: string;
  public price: number;

  public constructor(vacation: VacationModel) {
    this.vacationId = vacation.vacationId;
    this.vacationInfo = vacation.vacationInfo;
    this.destination = vacation.destination;
    this.imageName = vacation.imageName;
    this.image = vacation.image;
    this.fromDate = vacation.fromDate;
    this.untilDate = vacation.untilDate;
    this.price = vacation.price;
  }

  private static postValidationSchema = Joi.object({
    vacationId: Joi.forbidden(),
    vacationInfo: Joi.string().required().min(2).max(100),
    destination: Joi.string().required().min(2).max(100),
    imageName: Joi.string().optional().min(2).max(80),
    image: Joi.object().optional(),
    fromDate: Joi.string().required().min(2).max(50),
    untilDate: Joi.string().required().min(2).max(50),
    price: Joi.number().required().min(0).max(8000),
  });

  private static putValidationSchema = Joi.object({
    vacationId: Joi.number().required().integer().min(1),
    vacationInfo: Joi.string().required().min(2).max(100),
    destination: Joi.string().required().min(2).max(100),
    imageName: Joi.string().optional().min(2).max(80),
    image: Joi.object().optional(),
    fromDate: Joi.string().required().min(2).max(50),
    untilDate: Joi.string().required().min(2).max(50),
    price: Joi.number().required().min(0).max(8000),
  });

  private static patchValidationSchema = Joi.object({
    vacationId: Joi.number().required().integer().min(1),
    vacationInfo: Joi.string().optional().min(2).max(100),
    destination: Joi.string().optional().min(2).max(100),
    imageName: Joi.string().optional().min(2).max(80),
    image: Joi.object().optional(),
    fromDate: Joi.string().optional().min(2).max(50),
    untilDate: Joi.string().optional().min(2).max(50),
    price: Joi.number().optional().min(0).max(8000),
  });

  public validatePost(): string {
    const result = VacationModel.postValidationSchema.validate(this);
    return result.error?.message;
  }

  public validatePut(): string {
    const result = VacationModel.putValidationSchema.validate(this);
    return result.error?.message;
  }

  public validatePatch(): string {
    const result = VacationModel.patchValidationSchema.validate(this);
    return result.error?.message;
  }
}

export default VacationModel;
