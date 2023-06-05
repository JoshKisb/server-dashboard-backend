import fs from "fs";
import path from "path";
import express, { Application } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import { serverRouter } from "./routes/server";
import { createDB } from "./data/servers";
import { setupSocket } from "./socket";
const app: Application = express();

app.use(bodyParser.json());
app.use(cors({origin:'*', credentials : true}));
app.use(morgan("combined"));

const { io } = setupSocket(app);

createDB();
app.use("/servers", serverRouter);

export default app;
