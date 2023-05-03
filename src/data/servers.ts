import { v4 as uuidv4 } from 'uuid';
import { Server } from '../types';

export class ServerData {
  private servers: Server[];

  constructor(initialServers: Server[]) {
    this.servers = initialServers;
  }

  public getServers(): Server[] {
    return this.servers;
  }

  public getServerById(id: string): Server | undefined {
    return this.servers.find(server => server.id === id);
  }

  public addServer(server: Server): void {
    server.id = uuidv4();
    this.servers.push(server);
  }

  public updateServer(id: string, server: Server): Server | undefined {
    const index = this.servers.findIndex(s => s.id === id);
    if (index !== -1) {
      this.servers[index] = {id, ...server};
      return this.servers[index];
    }
  }

  public deleteServer(id: string): void {
    this.servers = this.servers.filter(server => server.id !== id);
  }
}

interface State {
  servers: Server[]
}

let instance: ServerData = null;
export const createDB = (state: State) => {
  if (!instance)
    instance = new ServerData(state.servers);

  return instance;
}

export const useDB = () => {
  return instance;
}