const broadcastAddress = require('broadcast-address');
const os = require("os")

var dgram = require('dgram');

var boardId = 0;
var boardIP = null;
var boardVer = "Unknown";
var boardTitle = "";

var findTimerId;
var counter = 0;

var onConnect = null;

/*
typedef struct tagLocatorData {
  unsigned char status;
  unsigned char length;
  unsigned char cmd;
  unsigned char boardType;
  quint32       boardId;
  unsigned char mac[6];
  unsigned char netmask[4];
  unsigned char gateway[4];
  quint16 port;
  unsigned char inputNo;
  unsigned char userData[33];
  unsigned char appTitle[27];
  unsigned char orgName[65];
  unsigned char checksum;
}
*/

const BOARD_TYPE = 6
const PORT = 23;

const CMD_LEN = 4
const TAG_CMD = 0xFF
const TAG_STATUS = 0xFE
const CMD_DISCOVER_TARGET = 0x02

var socket = dgram.createSocket('udp4');

socket.on('listening', function () {
    var address = socket.address();
    console.log('UDP socket listening on ' + address.address + ":" + address.port);
    socket.setBroadcast(true);
});

socket.on('message', function (message, rinfo) {
    if(message.length != CMD_LEN) {
        console.log('Answer recieved from: ' + rinfo.address + ':' + rinfo.port + ' length: ' + message.length);
        var boardType = message[3];
        if(boardType == BOARD_TYPE && message[0] == TAG_STATUS) {
            boardIP = rinfo.address;
            boardId = message.readUInt32LE(4);
            boardTitle = message.toString('ascii', 58, 58 + 27).replace(/^[\s\uFEFF\xA0\0]+|[\s\uFEFF\xA0\0]+$/g, "");
            console.log('Board ID: ' + boardId + ' Board IP: ' + boardIP + ' Title: ' + boardTitle);

            let error = null;
            let boardInfo = {
              "boardId": boardId,
              "boardIP": boardIP,
              "boardTitle": boardTitle
            };
            onConnect(error, boardInfo);
        }
    }
});

var bcData = Buffer.alloc(4)
bcData[0] = TAG_CMD;
bcData[1] = CMD_LEN;
bcData[2] = CMD_DISCOVER_TARGET;
bcData[3] = (0 - TAG_CMD - CMD_LEN - CMD_DISCOVER_TARGET) & 0xFF;

function broadcastNew() {
    if(boardIP == null) {
        Object.keys(os.networkInterfaces()).forEach(it => {
            socket.send(bcData, 0, bcData.length, PORT, broadcastAddress(it), function() {
                counter++;
                if(counter > 15) {
                    let error = "Cannot find hardware on local net";
                    console.log(error);
                    onConnect(error, null);
                }
            });
        })
    }
}

module.exports.boardId = boardId;
module.exports.boardIP = boardIP;
module.exports.boardVer = boardVer;

module.exports.start = (callback) => {
    onConnect = callback;

    // Start finder
    socket.bind(PORT, function() {
        socket.setBroadcast(true);
        findTimerId = setInterval(broadcastNew, 5000);
    });
}