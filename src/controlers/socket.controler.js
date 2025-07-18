// // backend/socketController.js
// import axios from "axios";
// import addProblemToDB from "./addproblem.js"; // Assuming this is the correct path
// import removeProblemFromDB from "./removeproblem.comtroler.js"; // Assuming this is the correct path
// const waitingUsers = {}; // { problemId: [socket1, socket2] }
// const activeUsers = {}; // { problemId: number }

// async function getLeetCodeLink(problemId) {
//   try {
//     const res = await axios.get("https://leetcode.com/api/problems/all/");
//     const data = res.data.stat_status_pairs;
//     for (const q of data) {
//       if (q.stat.frontend_question_id === parseInt(problemId)) {
//         return `https://leetcode.com/problems/${q.stat.question__title_slug}/`;
//       }
//     }
//     return "Problem not found";
//   } catch (err) {
//     console.error("Failed to fetch LeetCode link:", err.message);
//     return "Problem not found";
//   }
// }

// export default function socketController(io) {
//   io.on("connection", (socket) => {
//     let joinedProblem = null;
//     let partnerSocket = null;
//     console.log("New user connected:", socket.id);

//     // socket.on("join-problem", async (problemId) => {
//     //   joinedProblem = problemId;

//     //   if (!waitingUsers[problemId]) waitingUsers[problemId] = [];
//     //   if (!activeUsers[problemId]) activeUsers[problemId] = 0;

//     //   activeUsers[problemId]++;

//     //   // Send problem link to this user
//     //   const problemLink = await getLeetCodeLink(problemId);
//     //   socket.emit("chat-message", {
//     //     message: `Problem Link: ${problemLink}`,
//     //     username: "System",
//     //   });

//     //   // Notify current active users
//     //   io.to(problemId).emit("online-users", activeUsers[problemId]);

//     //   // Join socket room for broadcasting
//     //   socket.join(problemId);

//     //   // Try to find a partner
//     //   const queue = waitingUsers[problemId];

//     //   if (queue.length > 0) {
//     //     partnerSocket = queue.shift();

//     //     partnerSocket.partner = socket;
//     //     socket.partner = partnerSocket;

//     //     socket.emit("matched", {});
//     //     partnerSocket.emit("matched", {});

//     //     socket.emit("chat-message", {
//     //       message: "Partner matched! You can start chatting now.",
//     //       username: "System",
//     //     });
//     //     partnerSocket.emit("chat-message", {
//     //       message: "Partner matched! You can start chatting now.",
//     //       username: "System",
//     //     });
//     //   } else {
//     //     waitingUsers[problemId].push(socket);
//     //     socket.emit("chat-message", {
//     //       message: "Matching buddy...",
//     //       username: "System",
//     //     });
//     //   }
//     // });
//     socket.on("join-problem", async (problemId) => {
//       joinedProblem = problemId;
//       console.log(`User ${socket.id} joining problem ${problemId}`);

//       if (!waitingUsers[problemId]) waitingUsers[problemId] = [];
//       if (!activeUsers[problemId]) activeUsers[problemId] = 0;

//       activeUsers[problemId]++;

//       // Send problem link to this user
//       const problemLink = await getLeetCodeLink(problemId);
//       socket.emit("chat-message", {
//         message: `Problem Link: ${problemLink}`,
//         username: "System",
//       });

//       // Join socket room for broadcasting
//       socket.join(problemId);

//       // Try to find a partner
//       const queue = waitingUsers[problemId];
//       console.log(`Queue length for problem ${problemId}: ${queue.length}`);

//       if (queue.length > 0) {
//         partnerSocket = queue.shift();
//         console.log(`Matching ${socket.id} with ${partnerSocket.id}`);

//         partnerSocket.partner = socket;
//         socket.partner = partnerSocket;

//         socket.emit("matched", {});
//         partnerSocket.emit("matched", {});

//         socket.emit("chat-message", {
//           message: "Partner matched! You can start chatting now.",
//           username: "System",
//         });
//         partnerSocket.emit("chat-message", {
//           message: "Partner matched! You can start chatting now.",
//           username: "System",
//         });
//       } else {
//         console.log(
//           `Adding ${socket.id} to waiting queue for problem ${problemId}`
//         );
//         waitingUsers[problemId].push(socket);
//         socket.emit("chat-message", {
//           message: "Matching buddy...",
//           username: "System",
//         });
//       }

//       // Notify current active users
//       io.to(problemId).emit("online-users", activeUsers[problemId]);
//     });

//     socket.on("chat-message", ({ message }) => {
//       if (socket.partner) {
//         socket.partner.emit("chat-message", {
//           message,
//           username: "Partner",
//         });
//       }
//       socket.emit("chat-message", {
//         message,
//         username: "You",
//       });
//     });

//     // socket.on("disconnect", () => {
//     //   if (joinedProblem) {
//     //     activeUsers[joinedProblem]--;
//     //     if (activeUsers[joinedProblem] <= 0) {
//     //       delete activeUsers[joinedProblem];
//     //     }

//     //     // Clean from waiting list
//     //     const index = waitingUsers[joinedProblem]?.indexOf(socket);
//     //     if (index !== -1) waitingUsers[joinedProblem].splice(index, 1);

//     //     if (socket.partner) {
//     //       socket.partner.emit("chat-message", {
//     //         message: "Your partner has disconnected.",
//     //         username: "System",
//     //       });

//     //       // Requeue the partner
//     //       const other = socket.partner;
//     //       socket.partner.partner = null;
//     //       socket.partner = null;

