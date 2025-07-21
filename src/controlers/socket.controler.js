// Pure socket.io buddy matcher controller (no axios, no LeetCode API)


const waitingUsers = {}; // { problemId: [socket, ...] }
const activePairs = {};  // { problemId: [ [socketA, socketB], ... ] }
const activeUsers = {};  // { problemId: count }

export default function socketController(io) {
  io.on("connection", (socket) => {
    socket.currentProblem = null;
    socket.partner = null;

    // User joins a problem
    socket.on("join-problem", (problemId) => {
      // If already in a problem, ignore
      if (socket.currentProblem === problemId) return;
      // If already in another problem, leave it first
      if (socket.currentProblem) {
        socket.emit("chat-message", {
          message: "You are already in a session.",
          username: "System",
        });
        return;
      }
      socket.currentProblem = problemId;
      if (!waitingUsers[problemId]) waitingUsers[problemId] = [];
      if (!activePairs[problemId]) activePairs[problemId] = [];
      if (!activeUsers[problemId]) activeUsers[problemId] = 0;
      activeUsers[problemId]++;
      socket.join(problemId);
      io.to(problemId).emit("online-users", activeUsers[problemId]);

      // Try to match
      if (waitingUsers[problemId].length > 0) {
        const partner = waitingUsers[problemId].shift();
        // Pair them
        socket.partner = partner;
        partner.partner = socket;
        activePairs[problemId].push([socket, partner]);
        socket.emit("matched");
        partner.emit("matched");
        socket.emit("chat-message", { message: "Partner matched! You can start chatting now.", username: "System" });
        partner.emit("chat-message", { message: "Partner matched! You can start chatting now.", username: "System" });
      } else {
        // No partner, wait
        waitingUsers[problemId].push(socket);
        socket.emit("waiting");
        socket.emit("chat-message", { message: "Waiting for a buddy...", username: "System" });
      }
    });

    // User leaves a problem (manual or on unmount)
    socket.on("leave-problem", (problemId) => {
      if (socket.currentProblem !== problemId) return;
      cleanupUser(socket, problemId);
    });

    // User sends a chat message
    socket.on("chat-message", ({ message }) => {
      if (socket.partner) {
        socket.partner.emit("chat-message", { message, username: "Partner" });
      }
      socket.emit("chat-message", { message, username: "You" });
    });

    // User disconnects
    socket.on("disconnect", () => {
      if (socket.currentProblem) {
        cleanupUser(socket, socket.currentProblem);
      }
    });

    // Helper to clean up user from all structures
    function cleanupUser(sock, problemId) {
      // Remove from waiting queue
      if (waitingUsers[problemId]) {
        waitingUsers[problemId] = waitingUsers[problemId].filter(s => s !== sock);
      }
      // Remove from active pairs
      if (activePairs[problemId]) {
        activePairs[problemId] = activePairs[problemId].filter(pair => {
          if (pair.includes(sock)) {
            // Notify partner and requeue
            const partner = pair[0] === sock ? pair[1] : pair[0];
            if (partner) {
              partner.partner = null;
              waitingUsers[problemId].push(partner);
              partner.emit("waiting");
              partner.emit("chat-message", { message: "Your partner disconnected. Waiting for a new buddy...", username: "System" });
            }
            return false;
          }
          return true;
        });
      }
      // Remove partner reference
      sock.partner = null;
      // Leave room
      sock.leave(problemId);
      // Decrement online count
      if (activeUsers[problemId]) {
        activeUsers[problemId]--;
        if (activeUsers[problemId] < 0) activeUsers[problemId] = 0;
      }
      io.to(problemId).emit("online-users", activeUsers[problemId] || 0);
      sock.currentProblem = null;
    }
  });
}
