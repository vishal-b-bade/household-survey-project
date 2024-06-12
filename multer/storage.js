import path from "path";
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const filePath = path.join(process.cwd(), "./public/userImages");
    cb(null, filePath);
  },
  filename: (req, file, cb) => {
    const fileName =
      "IMG_" + Math.floor(Math.random() * 9999999) + "_" + Date.now() + ".jpg";
    cb(null, fileName);
  },
});

export const upload = multer({ storage: storage });
