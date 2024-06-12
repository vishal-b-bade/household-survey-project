import express from "express";
import session from "express-session";
import adminController from "../controllers/adminController.js";
import { adminSessionSecret } from "../config/config.js";
import { upload } from "../multer/storage.js";
import { isLogin, isLogout } from "../auth/adminAuth.js";

const adminRoute = express();

adminRoute.set("view engine", "ejs");
adminRoute.set("views", "./views/admin");

// admin session secret
adminRoute.use(session({ secret: adminSessionSecret }));

adminRoute.get("/", isLogout, adminController.loadLogin);
adminRoute.post("/", adminController.adminVerify);

adminRoute.get("/home", isLogin, adminController.loadHome);

// Survey
adminRoute.get("/form", isLogin, adminController.formLoad);
adminRoute.post("/form", adminController.createDoc);

adminRoute.get("/surveydata/:fId", isLogin, adminController.surveyDataLoad);

adminRoute.get("/adminData", isLogin, adminController.adminDataPage);
adminRoute.get("/editSurvey/:fId", isLogin, adminController.editSurveyPage);

adminRoute.get("/adminData/edit/:id", isLogin, adminController.editPage);
adminRoute.post("/adminData/edit/:id", adminController.updateDoc);
adminRoute.post("/adminData/delete/:id", adminController.deletePage);
// Survey

adminRoute.get("/logout", isLogin, adminController.adminLogout);

adminRoute.get("/forget", isLogout, adminController.loadForget);
adminRoute.post("/forget", isLogout, adminController.forgetVerify);

adminRoute.get("/reset-password", isLogout, adminController.resetLoad);

adminRoute.post("/reset-password", adminController.resetPassword);

adminRoute.get("/edit", isLogin, adminController.editProfile);

adminRoute.post("/edit", upload.single("image"), adminController.updateProfile);

adminRoute.get("/dashboard", isLogin, adminController.loadDashboard);

adminRoute.get("/edit-user", isLogin, adminController.loadEditUser);

adminRoute.post("/edit-user", upload.single("image"), adminController.editUser);

adminRoute.get("/delete-user", isLogin, adminController.deleteUser);

adminRoute.get("/add-user", isLogin, adminController.loadAddUser);

adminRoute.post("/add-user", upload.single("image"), adminController.addUser);

adminRoute.get("/export-user", isLogin, adminController.exportUsers);

export default adminRoute;
