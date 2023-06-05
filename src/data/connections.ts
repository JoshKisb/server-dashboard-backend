import { getSocket } from "../socket";
import { Container, Server } from "../types";
import { NodeSSH } from "node-ssh";

const units = ["bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];

function niceBytes(x: string) {
   let l = 0,
      n = parseInt(x, 10) || 0;

   while (n >= 1024 && ++l) {
      n = n / 1024;
   }

   return n.toFixed(n < 10 && l > 0 ? 1 : 0) + " " + units[l];
}
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

   async connectWebTerminal() {
      return new Promise<void>(async (resolve, reject) => {
         const socket = getSocket();
         await this.connect();
         this.ssh
            .requestShell()
            .then((stream) => {
              
               // Receive terminal input from the client
               socket.on("terminalInput", (input: string) => {
                  console.log("Received input:", input);
                  stream.write(input);
               });

               // Receive output from the SSH shell stream
               stream.on("data", (data: Buffer) => {
                  const output = data.toString();
                  socket.emit("terminalOutput", output);
               });

               // Handle disconnect event
               socket.on("disconnect", () => {
                  // Perform any cleanup or necessary actions on client disconnect
                  stream.end();
               });

               console.log("Web terminal connected successfully.");
               resolve();
            })
            .catch((err: Error) => {
               console.error("Web terminal connection error:", err);
               reject(err);
            });
      });
   }

   async connect() {
      return new Promise<void>(async (resolve, reject) => {
         this.ssh
            .connect({
               host: this.server.ip,
               port: this.server.port || 22,
               username: this.server.username,
               password: this.server.password,
            })
            .then(() => {
               resolve();
            })
            .catch((e) => {
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
         const result = await this.ssh.execCommand("lxc list --format json");
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
         const result = await this.ssh.execCommand("cat /etc/os-release");
         if (result.stderr) {
            reject(result.stderr);
         } else {
            const info: any = {};
            for (const line of result.stdout.split("\n")) {
               const [key, val] = line.split(/\s*=\s*(.+)/);
               info[key] = val.replace(/^"/, "").replace(/"$/, "");
            }
            resolve(info);
         }
      });
   }

   async getUptime() {
      return new Promise(async (resolve, reject) => {
         const result = await this.ssh.execCommand("uptime -p");
         if (result.stderr) {
            reject(result.stderr);
         } else {
            resolve(result.stdout.replace("\n", "").replace("up ", ""));
         }
      });
   }

   async getMemory() {
      return new Promise(async (resolve, reject) => {
         const result = await this.ssh.execCommand("free -h");
         if (result.stderr) {
            reject(result.stderr);
         } else {
            const lines = result.stdout.split("\n");
            const mem = lines[1].split(/\s+/);
            const swap = lines[2].split(/\s+/);
            resolve({
               total: mem[1],
               used: mem[2],
               free: mem[3],
               shared: mem[4],
               cache: mem[5],
               available: mem[6],
               swapTotal: swap[1],
               swapUsed: swap[2],
               swapFree: swap[3],
            });
         }
      });
   }

   async getDisk() {
      return new Promise(async (resolve, reject) => {
         const result = await this.ssh.execCommand("df -h");
         if (result.stderr) {
            reject(result.stderr);
         } else {
            const lines = result.stdout.split("\n");
            const disk = lines[1].split(/\s+/);
            resolve({
               total: disk[1],
               used: disk[2],
               free: disk[3],
               percent: disk[4],
            });
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

export const connections: { [id: string]: SSHConnection } = {};
