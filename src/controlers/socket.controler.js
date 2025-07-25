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

import removeProblemFromDB from "./removeproblem.comtroler.js";
const waitingUsers = new Map(); // Map<problemId, socketId>
const userToRoom = new Map(); // Map<socketId, roomName>

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

      //
      if (waitingUsers.has(problemId)) {
        const partnerSocketId = waitingUsers.get(problemId);

        if (partnerSocketId === socket.id) {
          console.log(`Cannot match user ${socket.id} with themselves`);
          return;
        }

        // Create private room
        socket.join(roomName);
        io.sockets.sockets.get(partnerSocketId)?.join(roomName);

        // ✅ Track room membership
        userToRoom.set(socket.id, roomName);
        userToRoom.set(partnerSocketId, roomName);

        // Notify both users
        io.to(roomName).emit("match-found", { room: roomName });
        console.log(
          `Matched ${socket.id} with ${partnerSocketId} in ${roomName}`
        );

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

    // socket.on("disconnect", () => {
    //   console.log(`User disconnected: ${socket.id}`);

    //   // Notify partner
    //   const room = userToRoom.get(socket.id);
    //   if (room) {
    //     socket.to(room).emit("partner-disconnected");
    //     userToRoom.delete(socket.id);
    //   }

    //   // Clean up waitingUsers
    //   for (const [problemId, sId] of waitingUsers) {
    //     if (sId === socket.id) {
    //       waitingUsers.delete(problemId);
    //       console.log(
    //         `Removed ${socket.id} from waiting list of problem ${problemId}`
    //       );
    //       break;
    //     }
    //   }
    // });
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);

      const room = userToRoom.get(socket.id);
      if (room) {
        // Notify partner
        socket.to(room).emit("partner-disconnected");

        // Remove the user from the tracking map
        userToRoom.delete(socket.id);

        // ✅ Find the partner and re-add them to waitingUsers
        for (const [partnerSocketId, rName] of userToRoom.entries()) {
          if (rName === room && partnerSocketId !== socket.id) {
            // Extract the problemId from room name
            const problemId = room.replace("room-", "");

            console.log(
              `Adding ${partnerSocketId} back to waiting list for problem ${problemId}`
            );
            waitingUsers.set(problemId, partnerSocketId);

            // Clean their room association
            userToRoom.delete(partnerSocketId);

            // Optional: force them to leave the room too
            io.sockets.sockets.get(partnerSocketId)?.leave(room);
            break;
          }
        }
      }

      // Clean up waitingUsers
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
