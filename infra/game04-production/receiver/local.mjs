import { createServer } from 'node:http';
import receiver from './api/receiver.mjs';
createServer(receiver).listen(Number(process.env.PORT || 3000), '127.0.0.1');
