const express = require('express');
const socketIO = require('socket.io');
const { Pool } = require('pg');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {origin: "*"}
});

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

io.on('connection', (socket) => {
  console.log(`Connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`);
  });

  socket.on('join', (channel_id) => {
    console.log(`Socket ${socket.id} joining ${channel_id}`);
    socket.join(channel_id);
  });

  socket.on('chat', (data) => {
    const { channel_id, user_id, sent_at, text } = data;

    console.log(`Received message: ${text}`);

    pool.connect((err, client, done) => {
      if (err) throw err;

      client.query('INSERT INTO message (channel_id, user_id, sent_at, text) VALUES ($1, $2, $3, $4) RETURNING *;',
        [channel_id, user_id, sent_at, text],
        (err, result) => {
          done();

          if (err) {
            console.error('Error executing query', err);
            return;
          }

          const { message_id, channel_id, user_id, sent_at, text } = result.rows[0];
          const message = { message_id, user_id, text };
          io.to(channel_id).emit('chat', message);
        });
    });
  });
});

const PORT = 80;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
