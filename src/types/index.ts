export interface Server {
   id: string;
   name: string;
   ip?: string;
   port?: number;
   password?: string;
   username?: string;
   info?: ServerInfo;
 }

 interface ServerInfo {
  os: string;
  version: string;
  containers: Container[];
 }

export interface Container {
  name: string;
  state: string;
 }