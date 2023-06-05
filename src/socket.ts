import http from "http";
import { Application } from "express";
import { Server } from "socket.io";
import { shellStreams } from "./data/connections";

let io: Server = null;

export const setupSocket = (app: Application) => {
   console.log("setupSocket");
   const server = http.createServer(app);
   io = new Server(server);

   io.on("connection", (socket) => {
      console.log("a user connected");
      socket.on("disconnect", () => {
         console.log("user disconnected");
      });
  
  
      // Receive terminal input from the client
      socket.on("terminalInput", (data) => {
         console.log("Received input:", data);
         const { server, input } = data;
         const stream = shellStreams[server].getStream();
         stream.write(input);
      });

      

      // Handle disconnect event
      socket.on("disconnect", () => {
         // Perform any cleanup or necessary actions on client disconnect
         // stream.end();
      });
   });


   console.log("setupSocket done");

   return { server, io };
};

export const getSocket = () => {
   // console.log("getSocket", io);
   return io;
};
