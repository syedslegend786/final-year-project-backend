import path from "path";
import multer from "multer";
export default multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      // @ts-ignore
      cb(new Error("Unsupported file type!"), false);
      return;
    }
    cb(null, true);
  },
});
