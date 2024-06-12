import express from "express";
import session from "express-session";
import userController from "../controllers/userController.js";
import { userSessionSecret } from "../config/config.js";
import { upload } from "../multer/storage.js";
import { isLogin, isLogout } from "../auth/userAuth.js";

const userRoute = express();

userRoute.set("view engine", "ejs");
userRoute.set("views", "./views/users");

// user session secret
userRoute.use(session({ secret: userSessionSecret }));

userRoute.get("/register", isLogout, userController.registerLoad);
userRoute.post("/register", upload.single("image"), userController.insertUser);
userRoute.get("/verify", userController.verifyMail);

userRoute.get("/", isLogout, userController.loginLoad);
userRoute.post("/", userController.verifyLogin);

userRoute.get("/home", isLogin, userController.homeLoad);

// Survey
userRoute.get("/form", isLogin, userController.formLoad);

userRoute.get("/data", isLogin, userController.dataLoad);

userRoute.post("/form", userController.createDoc);

userRoute.get("/surveydata/:fId", isLogin, userController.surveyDataLoad);

userRoute.get("/logout", isLogin, userController.userLogout);

userRoute.get("/forget", isLogout, userController.forgetLoad);
userRoute.post("/forget", userController.forgetVerify);

userRoute.get("/reset-password", isLogout, userController.resetLoad);
userRoute.post("/reset-password", userController.resetPassword);

userRoute.get("/verification", isLogout, userController.verificationLoad);
userRoute.post("/verification", userController.sentVerificationLink);

userRoute.get("/edit", isLogin, userController.editLoad);
userRoute.post("/edit", upload.single("image"), userController.updateProfile);

userRoute.get("/edit-image", isLogin, userController.editImageLoad);
userRoute.post(
  "/edit-image",
  upload.single("image"),
  userController.updateImage
);

export default userRoute;
