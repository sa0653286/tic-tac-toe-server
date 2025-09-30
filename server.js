import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow any client
  },
});

app.use(express.static("public"));

const rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("createRoom", (room) => {
    if (!rooms[room]) {
      rooms[room] = [socket.id];
      socket.join(room);
      socket.emit("roomCreated", room);
    } else {
      socket.emit("errorMsg", "Room already exists!");
    }
  });

  socket.on("joinRoom", (room) => {
    if (rooms[room] && rooms[room].length === 1) {
      rooms[room].push(socket.id);
      socket.join(room);
      io.to(room).emit("startGame", room);
    } else {
      socket.emit("errorMsg", "Room full or not exists.");
    }
  });

  socket.on("move", ({ room, index, symbol }) => {
    io.to(room).emit("move", { index, symbol });
  });

  socket.on("disconnect", () => {
    for (let room in rooms) {
      rooms[room] = rooms[room].filter((id) => id !== socket.id);
      if (rooms[room].length === 0) delete rooms[room];
    }
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
