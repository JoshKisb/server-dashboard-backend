import { Container, Server } from "../types";
import { NodeSSH } from "node-ssh";

export class SSHConnection {
   private ssh: NodeSSH;
   private server: Server;

   constructor(server: Server) {
      this.ssh = new NodeSSH();
      this.server = server;
   }

   setServer(server: Server) {
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
            const containers: Container = JSON.parse(result.stdout).map((c: any) => ({
               name: c.name,
               state: c.status,
            }));
            resolve(containers);
         }
      });
   }

   async startContainer(name: string) {
      return new Promise<void>(async (resolve, reject) => {
         const result = await this.ssh.execCommand(`lxc start ${name}`);
         if (result.stderr) {
            reject(result.stderr);
         } else {
            resolve();
         }
      });
   }

   async stopContainer(name: string) {
      return new Promise<void>(async (resolve, reject) => {
         const result = await this.ssh.execCommand(`lxc stop ${name}`);
         if (result.stderr) {
            reject(result.stderr);
         } else {
            resolve();
         }
      });
   }

   async getInfo() {
      return new Promise(async (resolve, reject) => {
         const result = await this.ssh.execCommand('cat /etc/os-release');
         if (result.stderr) {
            reject(result.stderr);
         } else {
            const info: any = {};
            for (const line of result.stdout.split('\n')) {
               const [key, val] = line.split(/\s*=\s*(.+)/)
               info[key] = val.replace(/^"/, "").replace(/"$/, "")
           }
            resolve(info);
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