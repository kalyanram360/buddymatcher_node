// const waitingUsers = new Map(); // Map<problemId, socketId>

// const socketController = (io) => {
//   io.on("connection", (socket) => {
//     console.log(`User connected: ${socket.id}`);

//     socket.on("join-problem", (problemId) => {
//       console.log(`User ${socket.id} wants to join problem ${problemId}`);

//       if (waitingUsers.has(problemId)) {
//         const partnerSocketId = waitingUsers.get(problemId);

//         // Pair them up: create a private room
//         const roomName = `room-${problemId}`;

//         socket.join(roomName);
//         io.sockets.sockets.get(partnerSocketId)?.join(roomName);

//         // Notify both users they are matched
//         io.to(roomName).emit("match-found", { room: roomName });
//         console.log(
//           `Matched ${socket.id} with ${partnerSocketId} in ${roomName}`
//         );

//         // Remove from waiting
//         waitingUsers.delete(problemId);
//       } else {
//         // First person to join this problem — wait for a match
//         waitingUsers.set(problemId, socket.id);
//         console.log(
//           `User ${socket.id} is waiting for a match in problem ${problemId}`
//         );
//       }
//     });

//     socket.on("send-message", ({ room, message }) => {
//       console.log(`Message in ${room}: ${message}`);
//       socket.to(room).emit("receive-message", message);
//     });

//     socket.on("disconnect", () => {
//       console.log(`User disconnected: ${socket.id}`);
//       // Clean up waitingUsers in case someone leaves
//       for (const [problemId, sId] of waitingUsers) {
//         if (sId === socket.id) {
//           waitingUsers.delete(problemId);
//           console.log(
//             `Removed ${socket.id} from waiting list of problem ${problemId}`
//           );
//           break;
//         }
//       }
//     });
//   });
// };

// export default socketController;

// -------------------------------------------working------------------------------------

// const waitingUsers = new Map(); // Map<problemId, socketId>

// const socketController = (io) => {
//   io.on("connection", (socket) => {
//     console.log(`User connected: ${socket.id}`);

//     socket.on("join-problem", (problemId) => {
//       console.log(`User ${socket.id} wants to join problem ${problemId}`);

//       // Check if this user is already waiting for this problem
//       if (waitingUsers.get(problemId) === socket.id) {
//         console.log(
//           `User ${socket.id} is already waiting for problem ${problemId}`
//         );
//         return;
//       }

//       // Check if user is already in a room for this problem
//       const roomName = `room-${problemId}`;
//       if (socket.rooms.has(roomName)) {
//         console.log(`User ${socket.id} is already in room ${roomName}`);
//         return;
//       }

//       if (waitingUsers.has(problemId)) {
//         const partnerSocketId = waitingUsers.get(problemId);

//         // Make sure we don't match user with themselves
//         if (partnerSocketId === socket.id) {
//           console.log(`Cannot match user ${socket.id} with themselves`);
//           return;
//         }

//         // Pair them up: create a private room
//         socket.join(roomName);
//         io.sockets.sockets.get(partnerSocketId)?.join(roomName);

//         // Notify both users they are matched
//         io.to(roomName).emit("match-found", { room: roomName });
//         console.log(
//           `Matched ${socket.id} with ${partnerSocketId} in ${roomName}`
//         );

//         // Remove from waiting
//         waitingUsers.delete(problemId);
//       } else {
//         // First person to join this problem — wait for a match
//         waitingUsers.set(problemId, socket.id);
//         console.log(
//           `User ${socket.id} is waiting for a match in problem ${problemId}`
//         );
//       }
//     });

//     socket.on("send-message", ({ room, message }) => {
//       // Validate message and room
//       if (!room || !message || typeof message !== "string") {
//         return;
//       }

//       // Verify user is actually in this room
//       if (!socket.rooms.has(room)) {
//         return;
//       }

//       console.log(`Message in ${room}: ${message}`);
//       socket.to(room).emit("receive-message", message);
//     });

//     socket.on("disconnect", () => {
//       console.log(`User disconnected: ${socket.id}`);

//       // Notify partner if user was in a room
//       const rooms = Array.from(socket.rooms).filter((room) =>
//         room.startsWith("room-")
//       );
//       rooms.forEach((room) => {
//         socket.to(room).emit("partner-disconnected");
//       });

//       // Clean up waitingUsers in case someone leaves
//       for (const [problemId, sId] of waitingUsers) {
//         if (sId === socket.id) {
//           waitingUsers.delete(problemId);
//           console.log(
//             `Removed ${socket.id} from waiting list of problem ${problemId}`
//           );
//           break;
//         }
//       }
//     });
//   });
// };

// export default socketController;

const waitingUsers = new Map(); // Map<problemId, socketId>

const socketController = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join-problem", (problemId) => {
      console.log(`User ${socket.id} wants to join problem ${problemId}`);

      // Check if this user is already waiting for this problem
      if (waitingUsers.get(problemId) === socket.id) {
        console.log(
          `User ${socket.id} is already waiting for problem ${problemId}`
        );
        return;
      }

      // Check if user is already in a room for this problem
      const roomName = `room-${problemId}`;
      if (socket.rooms.has(roomName)) {
        console.log(`User ${socket.id} is already in room ${roomName}`);
        return;
      }

      if (waitingUsers.has(problemId)) {
        const partnerSocketId = waitingUsers.get(problemId);

        // Make sure we don't match user with themselves
        if (partnerSocketId === socket.id) {
          console.log(`Cannot match user ${socket.id} with themselves`);
          return;
        }

        // Pair them up: create a private room
        socket.join(roomName);
        io.sockets.sockets.get(partnerSocketId)?.join(roomName);

        // Notify both users they are matched
        io.to(roomName).emit("match-found", { room: roomName });
        console.log(
          `Matched ${socket.id} with ${partnerSocketId} in ${roomName}`
        );

        // Remove from waiting
        waitingUsers.delete(problemId);
      } else {
        // First person to join this problem — wait for a match
        waitingUsers.set(problemId, socket.id);
        console.log(
          `User ${socket.id} is waiting for a match in problem ${problemId}`
        );
      }
    });

    socket.on("send-message", ({ room, message }) => {
      // Validate message and room
      if (!room || !message) {
        return;
      }

      // Handle both old string format and new object format
      const messageData = typeof message === "string" ? message : message;

      // Verify user is actually in this room
      if (!socket.rooms.has(room)) {
        return;
      }

      console.log(`Message in ${room}:`, messageData);
      socket.to(room).emit("receive-message", messageData);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);

      // Notify partner if user was in a room
      const rooms = Array.from(socket.rooms).filter((room) =>
        room.startsWith("room-")
      );
      rooms.forEach((room) => {
        socket.to(room).emit("partner-disconnected");
      });

      // Clean up waitingUsers in case someone leaves
      for (const [problemId, sId] of waitingUsers) {
        if (sId === socket.id) {
          waitingUsers.delete(problemId);
          console.log(
            `Removed ${socket.id} from waiting list of problem ${problemId}`
          );
          break;
        }
      }
    });
  });
};

export default socketController;
