const apps = require("./apps");

apps.listen(3000, () => {
  console.log("Started express server at port 3000");
});
