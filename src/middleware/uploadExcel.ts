import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb
) => {
  const allowedExtensions = [".xls", ".xlsx"];

  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    return cb(new Error("Only .xls and .xlsx files are allowed"));
  }

  cb(null, true);
};

const uploadExcel = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

export default uploadExcel;