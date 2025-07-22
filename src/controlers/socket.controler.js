// import fetch from "node-fetch";
// // Pure socket.io buddy matcher controller (no axios, no LeetCode API)


// // Helper to fetch LeetCode link
// async function getLeetCodeLink(problemNumber) {
//   const url = "https://leetcode.com/api/problems/all/";
//   try {
//     const response = await fetch(url);
//     if (!response.ok) return "Problem not found";
//     const data = await response.json();
//     for (const question of data.stat_status_pairs) {
//       if (question.stat.frontend_question_id === parseInt(problemNumber)) {
//         const slug = question.stat.question__title_slug;
//         return `https://leetcode.com/problems/${slug}/`;
//       }
//     }
//     return "Problem not found";
//   } catch (e) {
//     return "Problem not found";
//   }
// }

// const waitingUsers = {}; // { problemId: [socket, ...] }
// const activeUsers = {};  // { problemId: count }

// export default function socketController(io) {
//   io.on("connection", (socket) => {
//     console.log("Socket connected:", socket.id);
//     socket.currentProblem = null;
//     socket.partner = null;

//     // User joins a problem
//     socket.on("join-problem", async (problemId) => {
//       // If already in a problem, ignore
//       if (socket.currentProblem === problemId) return;
//       // If already in another problem, leave it first
//       if (socket.currentProblem) {
//         socket.emit("chat-message", {
//           message: "You are already in a session.",
//           username: "System",
//         });
//         return;
//       }
//       socket.currentProblem = problemId;
//       if (!waitingUsers[problemId]) waitingUsers[problemId] = [];
//       if (!activeUsers[problemId]) activeUsers[problemId] = 0;
//       activeUsers[problemId]++;
//       socket.join(problemId);

//       // Fetch and send LeetCode link as first message
//       const problemLink = await getLeetCodeLink(problemId);
//       socket.emit("chat-message", {
//         message: `Problem Link: ${problemLink}`,
//         username: "System",
//       });

//       broadcastUserCount(problemId);

//       // Try to match
//       if (waitingUsers[problemId].length > 0) {
//         const partner = waitingUsers[problemId].shift();
//         socket.partner = partner;
//         partner.partner = socket;
//         socket.emit("matched");
//         partner.emit("matched");
//         socket.emit("chat-message", { message: "Partner matched! You can start chatting now.", username: "System" });
//         partner.emit("chat-message", { message: "Partner matched! You can start chatting now.", username: "System" });
//       } else {
//         waitingUsers[problemId].push(socket);
//         socket.emit("waiting");
//         socket.emit("chat-message", { message: "Matching buddy...", username: "System" });
//       }
//     });

//     // User leaves a problem (manual or on unmount)
//     socket.on("leave-problem", (problemId) => {
//       if (socket.currentProblem !== problemId) return;
//       cleanupUser(socket, problemId);
//     });

//     // User sends a chat message
//     socket.on("chat-message", ({ message }) => {
//       if (socket.partner) {
//         socket.partner.emit("chat-message", { message, username: "Partner" });
//       }
//       socket.emit("chat-message", { message, username: "You" });
//     });

//     // User disconnects
//     socket.on("disconnect", () => {
//       if (socket.currentProblem) {
//         cleanupUser(socket, socket.currentProblem);
//       }
//     });

//     // Helper to clean up user from all structures
//     function cleanupUser(sock, problemId) {
//       // Remove from waiting queue
//       if (waitingUsers[problemId]) {
//         waitingUsers[problemId] = waitingUsers[problemId].filter(s => s !== sock);
//       }
//       // Notify partner and requeue
//       if (sock.partner) {
//         const partner = sock.partner;
//         partner.partner = null;
//         waitingUsers[problemId].push(partner);
//         partner.emit("waiting");
//         partner.emit("chat-message", { message: "Your partner has disconnected.", username: "System" });
//       }
//       sock.partner = null;
//       sock.leave(problemId);
//       // Decrement online count
//       if (activeUsers[problemId]) {
//         activeUsers[problemId]--;
//         if (activeUsers[problemId] <= 0) delete activeUsers[problemId];
//       }
//       broadcastUserCount(problemId);
//       sock.currentProblem = null;
//     }

//     function broadcastUserCount(problemId) {
//       const count = activeUsers[problemId] || 0;
//       io.to(problemId).emit("online-users", count);
//     }
//   });
// }

