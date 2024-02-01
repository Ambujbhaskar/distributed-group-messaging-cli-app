// user 
const { v4: uuidv4 } = require('uuid');
const zmq = require("zeromq");

const USER_INFO = {
  id: "75d26f88-a9a6-454c-a7f2-94542481cb5e",
  name: "User1",
  address: "127.0.0.1:3021"
};
const MESSAGE_SERVER_ENDPOINT = "127.0.0.1:3001";

const sock = zmq.socket("req");
sock.connect(`tcp://${MESSAGE_SERVER_ENDPOINT}`);
console.log("User connected to Message Server at:", MESSAGE_SERVER_ENDPOINT);

const sendJoinRequest = (groupID) => {
  console.log("sending JOIN request to the message server at: ", MESSAGE_SERVER_ENDPOINT);
  sock.send(["JOIN", groupID, ...Object.values(USER_INFO)]);
};
sock.on("message", (message) => console.log("Received response: ", message.toString()))

setInterval(() => sendJoinRequest("669875df-8ab6-42ac-9270-bfa07ee4fbf8"), 500);