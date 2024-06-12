const errorLoad = async (req, res) => {
    try {
      res.send("404 Page Not Found!");
    } catch (error) {
      console.log("Error :: errorLoad : middlewares :: ", error.message);
    }
  };
  
  export default errorLoad;
  