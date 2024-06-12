import bcrypt from "bcrypt";
import excelJS from "exceljs";
import randomstring from "randomstring";
import User from "../models/userModel.js";
import People from "../models/peopleModel.js";
import {
  hashPassword,
  sendMail,
  sendNewUserVerifyMail,
} from "../components/index.js";

class adminController {
  static loadLogin = async (req, res) => {
    try {
      res.render("login");
    } catch (error) {
      console.log(
        "Error :: surveyDataLoad : adminController :: ",
        error.message
      );
    }
  };

  static adminVerify = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
      const userData = await User.findOne({ email: email });
      if (userData) {
        const matchPassword = await bcrypt.compare(password, userData.password);
        if (matchPassword) {
          if (userData.is_admin === 0) {
            res.render("login", { message: "Email or password incorrect." });
          } else {
            req.session.user_id = userData._id;
            res.redirect("/admin/home");
          }
        } else {
          res.render("login", { message: "Email or password incorrect." });
        }
      } else {
        res.render("login", { message: "Email or password incorrect." });
      }
    } catch (error) {
      console.log("Error :: adminVerify : adminController :: ", error.message);
    }
  };

  static loadHome = async (req, res) => {
    try {
      const userData = await User.findById({ _id: req.session.user_id });
      res.render("home", { user: userData });
    } catch (error) {
      console.log("Error :: loadHome : adminController :: ", error.message);
    }
  };

  // Survey methods start
  static formLoad = async (req, res) => {
    try {
      res.render("form.ejs", { title: "Form" });
    } catch (error) {
      console.log("Error :: formLoad : adminController :: ", error.message);
    }
  };

  static surveyDataLoad = async (req, res) => {
    const familyId = req.params.fId;
    // console.log(familyId);
    try {
      const data = await People.find({ familyId: familyId }).sort({
        age: -1,
      });
      // console.log(data);
      res.render("surveyData.ejs", { data, title: "Family Data" });
    } catch (error) {
      console.log(
        "Error :: surveyDataLoad : adminController :: ",
        error.message
      );
    }
  };

  static createDoc = async (req, res) => {
    // console.log(req.body);
    const fId = req.body.familyId;
    // console.log(fId);
    try {
      // creating document.
      const Doc = new People(req.body);
      // saving document.
      await Doc.save();
      res.redirect(`/admin/editSurvey/${fId}`);
    } catch (error) {
      console.log("Error :: createDoc : adminController :: ", error.message);
    }
  };

  static adminDataPage = async (req, res) => {
    try {
      let search = "";
      if (req.query.search) {
        search = req.query.search;
      }

      const result = await People.find({
        // relation: { $in: ["self", "Self"] },
        fullName: { $regex: ".*" + search + ".*", $options: "i" },
      }).sort({ familyId: 1 });
      // console.log(result);
      const house = await People.find({
        relation: { $in: ["self", "Self"] },
      }).countDocuments();

      const count = await People.find().countDocuments();

      res.render("editData.ejs", {
        result,
        house,
        count,
        title: "Survey Data",
      });
    } catch (error) {
      console.log(
        "Error :: adminDataPage : adminController :: ",
        error.message
      );
    }
  };

  static editSurveyPage = async (req, res) => {
    const familyId = req.params.fId;
    // console.log(familyId);
    try {
      const data = await People.find({ familyId: familyId }).sort({
        age: -1,
      });
      // console.log(data);
      res.render("editSurvey.ejs", { data, title: "Family Data" });
    } catch (error) {
      console.log(
        "Error :: editSurveyPage : adminController :: ",
        error.message
      );
    }
  };

  static editPage = async (req, res) => {
    console.log(req.params.id);
    try {
      const result = await People.findById(req.params.id);
      // console.log(result);
      res.render("editPeople.ejs", { result, title: "Edit People" });
    } catch (error) {
      console.log("Error :: editPage : adminController :: ", error.message);
    }
  };

  static updateDoc = async (req, res) => {
    // console.log(req.body);
    // console.log(req.params.id);
    try {
      const result = await People.findByIdAndUpdate(req.params.id, req.body);
      // console.log(result);
      res.redirect("/admin/adminData");
    } catch (error) {
      console.log("Error :: updateDoc : adminController :: ", error.message);
    }
  };

  static deletePage = async (req, res) => {
    // console.log(req.params.id);
    try {
      const result = await People.findByIdAndDelete(req.params.id);
      // console.log(result);
      res.redirect(`/admin/editSurvey/${result.familyId}`);
    } catch (error) {
      console.log("Error :: deletePage : adminController :: ", error.message);
    }
  };
  /// Survey methods end

  static adminLogout = async (req, res) => {
    try {
      req.session.destroy();
      res.redirect("/admin");
    } catch (error) {
      console.log("Error :: adminLogout : adminController :: ", error.message);
    }
  };

  static loadForget = async (req, res) => {
    try {
      res.render("forget");
    } catch (error) {
      console.log("Error :: loadForget : adminController :: ", error.message);
    }
  };

  static forgetVerify = async (req, res) => {
    try {
      const email = req.body.email;
      const userData = await User.findOne({ email: email });

      if (userData) {
        if (userData.is_admin === 0) {
          res.render("forget", { message: "User mail is incorrect." });
        } else {
          const randomString = randomstring.generate();
          const updatedData = await User.updateOne(
            { email: email },
            { $set: { token: randomString } }
          );

          const subject = "Reset Admin Password";
          const url = process.env.ADMIN_EMAIL_RESET_PASS_URL;

          sendMail(userData.name, userData.email, randomString, subject, url);

          res.render("forget", {
            message2: "Please check your mail to reset your password.",
          });
        }
      } else {
        res.render("forget", { message: "User mail is incorrect." });
      }
    } catch (error) {
      console.log("Error :: forgetVerify : adminController :: ", error.message);
    }
  };

  static resetLoad = async (req, res) => {
    try {
      const token = req.query.token;
      const tokenData = await User.findOne({ token: token });
      if (tokenData) {
        res.render("reset-password", { user_id: tokenData._id });
      } else {
        res.render("forget", { message: "Token is invalid." });
      }
    } catch (error) {
      console.log("Error :: resetLoad : adminController :: ", error.message);
    }
  };

  static resetPassword = async (req, res) => {
    try {
      const password = req.body.password;
      const password2 = req.body.password2;
      const user_id = req.body.user_id;
      if (password === password2) {
        const secure_password = await hashPassword(password);
        const updatedData = await User.findByIdAndUpdate(
          { _id: user_id },
          { $set: { password: secure_password, token: "" } }
        );
        res.redirect("/admin");
      } else {
        res.render("reset-password", {
          user_id,
          message: "Both passwords doesn't matched.",
        });
      }
    } catch (error) {
      console.log(
        "Error :: resetPassword : adminController :: ",
        error.message
      );
    }
  };

  static editProfile = async (req, res) => {
    try {
      const userData = await User.findById({ _id: req.query.id });
      res.render("edit", { user: userData });
    } catch (error) {
      console.log("Error :: editProfile : adminController :: ", error.message);
    }
  };

  static updateProfile = async (req, res) => {
    try {
      if (req.file) {
        const userData = await User.findByIdAndUpdate(
          { _id: req.body.user_id },
          {
            $set: {
              image: req.file.filename,
              name: req.body.name,
              email: req.body.email,
              mobile: req.body.mno,
            },
          }
        );
      } else {
        const userData = await User.findByIdAndUpdate(
          { _id: req.body.user_id },
          {
            $set: {
              name: req.body.name,
              email: req.body.email,
              mobile: req.body.mno,
            },
          }
        );
      }

      res.redirect("/admin/home");
    } catch (error) {
      console.log(
        "Error :: updateProfile : adminController :: ",
        error.message
      );
    }
  };

  static loadDashboard = async (req, res) => {
    try {
      const userData = await User.find({ is_admin: 0 });
      res.render("dashboard", { user: userData });
    } catch (error) {
      console.log(
        "Error :: loadDashboard : adminController :: ",
        error.message
      );
    }
  };

  static loadEditUser = async (req, res) => {
    try {
      const id = req.query.id;
      const userData = await User.findOne({ _id: id });
      res.render("edit-user", { user: userData });
    } catch (error) {
      console.log("Error :: loadEditUser : adminController :: ", error.message);
    }
  };

  static editUser = async (req, res) => {
    try {
      const user_id = req.body.user_id;
      if (req.file) {
        const userData = await User.updateOne(
          { _id: user_id },
          {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mno,
            image: req.file.filename,
          }
        );
      } else {
        const userData = await User.updateOne(
          { _id: user_id },
          {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mno,
          }
        );
      }
      res.redirect("/admin/dashboard");
    } catch (error) {
      console.log("Error :: editUser : adminController :: ", error.message);
    }
  };

  static deleteUser = async (req, res) => {
    try {
      const id = req.query.id;
      const userData = await User.deleteOne({ _id: id });
      res.redirect("/admin/dashboard");
    } catch (error) {
      console.log("Error :: deleteUser : adminController :: ", error.message);
    }
  };

  static loadAddUser = async (req, res) => {
    try {
      res.render("add-user");
    } catch (error) {
      console.log("Error :: loadAddUser : adminController :: ", error.message);
    }
  };

  static addUser = async (req, res) => {
    try {
      const { name, email, mno } = req.body;
      const randomPassword = randomstring.generate(6);
      const sPassword = await hashPassword(randomPassword);

      const addUser = new User({
        name: name,
        email: email,
        mobile: mno,
        password: sPassword,
        is_admin: 0,
      });

      const subject = "Admin add you as user so verification your email";
      const url = process.env.USER_EMAIL_VERIFY_URL;

      sendNewUserVerifyMail(
        name,
        email,
        randomPassword,
        addUser._id,
        subject,
        url
      );

      await addUser.save();
      res.redirect("/admin/dashboard");
    } catch (error) {
      console.log("Error :: addUser : adminController :: ", error.message);
    }
  };

  static exportUsers = async (req, res) => {
    try {
      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet("My Users");

      worksheet.columns = [
        { header: "S no", key: "s_no" },
        { header: "Name", key: "name" },
        { header: "Email ID", key: "email" },
        { header: "Mobile No", key: "mobile" },
        { header: "Image", key: "image" },
        { header: "Is Admin", key: "is_admin" },
        { header: "Is Verified", key: "is_verified" },
      ];

      let counter = 1;

      const userData = await User.find({ is_admin: 0 });

      userData.forEach((user) => {
        user.s_no = counter;
        worksheet.addRow(user);
        counter++;
      });

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
      );

      const filename = "File_" + Math.floor(Math.random() * 9999999) + ".xlsx";

      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

      return workbook.xlsx.write(res).then(() => {
        res.status(200);
      });
    } catch (error) {
      console.log("Error :: exportUsers : adminController :: ", error.message);
    }
  };
}

export default adminController;
