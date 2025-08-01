// const waitingUsers = new Map(); // Map<problemId, socketId>
// const userToRoom = new Map(); // Map<socketId, roomName>
// const socketToProblem = new Map();
// import addProblemToDB from "../controlers/addproblem.js";
// import removeProblemFromDB from "./removeproblem.comtroler.js";
// import { v4 as uuidv4 } from "uuid";

// const socketController = (io) => {
//   io.on("connection", (socket) => {
//     console.log(`User connected: ${socket.id}`);
//     // Handle problem addition

//     //changed async here
//     socket.on("join-problem", async (problemId) => {
//       await addProblemToDB(problemId);
//       console.log(`User ${socket.id} wants to join problem ${problemId}`);

//       // Check if this user is already waiting for this problem
//       if (waitingUsers.get(problemId) === socket.id) {
//         console.log(
//           `User ${socket.id} is already waiting for problem ${problemId}`
//         );
//         return;
//       }
//       socketToProblem.set(socket.id, problemId);

//       // Check if user is already in a room for this problem
//       const roomName = `room-${problemId}`;
//       if (socket.rooms.has(roomName)) {
//         console.log(`User ${socket.id} is already in room ${roomName}`);
//         return;
//       }

//       //
//       if (waitingUsers.has(problemId)) {
//         const partnerSocketId = waitingUsers.get(problemId);

//         if (partnerSocketId === socket.id) {
//           console.log(`Cannot match user ${socket.id} with themselves`);
//           return;
//         }

//         // Create private room
//         socket.join(roomName);
//         io.sockets.sockets.get(partnerSocketId)?.join(roomName);

//         // ✅ Track room membership
//         userToRoom.set(socket.id, roomName);
//         userToRoom.set(partnerSocketId, roomName);

//         // Notify both users
//         io.to(roomName).emit("match-found", { room: roomName });
//         console.log(
//           `Matched ${socket.id} with ${partnerSocketId} in ${roomName}`
//         );

//         waitingUsers.delete(problemId);
//       } else {
//         // First person to join this problem — wait for a match
//         waitingUsers.set(problemId, socket.id);
//         console.log(
//           `User ${socket.id} is waiting for a match in problem ${problemId}`
//         );
//       }
//     });
//     /////////////

//     socket.on("send-message", ({ room, message }) => {
//       // Validate message and room
//       if (!room || !message) {
//         return;
//       }

//       // Handle both old string format and new object format
//       const messageData = typeof message === "string" ? message : message;

//       // Verify user is actually in this room
//       if (!socket.rooms.has(room)) {
//         return;
//       }

//       console.log(`Message in ${room}:`, messageData);
//       socket.to(room).emit("receive-message", messageData);
//     });

//     socket.on("disconnect", async () => {
//       console.log(`User disconnected: ${socket.id}`);
//       await removeProblemFromDB(socketToProblem.get(socket.id));

//       const room = userToRoom.get(socket.id);
//       if (room) {
//         // Notify partner
//         socket.to(room).emit("partner-disconnected");

//         // Remove the user from the tracking map
//         userToRoom.delete(socket.id);

//         // ✅ Find the partner and re-add them to waitingUsers
//         for (const [partnerSocketId, rName] of userToRoom.entries()) {
//           if (rName === room && partnerSocketId !== socket.id) {
//             // Extract the problemId from room name
//             const problemId = room.replace("room-", "");

//             console.log(
//               `Adding ${partnerSocketId} back to waiting list for problem ${problemId}`
//             );
//             waitingUsers.set(problemId, partnerSocketId);

//             // Clean their room association
//             userToRoom.delete(partnerSocketId);

//             // Optional: force them to leave the room too
//             io.sockets.sockets.get(partnerSocketId)?.leave(room);
//             break;
//           }
//         }
//       }

//       // Clean up waitingUsers
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
const userToRoom = new Map(); // Map<socketId, roomName>
const socketToProblem = new Map(); // Map<socketId, problemId>
const problemRoomCounter = new Map(); // Map<problemId, number> - Track room numbers for each problem

import addProblemToDB from "../controlers/addproblem.js";
import removeProblemFromDB from "./removeproblem.comtroler.js";
import { v4 as uuidv4 } from "uuid";

