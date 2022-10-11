import { Request } from "express";
import path from "path";
import { v4 as uuid } from "uuid";
const multer = require("multer");
type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

const storage = multer.diskStorage({
  destination: function (
    req: Request,
    file: Express.Multer.File,
    cb: DestinationCallback
  ) {
    cb(null, path.resolve(".", "src/1-assets/images/"));
  },
  filename: function (
    req: Request,
    file: Express.Multer.File,
    cb: FileNameCallback
  ) {
    // Generate unique name with original extension:
    const dotIndex = file.originalname.lastIndexOf(".");
    const extension = file.originalname.substring(dotIndex);
    const imageName = uuid() + extension; // a3c0807a-c034-4370-854d-55612c954d83.png / 741cb7c1-422f-4476-a456-b692b2e880b8.jpg
    // rename imageName in addedVacation so it will match with the file name:
    req.body.imageName = imageName;
    cb(null, imageName);
  },
});

export default multer({ storage });
