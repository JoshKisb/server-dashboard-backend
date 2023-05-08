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
      return new Promise<void>(async (resolve, reject) => {
         this.ssh.connect({
            host: this.server.ip,
            port: this.server.port || 22,
            username: this.server.username,
            password: this.server.password,
         }).then(() => {
            resolve();
         }).catch((e) => {
            console.log(e);
            reject(`Failed to connect to host: ${this.server.ip}`);
         }); 
      });
   }

   async disconnect() {
      await this.ssh.dispose();
   }

   async isConnected() {
      return this.ssh.isConnected();
   }

   async getContainers() {
      return new Promise(async (resolve, reject) => {
         const result = await this.ssh.execCommand('lxc list --format json');
         if (result.stderr) {
            reject(result.stderr);
         } else {
            const containers = JSON.parse(result.stdout);
            resolve(containers);
         }
      });
   }

   async getInfo() {
      return new Promise(async (resolve, reject) => {
         const result = await this.ssh.execCommand('lsb_release -a | grep Description');
         if (result.stderr) {
            reject(result.stderr);
         } else {
            resolve(result.stdout);
         }
      });
   }

   async exec(command: string) {
      return new Promise(async (resolve, reject) => {
         const result = await this.ssh.execCommand(command);
         if (result.stderr) {
            reject(result.stderr);
         } else {
            resolve(result.stdout);
         }
      });
   }
}

export const connections: {[id: string]: SSHConnection} = {}