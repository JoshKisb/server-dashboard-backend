import http from "http";
import { Application } from "express";
import { Server } from "socket.io";

let io: Server = null;

export const setupSocket = (app: Application) => {
   const server = http.createServer(app);
   io = new Server(server);

   io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

   return { server, io };
};

export const getSocket = () => {
  return io;
}