const socketController = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join-problem", async (problemId) => {
      await addProblemToDB(problemId);
      console.log(`User ${socket.id} wants to join problem ${problemId}`);

      // Check if this user is already waiting for this problem
      if (waitingUsers.get(problemId) === socket.id) {
        console.log(
          `User ${socket.id} is already waiting for problem ${problemId}`
        );
        return;
      }

      socketToProblem.set(socket.id, problemId);

      // Check if user is already in any room for this problem
      const currentRoom = userToRoom.get(socket.id);
      if (currentRoom && currentRoom.includes(`room-${problemId}`)) {
        console.log(`User ${socket.id} is already in room ${currentRoom}`);
        return;
      }

      // Check if someone is waiting for this problem
      if (waitingUsers.has(problemId)) {
        const partnerSocketId = waitingUsers.get(problemId);

        // Ensure we don't match user with themselves
        if (partnerSocketId === socket.id) {
          console.log(`Cannot match user ${socket.id} with themselves`);
          return;
        }

        // Verify partner socket still exists and is connected
        const partnerSocket = io.sockets.sockets.get(partnerSocketId);
        if (!partnerSocket) {
          console.log(`Partner socket ${partnerSocketId} no longer exists`);
          waitingUsers.delete(problemId);
          // Continue to add current user to waiting list
        } else {
          // Get or create room number for this problem
          if (!problemRoomCounter.has(problemId)) {
            problemRoomCounter.set(problemId, 0);
          }

          const roomNumber = problemRoomCounter.get(problemId) + 1;
          problemRoomCounter.set(problemId, roomNumber);

          const roomName = `room-${problemId}-${roomNumber}`;

          // Create private room for exactly 2 users
          socket.join(roomName);
          partnerSocket.join(roomName);

          // Track room membership
          userToRoom.set(socket.id, roomName);
          userToRoom.set(partnerSocketId, roomName);

          // Notify both users
          io.to(roomName).emit("match-found", { room: roomName });
          console.log(
            `Matched ${socket.id} with ${partnerSocketId} in ${roomName}`
          );

          // Remove from waiting list since match is found
          waitingUsers.delete(problemId);
          return;
        }
      }

      // If no partner found, add to waiting list
      waitingUsers.set(problemId, socket.id);
      console.log(
        `User ${socket.id} is waiting for a match in problem ${problemId}`
      );
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
        console.log(`User ${socket.id} not in room ${room}`);
        return;
      }

      console.log(`Message in ${room}:`, messageData);
      socket.to(room).emit("receive-message", messageData);
    });

    // socket.on("disconnect", async () => {
    //   console.log(`User disconnected: ${socket.id}`);

    //   const problemId = socketToProblem.get(socket.id);
    //   const room = userToRoom.get(socket.id);

    //   if (problemId) {
    //     await removeProblemFromDB(problemId);
    //   } else if (room) {
    //     // Try extracting problemId from room name
    //     const roomParts = room.split("-");
    //     if (roomParts.length >= 3) {
    //       const extractedProblemId = roomParts.slice(1, -1).join("-");
    //       console.log(
    //         `Fallback: removing problem count using extracted ID: ${extractedProblemId}`
    //       );
    //       await removeProblemFromDB(extractedProblemId);
    //     }
    //   }

    //   // Notify partner and re-add them to waiting list
    //   if (room) {
    //     socket.to(room).emit("partner-disconnected");

    //     // Clean this user’s mapping only
    //     userToRoom.delete(socket.id);

    //     // Check for partner
    //     for (const [partnerSocketId, rName] of userToRoom.entries()) {
    //       if (rName === room && partnerSocketId !== socket.id) {
    //         const partnerSocket = io.sockets.sockets.get(partnerSocketId);

    //         if (partnerSocket) {
    //           partnerSocket.leave(room);

    //           const roomParts = room.split("-");
    //           if (roomParts.length >= 3) {
    //             const roomProblemId = roomParts.slice(1, -1).join("-");
    //             waitingUsers.set(roomProblemId, partnerSocketId);
    //             socketToProblem.set(partnerSocketId, roomProblemId);
    //             // DO NOT delete partner’s userToRoom or socketToProblem!
    //           }
    //         }
    //         break;
    //       }
    //     }
    //   }

    //   // Clean from waiting list
    //   for (const [pid, sId] of waitingUsers.entries()) {
    //     if (sId === socket.id) {
    //       waitingUsers.delete(pid);
    //       console.log(
    //         `Removed ${socket.id} from waiting list of problem ${pid}`
    //       );
    //       break;
    //     }
    //   }

    //   // Clean only this socket’s data
    //   socketToProblem.delete(socket.id);
    // });
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.id}`);

      // STEP 1: ALWAYS decrement count for this user (they joined, so they must decrement)
      const problemId = socketToProblem.get(socket.id);
      if (problemId) {
        console.log(
          `Decrementing count for user ${socket.id} with problem ${problemId}`
        );
        await removeProblemFromDB(problemId);
      }

      // STEP 2: Handle room cleanup if user was in a room
      const room = userToRoom.get(socket.id);
      if (room) {
        console.log(`User ${socket.id} was in room ${room}`);

        // Notify partner about disconnection
        socket.to(room).emit("partner-disconnected");

        // Remove this user from room tracking
        userToRoom.delete(socket.id);

        // Find and handle partner
        for (const [partnerSocketId, rName] of userToRoom.entries()) {
          if (rName === room && partnerSocketId !== socket.id) {
            console.log(`Found partner ${partnerSocketId} in same room`);

            const partnerSocket = io.sockets.sockets.get(partnerSocketId);
            if (partnerSocket) {
              // Remove partner from room
              partnerSocket.leave(room);
              userToRoom.delete(partnerSocketId);

              // Extract problemId from room name
              const roomParts = room.split("-");
              if (roomParts.length >= 3) {
                const roomProblemId = roomParts.slice(1, -1).join("-");

                // Put partner back in waiting list
                waitingUsers.set(roomProblemId, partnerSocketId);
                socketToProblem.set(partnerSocketId, roomProblemId); // Ensure proper mapping

                console.log(
                  `Partner ${partnerSocketId} moved back to waiting for problem ${roomProblemId}`
                );
              }
            }
            break;
          }
        }
      }

      // STEP 3: Clean up from waiting list (if user was waiting)
      for (const [pid, sId] of waitingUsers.entries()) {
        if (sId === socket.id) {
          waitingUsers.delete(pid);
          console.log(
            `Removed ${socket.id} from waiting list of problem ${pid}`
          );
          break;
        }
      }

      // STEP 4: Clean up all mappings for this socket
      socketToProblem.delete(socket.id);

      console.log(`Cleanup completed for user ${socket.id}`);
    });
  });
};

export default socketController;
