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

let emsSummary = {
  efficiency: 92,
  uptime: 99.4,
  activeAlerts: 2,
};

// Internal device state — value is numeric, formatted to a display string only at emit time
let devices = [
  { name: "Meter 01", type: "Energy", status: "Active", value: 4281, unit: "kWh", decimals: 0, min: 0, max: 10000, maxDelta: 40 },
  { name: "Meter 02", type: "Energy", status: "Active", value: 2110, unit: "kWh", decimals: 0, min: 0, max: 10000, maxDelta: 30 },
  { name: "Sensor A1", type: "Temperature", status: "Active", value: 24.5, unit: "°C", decimals: 1, min: -10, max: 50, maxDelta: 0.6 },
  { name: "Sensor B2", type: "Humidity", status: "Idle", value: 48, unit: "%", decimals: 0, min: 0, max: 100, maxDelta: 2 },
  { name: "Inverter 01", type: "Solar", status: "Active", value: 3.2, unit: "kW", decimals: 1, min: 0, max: 10, maxDelta: 0.4 },
  { name: "Inverter 02", type: "Solar", status: "Offline", value: 0, unit: "kW", decimals: 1, min: 0, max: 10, maxDelta: 0.4 },
];

function formatDeviceValue(device) {
  if (device.status === "Offline") return "—";
  const formatted =
    device.unit === "kWh"
      ? Math.round(device.value).toLocaleString()
      : device.value.toFixed(device.decimals);
  return `${formatted} ${device.unit}`;
}

function getDevicesPayload() {
  return devices.map((d) => ({
    name: d.name,
    type: d.type,
    status: d.status,
    value: formatDeviceValue(d),
  }));
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Send initial snapshot immediately on connect
  socket.emit("consumption:update", {
    value: consumptionValue,
    unit: "kWh",
    timestamp: Date.now(),
  });
  socket.emit("parameter:trend", parameterSeries);
  socket.emit("ems:summary", emsSummary);  
  socket.emit("devices:table", getDevicesPayload());  

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

  // Nudge EMS summary metrics
  emsSummary = {
    efficiency: Math.min(100, Math.max(0, Math.round((emsSummary.efficiency + (Math.random() - 0.5) * 3) * 10) / 10)),
    uptime: Math.min(100, Math.max(0, Math.round((emsSummary.uptime + (Math.random() - 0.5) * 0.5) * 10) / 10)),
    activeAlerts: Math.max(0, emsSummary.activeAlerts + (Math.random() > 0.85 ? (Math.random() > 0.5 ? 1 : -1) : 0)),
  };
  io.emit("ems:summary", emsSummary);

  // Random walk + occasional status flip for devices
  devices = devices.map((d) => {
    let status = d.status;
    if (Math.random() > 0.85) {
      const others = ["Active", "Idle", "Offline"].filter((s) => s !== status);
      status = others[Math.floor(Math.random() * others.length)];
    }

    let value = d.value;
    if (status !== "Offline") {
      value += (Math.random() - 0.5) * d.maxDelta;
      value = Math.min(d.max, Math.max(d.min, value));
      value = Math.round(value * 10 ** d.decimals) / 10 ** d.decimals;
    }

    return { ...d, status, value };
  });
  io.emit("devices:table", getDevicesPayload());

}, 3000);