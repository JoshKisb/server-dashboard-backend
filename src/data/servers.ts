import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Server } from '../types';

const filename = path.join(__dirname, '../../servers.json');
export class ServerData {
  private servers: Server[];

  constructor() {
    const initialServers: Server[] = JSON.parse(fs.readFileSync(filename, 'utf-8'))
    this.servers = initialServers;
  }

  private saveServers(): void {
    fs.writeFile(filename, JSON.stringify(this.servers, null, 4), (err) => {
      if (err) {
        console.error(err);
      }
    });
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
    this.saveServers();
  }

  public updateServer(id: string, server: Server): Server | undefined {
    const index = this.servers.findIndex(s => s.id === id);
    if (index !== -1) {
      this.servers[index] = {id, ...server};
      this.saveServers();
      return this.servers[index];
    }
  }

  public deleteServer(id: string): void {
    this.servers = this.servers.filter(server => server.id !== id);
    this.saveServers();
  }
}

interface State {
 
}

let instance: ServerData = null;
export const createDB = () => {
  if (!instance)
    instance = new ServerData();

  return instance;
}

export const useDB = () => {
  if (!instance)
    throw new Error('DB not created');
  return instance;
}