import bcrypt from "bcrypt";
import randomstring from "randomstring";
import User from "../models/userModel.js";
import People from "../models/peopleModel.js";
import { hashPassword, sendMail } from "../components/index.js";

class userController {
  static indexLoad = async (req, res) => {
    try {
      res.render("index.ejs");
    } catch (error) {
      console.log("Error :: indexLoad : userController :: ", error.message);
    }
  };

  // registration methods
  static registerLoad = async (req, res) => {
    try {
      res.render("registration.ejs");
    } catch (error) {
      console.log("Error :: registerLoad : userController :: ", error.message);
    }
  };

  static insertUser = async (req, res) => {
    // console.log(req.body);

    const sPassword = await hashPassword(req.body.password);
    try {
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mno,
        image: req.file.filename,
        password: sPassword,
        is_admin: 0,
      });

      const userFound = await User.findOne({ email: req.body.email });
      // console.log(userFound);
      if (userFound == null) {
        const userData = await user.save();
        // console.log(userData);

        if (userData) {
          const subject = "Email Verification";
          const url = process.env.USER_EMAIL_VERIFY_URL;

          sendMail(userData.name, userData.email, userData._id, subject, url);

          res.render("registration.ejs", {
            message1:
              "Your registration is successful. please, verify user mail.",
          });
        } else {
          res.render("registration.ejs", {
            message2: "Your registration Failed.",
          });
        }
      } else {
        res.render("registration.ejs", { message2: "User already exist." });
      }
    } catch (error) {
      console.log("Error :: insertUser : userController :: ", error.message);
    }
  };

  static verifyMail = async (req, res) => {
    try {
      const updateInfo = await User.updateOne(
        { _id: req.query.id },
        { $set: { is_verified: 1, token: "" } }
      );
      // console.log(updateInfo);
      res.render("login.ejs", {
        message1: "Your email has been verified.",
      });
    } catch (error) {
      console.log("Error :: verifyMail : userController :: ", error.message);
    }
  };

  // login methods start
  static loginLoad = async (req, res) => {
    try {
      res.render("login.ejs");
    } catch (error) {
      console.log("Error :: loginLoad : userController :: ", error.message);
    }
  };

  static verifyLogin = async (req, res) => {
    // console.log(req.body);
    try {
      const userData = await User.findOne({ email: req.body.email });
      if (userData != null) {
        const matchPassword = await bcrypt.compare(
          req.body.password,
          userData.password
        );
        if (matchPassword) {
          if (userData.is_verified === 0) {
            res.render("login.ejs", {
              message2: "Plzz, Verify your Email.",
            });
          } else {
            req.session.user_id = userData._id;
            res.redirect("/user/home");
          }
        } else {
          res.render("login.ejs", {
            message2: "Email or Password is not valid.",
          });
        }
      } else {
        res.render("login.ejs", {
          message2: "Email or Password is not valid.",
        });
      }
    } catch (error) {
      console.log("Error :: verifyLogin : userController :: ", error.message);
    }
  };

  static homeLoad = async (req, res) => {
    try {
      const userData = await User.findById({ _id: req.session.user_id });
      res.render("home", { user: userData });
    } catch (error) {
      console.log("Error :: homeLoad : : userController: ", error.message);
    }
  };

  // Survey methods start
  static formLoad = async (req, res) => {
    try {
      res.render("form.ejs", { title: "Form" });
    } catch (error) {
      console.log("Error :: formLoad : : userController: ", error.message);
    }
  };

  static dataLoad = async (req, res) => {
    try {
      var page = 1;
      if (req.query.page) {
        page = req.query.page;
      }

      let limit = 10;

      const result = await People.find({
        relation: { $in: ["self", "Self"] },
      })
        .sort({ familyId: 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec(); // exce methods ??
      // console.log(result);

      const house = await People.find({
        relation: { $in: ["self", "Self"] },
      }).countDocuments();

      const count = await People.find().countDocuments();
      // const count = result.reduce((accumulator, data) => {
      //   return accumulator + data.members;
      // }, 0);

      res.render("data.ejs", {
        result,
        house,
        count,
        title: "Home Data",
        totalPages: Math.ceil(house / limit),
        currentPage: page,
      });
    } catch (error) {
      console.log("Error :: dataLoad : : userController: ", error.message);
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
        "Error :: surveyDataLoad : userController :: ",
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
      res.redirect(`/user/surveydata/${fId}`);
    } catch (error) {
      console.log("Error :: createDoc : userController :: ", error.message);
    }
  };
  /// Survey methods end

  static userLogout = async (req, res) => {
    try {
      req.session.destroy();
      res.redirect("/user");
    } catch (error) {
      console.log("Error :: userLogout : userController :: ", error.message);
    }
  };
  /// login methods end

  // forget password code
  static forgetLoad = async (req, res) => {
    try {
      res.render("forget.ejs");
    } catch (error) {
      console.log("Error :: forgetLoad : userController :: ", error.message);
    }
  };

  static forgetVerify = async (req, res) => {
    try {
      const email = req.body.email;
      const userData = await User.findOne({ email: email });

      if (userData) {
        if (userData.is_verified === 0) {
          res.render("forget", { message2: "Please verify your mail." });
        } else {
          const randomString = randomstring.generate();
          const updatedData = await User.updateOne(
            { email: email },
            { $set: { token: randomString } }
          );

          const subject = "Reset Password";
          const url = process.env.USER_EMAIL_RESET_PASS_URL;

          sendMail(userData.name, userData.email, randomString, subject, url);
          res.render("forget", {
            message1: "Please check your mail to reset your password.",
          });
        }
      } else {
        res.render("forget", { message2: "Email or password is incorrect." });
      }
    } catch (error) {
      console.log("Error :: forgetVerify : userController :: ", error.message);
    }
  };

  static resetLoad = async (req, res) => {
    try {
      const token = req.query.token;
      const tokenData = await User.findOne({ token: token });
      if (tokenData) {
        res.render("reset-password", { user_id: tokenData._id });
      } else {
        res.render("forget", { message2: "Token is invalid." });
      }
    } catch (error) {
      console.log("Error :: resetLoad : userController :: ", error.message);
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
        res.redirect("/user");
      } else {
        res.render("reset-password", {
          user_id,
          message2: "Password not matched.",
        });
      }
    } catch (error) {
      console.log("Error :: resetPassword : userController :: ", error.message);
    }
  };

  // for verification send mail link
  static verificationLoad = async (req, res) => {
    try {
      res.render("verification.ejs");
    } catch (error) {
      console.log(
        "Error :: verificationLoad : userController :: ",
        error.message
      );
    }
  };

  static sentVerificationLink = async (req, res) => {
    try {
      const email = req.body.email;
      const userData = await User.findOne({ email: email });
      if (userData) {

        const subject = "Email Verification";
        const url = process.env.USER_EMAIL_VERIFY_URL;

        sendMail(userData.name, userData.email, userData._id, subject, url);

        res.render("verification", {
          message1:
            "Resend Verification link on your email, please check your email.",
        });
      } else {
        res.render("verification.ejs", {
          message2: "Email is incorrect.",
        });
      }
    } catch (error) {
      console.log(
        "Error :: sentVerificationLink : userController :: ",
        error.message
      );
    }
  };

  static editLoad = async (req, res) => {
    try {
      const userData = await User.findById({ _id: req.query.id });
      res.render("edit", { user: userData });
    } catch (error) {
      console.log("Error :: editLoad : : userController: ", error.message);
    }
  };

  static updateProfile = async (req, res) => {
    try {
      const userData = await User.findByIdAndUpdate(
        { _id: req.body.user_id },
        {
          $set: {
            name: req.body.name,
            // email: req.body.email,
            mobile: req.body.mno,
          },
        }
      );

      res.redirect("/user/home");
    } catch (error) {
      console.log("Error :: updateProfile : userController :: ", error.message);
    }
  };

  static editImageLoad = async (req, res) => {
    try {
      const userData = await User.findById({ _id: req.query.id });
      res.render("edit-image", { user: userData });
    } catch (error) {
      console.log("Error :: editImageLoad : userController :: ", error.message);
    }
  };

  static updateImage = async (req, res) => {
    try {
      if (req.file) {
        const userData = await User.findByIdAndUpdate(
          { _id: req.body.user_id },
          {
            $set: {
              image: req.file.filename,
            },
          }
        );
      } else {
        console.log(error.message);
      }
      res.redirect("/user/home");
    } catch (error) {
      console.log("Error :: updateImage : userController :: ", error.message);
    }
  };
}

export default userController;
