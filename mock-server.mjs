import { Server } from "socket.io";

const io = new Server(4000, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

console.log("Mock socket.io server running on http://localhost:4000");

let consumptionValue = 4281;
let parameterSeries = [
  { time: "04:00", value: 12 },
  { time: "08:00", value: 22 },
  { time: "12:00", value: 41 },
  { time: "16:00", value: 35 },
  { time: "20:00", value: 20 },
  { time: "24:00", value: 24 },
];

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Send initial snapshot immediately on connect
  socket.emit("consumption:update", {
    value: consumptionValue,
    unit: "kWh",
    timestamp: Date.now(),
  });
  socket.emit("parameter:trend", parameterSeries);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Simulate live updates every 3 seconds
setInterval(() => {
  // Random walk for consumption
  consumptionValue += Math.round((Math.random() - 0.5) * 40);
  io.emit("consumption:update", {
    value: consumptionValue,
    unit: "kWh",
    timestamp: Date.now(),
  });

  // Nudge the last point of the parameter trend
  const last = parameterSeries[parameterSeries.length - 1];
  const nudged = Math.max(0, last.value + (Math.random() - 0.5) * 8);
  parameterSeries = [
    ...parameterSeries.slice(1),
    { time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), value: Math.round(nudged * 10) / 10 },
  ];
  io.emit("parameter:trend", parameterSeries);
}, 3000);