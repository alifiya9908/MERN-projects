//node server which will handle socket io connections

const { Server } = require("socket.io");

// Create the Socket.io server on port 4001 with CORS configuration
const io = new Server(4001, {
  cors: {
    origin: "http://127.0.0.1:5500", // Allow this origin
    methods: ["GET", "POST"], // Allow these methods
    allowedHeaders: ["Content-Type"], // Allow these headers
    credentials: true, // Allow credentials
  },
});

const users = {}; // Store connected users

// Set up Socket.io connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Listen for 'new-user-joined' event when a new user joins
  socket.on("new-user-joined", (name) => {
    console.log("New user joined:", name);
    users[socket.id] = name; // Store user's name by their socket id
    // Broadcast to all other users that a new user has joined
    socket.broadcast.emit("user-joined", name);
  });

  // Listen for 'send' event when a user sends a message
  socket.on("send", (message) => {
    // Broadcast the message to all other users
    socket.broadcast.emit("receive", {
      message: message,
      name: users[socket.id], // Send the sender's name along with the message
    });
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log(`${users[socket.id]} has disconnected`);
    // Broadcast to other users that this user has left
    socket.broadcast.emit("user-left", users[socket.id]);
    delete users[socket.id]; // Remove the user from the list
  });
});

// Server is now running on port 4001
console.log("Socket.io server running on port 4001");
