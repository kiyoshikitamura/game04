import { createServer } from 'node:http';
import router from './router.mjs';
createServer(router).listen(Number(process.env.PORT || 3000), '127.0.0.1');
