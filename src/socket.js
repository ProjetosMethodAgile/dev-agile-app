// src/socket.js
let io = null;

module.exports = {
  init: (server) => {
    io = require("socket.io")(server, {
      cors: {
        origin: "*", // Para desenvolvimento, permite todas as origens
      },
    });
    io.on("connection", (socket) => {
      console.log("Cliente conectado:", socket.id);

      // Adiciona um ouvinte para um evento de teste
      socket.on("testEvent", (data) => {
        console.log("Recebeu testEvent:", data);
      });

      socket.on("disconnect", () => {
        console.log("Cliente desconectado:", socket.id);
      });
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.IO não foi inicializado!");
    }
    return io;
  },
};
