import app from "./app";
import { setupSocket } from "./socket";

const port = process.env.PORT || 3000;
const { io, server } = setupSocket(app);

server.listen(port, () => {
	console.log(`Server listening on port ${port}!!!`);
});
