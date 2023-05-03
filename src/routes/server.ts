import express, { Request, Response } from 'express';
import { ServerData, useDB } from '../data/servers';
import { Server } from '../types';

const router = express.Router();


router.get('/', (req, res) => {
  const serverData: ServerData = useDB();
  res.send(serverData.getServers());
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  const serverData: ServerData = useDB();
  const server = serverData.getServerById(id);
  if (server) {
    res.send(server);
  } else {
    res.sendStatus(404);
  }
});

router.post('/', (req, res) => {
  const server: Server = req.body;
  const serverData: ServerData = useDB();
  if (!server.name) {
    res.sendStatus(400);
  } else {
    serverData.addServer(server);
    res.status(201).send(server);
  }
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const server: Server = req.body;
  const serverData: ServerData = useDB();
  if (!server.name) {
    res.sendStatus(400);
  } else {
    const updatedServer = serverData.updateServer(id, server);
    if (!!updatedServer) {
      res.send(updatedServer);
    } else {
      res.sendStatus(404);
    }
  }
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  const serverData: ServerData = useDB();
  serverData.deleteServer(id);
  res.sendStatus(204);
});

export { router as serverRouter };
