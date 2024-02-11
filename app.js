const express = require("express");
const playersRoute=require("./routes/playersRoute")
const userRoute=require("./routes/userRoute")
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "*", credentials: true }));


app.use("/",playersRoute)
app.use("/",userRoute)
module.exports = app;