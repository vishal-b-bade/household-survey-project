const isLogin = async (req, res, next) => {
  try {
    if (req.session.user_id) {
    } else {
      res.redirect("/admin");
    }
    next();
  } catch (error) {
    console.log("Error :: admin_isLogin :: ", error.message);
  }
};

const isLogout = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      res.redirect("/admin/home");
    }
    next();
  } catch (error) {
    console.log("Error :: admin_isLogout :: ", error.message);
  }
};

export { isLogin, isLogout };
