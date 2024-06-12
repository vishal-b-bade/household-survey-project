import bcrypt from "bcrypt";

const hashPassword = async (password) => {
  try {
    const hashPassword = await bcrypt.hash(password, 10);
    return hashPassword;
  } catch (error) {
    console.log("Error :: hashPassword :: ", error.message);
  }
};

export default hashPassword;
