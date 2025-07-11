export default function socketController(io) {
  const problemRooms = new Map(); // { problemSlug: [socketIds] }

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-problem", (problemSlug) => {
      // Match logic
      if (!problemRooms.has(problemSlug)) {
        problemRooms.set(problemSlug, []);
      }

      const queue = problemRooms.get(problemSlug);
      queue.push(socket.id);

      if (queue.length >= 2) {
        const [user1, user2] = queue.splice(0, 2);
        const roomId = `room-${user1}-${user2}`;
        io.to(user1).emit("matched", { roomId });
        io.to(user2).emit("matched", { roomId });

        // Join room
        io.sockets.sockets.get(user1)?.join(roomId);
        io.sockets.sockets.get(user2)?.join(roomId);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      // TODO: remove from queues if needed

      for (const [problemSlug, queue] of problemRooms.entries()) {
        const index = queue.indexOf(socket.id);
        if (index !== -1) {
          queue.splice(index, 1);
          if (queue.length === 0) {
            problemRooms.delete(problemSlug);
          }
          break;
        }
      }
    });
  });
}
