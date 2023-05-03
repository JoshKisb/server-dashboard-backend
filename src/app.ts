import fs from "fs";
import path from "path";
import express, { Application } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import { serverRouter } from "./routes/server";
import { createDB } from "./data/servers";
const app: Application = express();

app.use(bodyParser.json());
app.use(cors());
app.use(morgan("combined"));


createDB();
app.use("/servers", serverRouter);

export default app;
