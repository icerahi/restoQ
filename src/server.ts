import { Server } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { env } from './config/env';

async function main() {
  let server: Server;

  try {
    server = app.listen(env.port, () => {
      console.log(`🚀 Server is running on http://localhost:${env.port}`);
    });

    // Socket.io setup
    const io = new SocketIOServer(server, {
      cors: {
        origin: '*', // Adjust for production
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    const exitHandler = () => {
      if (server) {
        server.close(() => {
          console.log('Server closed gracefully.');
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    };

    process.on('unhandledRejection', (error) => {
      console.log('Unhandled Rejection is detected, we are closing our server...');
      if (server) {
        server.close(() => {
          console.log(error);
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('Error during server startup:', error);
    process.exit(1);
  }
}

main();
