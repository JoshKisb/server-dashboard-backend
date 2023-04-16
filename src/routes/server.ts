import express, { Request, Response } from 'express';
import { ServerData } from '../data/servers';
import { Server } from '../types';

const router = express.Router();

const serverData = new ServerData([]);

router.get('/servers', (req, res) => {
  res.send(serverData.getServers());
});

router.get('/servers/:id', (req, res) => {
  const id = req.params.id;
  const server = serverData.getServerById(id);
  if (server) {
    res.send(server);
  } else {
    res.sendStatus(404);
  }
});

router.post('/servers', (req, res) => {
  const server: Server = req.body;
  if (!server.id || !server.name) {
    res.sendStatus(400);
  } else {
    serverData.addServer(server);
    res.status(201).send(server);
  }
});

router.put('/servers/:id', (req, res) => {
  const id = req.params.id;
  const server: Server = req.body;
  if (!server.name) {
    res.sendStatus(400);
  } else {
    serverData.updateServer(id, server);
    const updatedServer = serverData.getServerById(id);
    if (updatedServer) {
      res.send(updatedServer);
    } else {
      res.sendStatus(404);
    }
  }
});

router.delete('/servers/:id', (req, res) => {
  const id = req.params.id;
  serverData.deleteServer(id);
  res.sendStatus(204);
});

export { router as serverRouter };
