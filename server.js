const app = require("./app");
const dotenv = require("dotenv");
const connectDatabase = require("./config/database");

dotenv.config({ path: "config/config.env" });

const server = app.listen(process.env.PORT, async () => {
  await connectDatabase();
  console.log(`server is listening on http://localhost:${process.env.PORT}`);
});