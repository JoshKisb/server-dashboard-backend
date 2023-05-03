import { Server } from "../types";
import { NodeSSH } from "node-ssh";

export class SSHConnection {
   private ssh: NodeSSH;
   private server: Server;

   constructor(server: Server) {
      this.ssh = new NodeSSH();
      this.server = server;
   }

   async connect() {
      await this.ssh.connect({
         host: this.server.ip,
         port: this.server.port || 22,
         username: this.server.username,
         password: this.server.password,
      });
   }
}

export const connections: {[id: string]: SSHConnection} = {}