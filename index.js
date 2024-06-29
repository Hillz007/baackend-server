const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const connectDB = require("./config/db");

// Load env vars
dotenv.config({path: ".env"});

// connect to database
connectDB();

const app = express();

//middleware setup
app.use(express.json()) // Body parser

// Mount routes
const auth = require('./routes/auth');

app.use("/api/v1/auth", auth)

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(
  `Server running in ${process.env.NODE_ENV} mode on 
  port ${PORT}`.yellow.bold
));