// import fetch from "node-fetch";

// // Helper to fetch LeetCode link
// async function getLeetCodeLink(problemNumber) {
//   const url = "https://leetcode.com/api/problems/all/";
//   try {
//     const response = await fetch(url, { 
//       timeout: 5000,
//       headers: { 'User-Agent': 'Mozilla/5.0' }
//     });
//     if (!response.ok) return "Problem not found";
//     const data = await response.json();
//     for (const question of data.stat_status_pairs) {
//       if (question.stat.frontend_question_id === parseInt(problemNumber)) {
//         const slug = question.stat.question__title_slug;
//         return `https://leetcode.com/problems/${slug}/`;
//       }
//     }
//     return "Problem not found";
//   } catch (e) {
//     console.error("Error fetching LeetCode link:", e);
//     return `https://leetcode.com/problems/problem-${problemNumber}/`;
//   }
// }

// // Global state
// const roomState = {
//   waitingUsers: {}, // { problemId: [socketId, ...] }
//   activeUsers: {},  // { problemId: count }
//   userSessions: {}, // { socketId: { problemId, partnerId, isMatched, joinTime } }
//   roomPairs: {}     // { problemId: [[socket1, socket2], ...] }
// };

// // Helper to get active problems for API
// function getActiveProblems() {
//   const active = {};
//   Object.keys(roomState.activeUsers).forEach(problemId => {
//     if (roomState.activeUsers[problemId] > 0) {
//       active[problemId] = roomState.activeUsers[problemId];
//     }
//   });
//   return active;
// }

// // Helper to broadcast user count
// function broadcastUserCount(io, problemId) {
//   const count = roomState.activeUsers[problemId] || 0;
//   console.log(`📊 Broadcasting user count for problem ${problemId}: ${count}`);
//   io.to(problemId).emit("online-users", count);
// }

// // Helper to clean up disconnected sockets from waiting queue
// function cleanWaitingQueue(problemId) {
//   if (!roomState.waitingUsers[problemId]) return;
  
//   roomState.waitingUsers[problemId] = roomState.waitingUsers[problemId].filter(socketId => {
//     return roomState.userSessions[socketId] != null;
//   });
// }

// // Helper to find and pair users
// function tryMatchUsers(io, problemId) {
//   cleanWaitingQueue(problemId);
  
//   if (!roomState.waitingUsers[problemId] || roomState.waitingUsers[problemId].length < 2) {
//     console.log(`⏳ Not enough users to match in problem ${problemId}`);
//     return false;
//   }

//   const user1Id = roomState.waitingUsers[problemId].shift();
//   const user2Id = roomState.waitingUsers[problemId].shift();
  
//   const socket1 = io.sockets.sockets.get(user1Id);
//   const socket2 = io.sockets.sockets.get(user2Id);

//   if (!socket1 || !socket2 || !socket1.connected || !socket2.connected) {
//     console.log(`❌ One of the users disconnected during matching`);
//     // Add back any valid users
//     if (socket1 && socket1.connected) roomState.waitingUsers[problemId].unshift(user1Id);
//     if (socket2 && socket2.connected) roomState.waitingUsers[problemId].unshift(user2Id);
//     return false;
//   }

//   // Create partnership
//   const session1 = roomState.userSessions[user1Id];
//   const session2 = roomState.userSessions[user2Id];
  
//   session1.partnerId = user2Id;
//   session1.isMatched = true;
//   session2.partnerId = user1Id;
//   session2.isMatched = true;

//   console.log(`🤝 Matched users ${user1Id} and ${user2Id} in problem ${problemId}`);

//   // Notify both users
//   socket1.emit("matched");
//   socket2.emit("matched");
  
//   socket1.emit("chat-message", { 
//     message: "Partner matched! You can start chatting now.", 
//     username: "System" 
//   });
//   socket2.emit("chat-message", { 
//     message: "Partner matched! You can start chatting now.", 
//     username: "System" 
//   });

//   return true;
// }

// // Helper to handle user leaving
// function handleUserLeave(io, socketId, problemId) {
//   const session = roomState.userSessions[socketId];
//   if (!session || session.problemId !== problemId) return;

//   console.log(`👋 User ${socketId} leaving problem ${problemId}`);

