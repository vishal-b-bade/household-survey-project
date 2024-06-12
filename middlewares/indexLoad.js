const indexLoad = async (req, res) => {
  try {
    res.render("index.ejs");
  } catch (error) {
    console.log("Error :: indexLoad : middlewares :: ", error.message);
  }
};

export default indexLoad;