//     //       if (!waitingUsers[joinedProblem]) waitingUsers[joinedProblem] = [];
//     //       waitingUsers[joinedProblem].push(other);
//     //     }
//     //   }
//     // });
//     socket.on("disconnect", () => {
//       console.log(`User ${socket.id} disconnected`);

//       if (joinedProblem) {
//         activeUsers[joinedProblem]--;
//         if (activeUsers[joinedProblem] <= 0) {
//           delete activeUsers[joinedProblem];
//         }

//         // Clean from waiting list
//         if (waitingUsers[joinedProblem]) {
//           const index = waitingUsers[joinedProblem].indexOf(socket);
//           if (index !== -1) {
//             waitingUsers[joinedProblem].splice(index, 1);
//             console.log(`Removed ${socket.id} from waiting queue`);
//           }
//         }

//         if (socket.partner) {
//           console.log(`${socket.id} had a partner: ${socket.partner.id}`);
//           socket.partner.emit("chat-message", {
//             message: "Your partner has disconnected.",
//             username: "System",
//           });

//           // Requeue the partner
//           const other = socket.partner;
//           other.partner = null;
//           socket.partner = null;

//           if (!waitingUsers[joinedProblem]) waitingUsers[joinedProblem] = [];
//           waitingUsers[joinedProblem].push(other);

//           other.emit("chat-message", {
//             message: "Matching buddy...",
//             username: "System",
//           });
//         }

//         // Update online users count
//         io.to(joinedProblem).emit(
//           "online-users",
//           activeUsers[joinedProblem] || 0
//         );
//       }
//     });
//   });
// }

// backend/socketController.js

import axios from "axios";

const waitingUsers = {}; // { problemId: [socket1, socket2, ...] }
const activeUsers = {}; // { problemId: count }

async function getLeetCodeLink(problemId) {
  try {
    const res = await axios.get("https://leetcode.com/api/problems/all/");
    const data = res.data.stat_status_pairs;
    for (const q of data) {
      if (q.stat.frontend_question_id === parseInt(problemId)) {
        return `https://leetcode.com/problems/${q.stat.question__title_slug}/`;
      }
    }
    return "Problem not found";
  } catch (err) {
    console.error("Failed to fetch LeetCode link:", err.message);
    return "Problem not found";
  }
}

export default function socketController(io) {
  io.on("connection", (socket) => {
    let joinedProblem = null;
    let partnerSocket = null;

    console.log(`New user connected: ${socket.id}`);

    socket.on("join-problem", async (problemId) => {
      if (joinedProblem) {
        socket.emit("chat-message", {
          message: "You are already in a session.",
          username: "System",
        });
        return;
      }

      joinedProblem = problemId;
      console.log(`User ${socket.id} joining problem ${problemId}`);

      if (!waitingUsers[problemId]) waitingUsers[problemId] = [];
      if (!activeUsers[problemId]) activeUsers[problemId] = 0;
      activeUsers[problemId]++;

      const problemLink = await getLeetCodeLink(problemId);
      socket.emit("chat-message", {
        message: `Problem Link: ${problemLink}`,
        username: "System",
      });

      socket.join(problemId);

      const queue = waitingUsers[problemId];

      // Prevent matching with self
      while (queue.length > 0) {
        const potentialPartner = queue.shift();
        if (potentialPartner.id !== socket.id) {
          partnerSocket = potentialPartner;
          break;
        }
      }

      if (partnerSocket) {
        console.log(`Matching ${socket.id} with ${partnerSocket.id}`);

        partnerSocket.partner = socket;
        socket.partner = partnerSocket;

        socket.emit("matched", {});
        partnerSocket.emit("matched", {});

        socket.emit("chat-message", {
          message: "Partner matched! You can start chatting now.",
          username: "System",
        });
        partnerSocket.emit("chat-message", {
          message: "Partner matched! You can start chatting now.",
          username: "System",
        });
      } else {
        console.log(
          `Adding ${socket.id} to waiting queue for problem ${problemId}`
        );
        waitingUsers[problemId].push(socket);
        socket.emit("chat-message", {
          message: "Matching buddy...",
          username: "System",
        });
      }

      io.to(problemId).emit("online-users", activeUsers[problemId]);
    });

    socket.on("chat-message", ({ message }) => {
      if (socket.partner) {
        socket.partner.emit("chat-message", {
          message,
          username: "Partner",
        });
      }
      socket.emit("chat-message", {
        message,
        username: "You",
      });
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.id} disconnected`);

      if (joinedProblem) {
        activeUsers[joinedProblem]--;
        if (activeUsers[joinedProblem] <= 0) {
          delete activeUsers[joinedProblem];
        }

        if (waitingUsers[joinedProblem]) {
          const index = waitingUsers[joinedProblem].indexOf(socket);
          if (index !== -1) {
            waitingUsers[joinedProblem].splice(index, 1);
            console.log(`Removed ${socket.id} from waiting queue`);
          }
        }

        if (socket.partner) {
          console.log(`${socket.id} had a partner: ${socket.partner.id}`);
          socket.partner.emit("chat-message", {
            message:
              "Your partner has disconnected. Re-queuing you for a new match.",
            username: "System",
          });

          const other = socket.partner;
          other.partner = null;
          socket.partner = null;

          if (!waitingUsers[joinedProblem]) waitingUsers[joinedProblem] = [];
          waitingUsers[joinedProblem].push(other);

          other.emit("chat-message", {
            message: "Matching buddy...",
            username: "System",
          });
        }

        io.to(joinedProblem).emit(
          "online-users",
          activeUsers[joinedProblem] || 0
        );
      }
    });
  });
}