//   // Remove from waiting queue
//   if (roomState.waitingUsers[problemId]) {
//     roomState.waitingUsers[problemId] = roomState.waitingUsers[problemId].filter(id => id !== socketId);
//   }

//   // Handle partner
//   if (session.partnerId && session.isMatched) {
//     const partnerId = session.partnerId;
//     const partnerSession = roomState.userSessions[partnerId];
//     const partnerSocket = io.sockets.sockets.get(partnerId);

//     if (partnerSession && partnerSocket && partnerSocket.connected) {
//       console.log(`💔 Notifying partner ${partnerId} about disconnect`);
      
//       // Reset partner's session
//       partnerSession.partnerId = null;
//       partnerSession.isMatched = false;

//       // Add partner back to waiting queue
//       if (!roomState.waitingUsers[problemId]) roomState.waitingUsers[problemId] = [];
//       roomState.waitingUsers[problemId].push(partnerId);

//       // Notify partner
//       partnerSocket.emit("waiting");
//       partnerSocket.emit("chat-message", { 
//         message: "Your partner has disconnected. Looking for a new buddy...", 
//         username: "System" 
//       });

//       // Try to match the partner with someone else
//       setTimeout(() => tryMatchUsers(io, problemId), 500);
//     }
//   }

//   // Update counters
//   if (roomState.activeUsers[problemId]) {
//     roomState.activeUsers[problemId]--;
//     if (roomState.activeUsers[problemId] <= 0) {
//       delete roomState.activeUsers[problemId];
//       delete roomState.waitingUsers[problemId];
//     }
//   }

//   // Reset user session
//   session.problemId = null;
//   session.partnerId = null;
//   session.isMatched = false;

//   // Broadcast updated count
//   broadcastUserCount(io, problemId);
// }

// export default function socketController(io) {
//   // API endpoint for active problems
//   io.engine.on("connection_error", (err) => {
//     console.log("Connection error:", err.req, err.code, err.message, err.context);
//   });

//   io.on("connection", (socket) => {
//     console.log(`🔌 Socket connected: ${socket.id}`);
    
//     // Initialize user session
//     roomState.userSessions[socket.id] = {
//       problemId: null,
//       partnerId: null,
//       isMatched: false,
//       joinTime: Date.now()
//     };

//     socket.on("join-problem", async (problemId) => {
//       console.log(`🚪 ${socket.id} attempting to join problem ${problemId}`);
      
//       const session = roomState.userSessions[socket.id];
//       if (!session) {
//         console.log(`❌ No session found for ${socket.id}`);
//         return;
//       }

//       // If already in this problem, send current state
//       if (session.problemId === problemId) {
//         console.log(`ℹ️  ${socket.id} already in problem ${problemId}`);
//         broadcastUserCount(io, problemId);
//         return;
//       }

//       // If in another problem, leave it first
//       if (session.problemId && session.problemId !== problemId) {
//         handleUserLeave(io, socket.id, session.problemId);
//         socket.leave(session.problemId);
//       }

//       // Join the new problem
//       session.problemId = problemId;
//       socket.join(problemId);

//       // Initialize problem data structures
//       if (!roomState.waitingUsers[problemId]) roomState.waitingUsers[problemId] = [];
//       if (!roomState.activeUsers[problemId]) roomState.activeUsers[problemId] = 0;
      
//       roomState.activeUsers[problemId]++;
//       console.log(`📈 Active users in problem ${problemId}: ${roomState.activeUsers[problemId]}`);

//       // Send problem link
//       try {
//         const problemLink = await getLeetCodeLink(problemId);
//         socket.emit("chat-message", {
//           message: `Problem Link: ${problemLink}`,
//           username: "System",
//         });
//         console.log(`🔗 Sent problem link to ${socket.id}`);
//       } catch (error) {
//         console.error("Error sending problem link:", error);
//       }

//       // Broadcast updated user count
//       broadcastUserCount(io, problemId);

//       // Add to waiting queue and try to match
//       roomState.waitingUsers[problemId].push(socket.id);
//       socket.emit("waiting");
//       socket.emit("chat-message", { 
//         message: "Matching buddy...", 
//         username: "System" 
//       });

//       console.log(`⏳ ${socket.id} added to waiting queue for problem ${problemId}`);
      
//       // Try to match immediately
//       const matched = tryMatchUsers(io, problemId);
//       if (!matched) {
//         console.log(`🔍 No immediate match for ${socket.id} in problem ${problemId}`);
//       }
//     });

