const isLogin = async (req, res, next) => {
  try {
    if (req.session.user_id) {
    } else {
      res.redirect("/user");
    }
    next();
  } catch (error) {
    console.log("Error :: user_isLogin :: ", error.message);
  }
};

const isLogout = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      res.redirect("/user/home");
    }
    next();
  } catch (error) {
    console.log("Error :: user_isLogout :: ", error.message);
  }
};

export { isLogin, isLogout };
