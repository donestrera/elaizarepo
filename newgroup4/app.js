const http = require('http');
const fs = require('fs');
const SerialPort = require('serialport');

// Configuration
const CONFIG = {
    serialPort: '/dev/ttyACM0',
    baudRate: 9600,
    webPort: 3000
};

// First create the HTTP server
const index = fs.readFileSync('index.html');
const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
});

// Then initialize Socket.IO with the server
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Create parser
const parser = new SerialPort.parsers.Readline({
    delimiter: '\r\n'
});

// Setup serial port
const port = new SerialPort(CONFIG.serialPort, {
    baudRate: CONFIG.baudRate,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false
});

port.on('error', (err) => {
    console.error('Serial Port Error:', err.message);
});

port.on('open', () => {
    console.log('Soil moisture sensor connected!');
});

// Data validation function
function validateMoistureData(data) {
    const value = parseInt(data);
    return !isNaN(value) && value >= 0 && value <= 100 ? value : null;
}

// Handle data
parser.on('data', (data) => {
    const moistureValue = validateMoistureData(data.toString().trim());
    if (moistureValue !== null) {
        console.log(`Moisture Level: ${moistureValue}%`);
        io.emit('data', moistureValue.toString());
    } else {
        console.warn('Invalid moisture data received:', data);
    }
});

port.pipe(parser);

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Web client connected');
    socket.on('disconnect', () => {
        console.log('Web client disconnected');
    });
});

// Start the server
server.listen(CONFIG.webPort, () => {
    console.log(`Server running at http://localhost:${CONFIG.webPort}/`);
});