//     socket.on("leave-problem", (problemId) => {
//       console.log(`🚪 ${socket.id} manually leaving problem ${problemId}`);
//       handleUserLeave(io, socket.id, problemId);
//       socket.leave(problemId);
//     });

//     socket.on("chat-message", ({ message }) => {
//       const session = roomState.userSessions[socket.id];
      
//       if (!session || !session.isMatched || !session.partnerId) {
//         console.log(`❌ ${socket.id} tried to send message but not matched`);
//         socket.emit("chat-message", { 
//           message: "You need to be matched with a partner to chat.", 
//           username: "System" 
//         });
//         return;
//       }

//       const partnerSocket = io.sockets.sockets.get(session.partnerId);
//       if (partnerSocket && partnerSocket.connected) {
//         partnerSocket.emit("chat-message", { message, username: "Partner" });
//         socket.emit("chat-message", { message, username: "You" });
//         console.log(`💬 Message relayed between ${socket.id} and ${session.partnerId}`);
//       } else {
//         socket.emit("chat-message", { 
//           message: "Your partner seems to be disconnected.", 
//           username: "System" 
//         });
//       }
//     });

//     socket.on("disconnect", (reason) => {
//       console.log(`🔌 Socket disconnected: ${socket.id}, reason: ${reason}`);
//       const session = roomState.userSessions[socket.id];
      
//       if (session && session.problemId) {
//         handleUserLeave(io, socket.id, session.problemId);
//       }
      
//       delete roomState.userSessions[socket.id];
//     });

//     socket.on("error", (error) => {
//       console.error(`Socket error for ${socket.id}:`, error);
//     });
//   });

//   // Periodic cleanup
//   setInterval(() => {
//     const now = Date.now();
//     Object.keys(roomState.userSessions).forEach(socketId => {
//       const session = roomState.userSessions[socketId];
//       const socket = io.sockets.sockets.get(socketId);
      
//       // Clean up stale sessions (older than 5 minutes)
//       if (!socket || !socket.connected || (now - session.joinTime > 300000)) {
//         console.log(`🧹 Cleaning up stale session: ${socketId}`);
//         if (session.problemId) {
//           handleUserLeave(io, socketId, session.problemId);
//         }
//         delete roomState.userSessions[socketId];
//       }
//     });
//   }, 30000);

//   // Return function to get active problems for API
//   return {
//     getActiveProblems: () => getActiveProblems()
//   };
// }



import fetch from "node-fetch";

