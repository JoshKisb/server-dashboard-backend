import http from "http";
import { Application } from "express";
import { Server } from "socket.io";

let io: Server = null;

export const setupSocket = (app: Application) => {
   console.log("setupSocket");
   const server = http.createServer(app);
   io = new Server(server);

   console.log("setupSocket done");

   return { server, io };
};

export const getSocket = () => {
   // console.log("getSocket", io);
   return io;
};
