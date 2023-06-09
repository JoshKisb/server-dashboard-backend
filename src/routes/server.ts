import express, { Request, Response } from 'express';
import { ServerData, useDB } from '../data/servers';
import { Server } from '../types';
import { connections, SSHConnection, shellStreams } from '../data/connections';

const router = express.Router();



router.get('/', (req, res) => {
  const serverData: ServerData = useDB();
  res.send(serverData.getServers());
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const serverData: ServerData = useDB();
  const server = serverData.getServerById(id);
  if (server) {
    let connection = null;
    if (!(id in connections)) {
      connection = new SSHConnection(server);
      connections[id] = connection;
    } else {
      connection = connections[id];
      connection.setServer(server);
    }
    try {
      await connection.connect();
      const response = {
        ...server,
        info: {
          os: await connection.getInfo(),
          memory: await connection.getMemory(),
          disk: await connection.getDisk(),
          containers: await connection.getContainers(),
          uptime: await connection.getUptime(),
        },
      }
      connection.disconnect();
      res.send(response);
    } catch (e) {
      console.log(e);
      res.status(400).send({ error: e })
    }
    // res.send(server);
  } else {
    res.sendStatus(404);
  }
});

router.get('/:id/terminal', async (req, res) => {
  const id = req.params.id;
  const serverData: ServerData = useDB();
  const server = serverData.getServerById(id);
  if (server) {
    let shellStream = null;
    if (!(id in shellStreams)) {
      shellStream = new SSHConnection(server);
      shellStreams[id] = shellStream;
    } else {
      shellStream = shellStreams[id];
      shellStream.setServer(server);
    }
    try {
      await shellStream.connectWebTerminal();      
      res.send({ success: true });
    } catch (e) {
      console.log(e);
      res.status(400).send({ error: e })
    }
  } else {
    res.sendStatus(404);
  }
});


router.post('/:id/run', async (req, res) => {
  const id = req.params.id;
  const command = req.body.script;
  const container = req.body.container;
  const serverData: ServerData = useDB();
  const server = serverData.getServerById(id);
  if (server && command && container) {
    let connection = null;
    if (!(id in connections)) {
      connection = new SSHConnection(server);
      connections[id] = connection;
    } else {
      connection = connections[id];
      connection.setServer(server);
    }
    try {
      await connection.connect();
      if (command === 'start') {
        await connection.startContainer(container);
      } else if (command === 'stop') {
        await connection.stopContainer(container);
      }

      const response = {
        ...server,
        info: {
          os: await connection.getInfo(),
          containers: await connection.getContainers(),
        },
      }
      connection.disconnect();
      res.send(response);
    } catch (e) {
      console.log(e);
      res.status(400).send({ error: e })
    }
    // res.send(server);
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

router.post('/:id/connect', (req, res) => {
  const id = req.params.id;
  const serverData: ServerData = useDB();
  const server = serverData.getServerById(id);
  if (server) {
    if (!(id in connections)) {
      connections[id] = new SSHConnection(server);
    }
    connections[id].connect();
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
})

export { router as serverRouter };