// Helper to fetch LeetCode link
async function getLeetCodeLink(problemNumber) {
  const url = "https://leetcode.com/api/problems/all/";
  try {
    const response = await fetch(url, {
      timeout: 5000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!response.ok) return "Problem not found";
    const data = await response.json();
    for (const question of data.stat_status_pairs) {
      if (question.stat.frontend_question_id === parseInt(problemNumber)) {
        const slug = question.stat.question__title_slug;
        return `https://leetcode.com/problems/${slug}/`;
      }
    }
    return "Problem not found";
  } catch (e) {
    console.error("Error fetching LeetCode link:", e);
    return `https://leetcode.com/problems/problem-${problemNumber}/`;
  }
}

// Global state
const roomState = {
  waitingUsers: {}, // { problemId: [socketId, ...] }
  activeUsers: {},  // { problemId: count }
  userSessions: {}, // { socketId: { problemId, partnerId, isMatched, joinTime } }
};

// Helper to get active problems for API
function getActiveProblems() {
  const active = {};
  Object.keys(roomState.activeUsers).forEach(problemId => {
    if (roomState.activeUsers[problemId] > 0) {
      active[problemId] = roomState.activeUsers[problemId];
    }
  });
  return active;
}

// Helper to broadcast user count
function broadcastUserCount(io, problemId) {
  const count = roomState.activeUsers[problemId] || 0;
  console.log(`📊 Broadcasting user count for problem ${problemId}: ${count}`);
  io.to(problemId).emit("online-users", count);
}

// Helper to clean up disconnected sockets from waiting queue
function cleanWaitingQueue(problemId) {
  if (!roomState.waitingUsers[problemId]) return;

  roomState.waitingUsers[problemId] = roomState.waitingUsers[problemId].filter(socketId => {
    return roomState.userSessions[socketId] != null;
  });
}

// Helper to find and pair users (FIXED to prevent race conditions)
function tryMatchUsers(io, problemId) {
  cleanWaitingQueue(problemId);

  const waitingQueue = roomState.waitingUsers[problemId];
  if (!waitingQueue || waitingQueue.length < 2) {
    console.log(`⏳ Not enough users to match in problem ${problemId}`);
    return false;
  }

  // Find two valid, connected users before modifying the queue
  let user1Id, user2Id;
  let user1Index = -1, user2Index = -1;

  for (let i = 0; i < waitingQueue.length; i++) {
    const socket = io.sockets.sockets.get(waitingQueue[i]);
    if (socket && socket.connected) {
      if (user1Index === -1) {
        user1Index = i;
        user1Id = waitingQueue[i];
      } else {
        user2Index = i;
        user2Id = waitingQueue[i];
        break;
      }
    }
  }

  // If a valid pair was found, match them
  if (user1Index !== -1 && user2Index !== -1) {
    // Remove users from the queue *after* confirming they are a valid pair
    waitingQueue.splice(user2Index, 1);
    waitingQueue.splice(user1Index, 1);

    const socket1 = io.sockets.sockets.get(user1Id);
    const socket2 = io.sockets.sockets.get(user2Id);
    
    // Create partnership
    const session1 = roomState.userSessions[user1Id];
    const session2 = roomState.userSessions[user2Id];
    
    session1.partnerId = user2Id;
    session1.isMatched = true;
    session2.partnerId = user1Id;
    session2.isMatched = true;

    console.log(`🤝 Matched users ${user1Id} and ${user2Id} in problem ${problemId}`);

    // Notify both users
    socket1.emit("matched");
    socket2.emit("matched");
    
    const systemMessage = { 
      message: "Partner matched! You can start chatting now.", 
      username: "System" 
    };
    socket1.emit("chat-message", systemMessage);
    socket2.emit("chat-message", systemMessage);

    return true;
  }
  
  console.log(`🔍 No valid pair found in waiting queue for problem ${problemId}`);
  return false;
}


// Helper to handle user leaving (FIXED to be safer)
function handleUserLeave(io, socketId, problemId) {
  const session = roomState.userSessions[socketId];
  if (!session || session.problemId !== problemId) return;

  console.log(`👋 User ${socketId} leaving problem ${problemId}`);

  // Remove from waiting queue
  if (roomState.waitingUsers[problemId]) {
    roomState.waitingUsers[problemId] = roomState.waitingUsers[problemId].filter(id => id !== socketId);
  }

  // Handle partner
  if (session.partnerId && session.isMatched) {
    const partnerId = session.partnerId;
    const partnerSession = roomState.userSessions[partnerId];
    const partnerSocket = io.sockets.sockets.get(partnerId);

    if (partnerSession && partnerSocket && partnerSocket.connected) {
      console.log(`💔 Notifying partner ${partnerId} about disconnect`);
      
      partnerSession.partnerId = null;
      partnerSession.isMatched = false;

      if (!roomState.waitingUsers[problemId]) roomState.waitingUsers[problemId] = [];
      roomState.waitingUsers[problemId].push(partnerId);

      partnerSocket.emit("waiting");
      partnerSocket.emit("chat-message", { 
        message: "Your partner has disconnected. Looking for a new buddy...", 
        username: "System" 
      });

      // Try to match the partner with someone else after a short delay
      setTimeout(() => tryMatchUsers(io, problemId), 500);
    }
  }

  // Update counters safely without deleting keys
  if (roomState.activeUsers[problemId]) {
    roomState.activeUsers[problemId]--;
    if (roomState.activeUsers[problemId] < 0) {
      roomState.activeUsers[problemId] = 0; // Prevent negative counts
    }
  }

  // Reset user session properties related to the room
  session.problemId = null;
  session.partnerId = null;
  session.isMatched = false;

  broadcastUserCount(io, problemId);
}

export default function socketController(io) {
  io.engine.on("connection_error", (err) => {
    console.log("Connection error:", err.req, err.code, err.message, err.context);
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);
    
    // Initialize user session
    roomState.userSessions[socket.id] = {
      problemId: null,
      partnerId: null,
      isMatched: false,
      joinTime: Date.now()
    };

    socket.on("join-problem", async (problemId) => {
      console.log(`🚪 ${socket.id} attempting to join problem ${problemId}`);
      
      const session = roomState.userSessions[socket.id];
      if (!session) {
        console.log(`❌ No session found for ${socket.id}`);
        return;
      }

      // FIXED: Handle re-join/re-sync correctly
      if (session.problemId === problemId) {
        console.log(`ℹ️  ${socket.id} is re-syncing with problem ${problemId}`);
        // Re-send current state to the client for UI sync
        if (session.isMatched && session.partnerId) {
          socket.emit("matched");
        } else {
          socket.emit("waiting");
          // Ensure user is in the waiting queue if they aren't matched
          if (!roomState.waitingUsers[problemId]?.includes(socket.id)) {
              if(!roomState.waitingUsers[problemId]) roomState.waitingUsers[problemId] = [];
              roomState.waitingUsers[problemId].push(socket.id);
          }
          tryMatchUsers(io, problemId); // Attempt to match them again
        }
        broadcastUserCount(io, problemId);
        return;
      }

      // If in another problem, leave it first
      if (session.problemId && session.problemId !== problemId) {
        handleUserLeave(io, socket.id, session.problemId);
        socket.leave(session.problemId);
      }

      // Join the new problem
      session.problemId = problemId;
      socket.join(problemId);

      if (!roomState.waitingUsers[problemId]) roomState.waitingUsers[problemId] = [];
      if (!roomState.activeUsers[problemId]) roomState.activeUsers[problemId] = 0;
      
      roomState.activeUsers[problemId]++;
      console.log(`📈 Active users in problem ${problemId}: ${roomState.activeUsers[problemId]}`);

      // Send problem link
      try {
        const problemLink = await getLeetCodeLink(problemId);
        socket.emit("chat-message", {
          message: `Problem Link: ${problemLink}`,
          username: "System",
        });
        console.log(`🔗 Sent problem link to ${socket.id}`);
      } catch (error) {
        console.error("Error sending problem link:", error);
      }

      broadcastUserCount(io, problemId);

      // Add to waiting queue and try to match
      roomState.waitingUsers[problemId].push(socket.id);
      socket.emit("waiting");
      socket.emit("chat-message", { 
        message: "Matching buddy...", 
        username: "System" 
      });

      console.log(`⏳ ${socket.id} added to waiting queue for problem ${problemId}`);
      tryMatchUsers(io, problemId);
    });

    socket.on("leave-problem", (problemId) => {
      console.log(`🚪 ${socket.id} manually leaving problem ${problemId}`);
      handleUserLeave(io, socket.id, problemId);
      socket.leave(problemId);
    });

    socket.on("chat-message", ({ message }) => {
      const session = roomState.userSessions[socket.id];
      
      if (!session || !session.isMatched || !session.partnerId) {
        socket.emit("chat-message", { 
          message: "You need to be matched with a partner to chat.", 
          username: "System" 
        });
        return;
      }

      const partnerSocket = io.sockets.sockets.get(session.partnerId);
      if (partnerSocket && partnerSocket.connected) {
        partnerSocket.emit("chat-message", { message, username: "Partner" });
        socket.emit("chat-message", { message, username: "You" });
        console.log(`💬 Message relayed between ${socket.id} and ${session.partnerId}`);
      } else {
        socket.emit("chat-message", { 
          message: "Your partner seems to be disconnected.", 
          username: "System" 
        });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id}, reason: ${reason}`);
      const session = roomState.userSessions[socket.id];
      
      if (session && session.problemId) {
        handleUserLeave(io, socket.id, session.problemId);
      }
      
      delete roomState.userSessions[socket.id];
    });

    socket.on("error", (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  // Periodic cleanup for stale sessions
  setInterval(() => {
    const now = Date.now();
    Object.keys(roomState.userSessions).forEach(socketId => {
      const session = roomState.userSessions[socketId];
      const socket = io.sockets.sockets.get(socketId);
      
      // Clean up disconnected or very old sessions (e.g., > 1 hour)
      if (!socket || !socket.connected || (now - session.joinTime > 3600000)) {
        console.log(`🧹 Cleaning up stale session: ${socketId}`);
        if (session.problemId) {
          handleUserLeave(io, socketId, session.problemId);
        }
        delete roomState.userSessions[socketId];
      }
    });
  }, 60000); // Run every minute

  // Return function to get active problems for API
  return {
    getActiveProblems: () => getActiveProblems()
  };
}