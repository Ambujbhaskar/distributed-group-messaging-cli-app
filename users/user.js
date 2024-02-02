// user 
const { v4: uuidv4 } = require('uuid');
const zmq = require("zeromq");

const USER_INFO = {
  id: "75d26f88-a9a6-454c-a7f2-94542481cb5e",
  name: "User1",
  address: "127.0.0.1:3021"
};
const MESSAGE_SERVER_ENDPOINT = "127.0.0.1:3001";
const GROUP_ENDPOINT = "127.0.0.1:3011";

let groups = [];

const groupHandler = zmq.socket("req");
groupHandler.connect(`tcp://${GROUP_ENDPOINT}`);
console.log("User connected to group at:", GROUP_ENDPOINT);
console.log("sending request to the group at: ", GROUP_ENDPOINT);
groupHandler.send(["JOIN", "669875df-8ab6-42ac-9270-bfa07ee4fbf8", JSON.stringify(USER_INFO)]);
// groupHandler.send(["LEAVE", "669875df-8ab6-42ac-9270-bfa07ee4fbf8", JSON.stringify(USER_INFO)]);
// groupHandler.send(["SEND", "669875df-8ab6-42ac-9270-bfa07ee4fbf8", JSON.stringify({ "content": "Whatuppp", ...USER_INFO })]);
// setTimeout(() => {
//   groupHandler.send(["SEND", "669875df-8ab6-42ac-9270-bfa07ee4fbf8", JSON.stringify({ "content": "Heyy!!", ...USER_INFO })]);
// }, 5000);
// setTimeout(() => {
//   groupHandler.send(["SEND", "669875df-8ab6-42ac-9270-bfa07ee4fbf8", JSON.stringify({ "content": "My G", ...USER_INFO })]);
// }, 5000);
groupHandler.send(["GET", "669875df-8ab6-42ac-9270-bfa07ee4fbf8", JSON.stringify({ "timestamp": "2/3/2024, 12:31:52 AM", ...USER_INFO })]);

groupHandler.on("message", msg => {
  msg = msg.toString();
  try {
    msg = JSON.parse(msg);
  } catch { } finally {
    console.log(msg);
  };
});

// const serverHandler = zmq.socket("req");
// serverHandler.connect(`tcp://${MESSAGE_SERVER_ENDPOINT}`);
// console.log("User connected to Message Server at:", MESSAGE_SERVER_ENDPOINT);

// const sendJoinRequest = (groupID) => {
//   console.log("sending JOIN request to the message server at: ", MESSAGE_SERVER_ENDPOINT);
//   serverHandler.send(["JOIN", groupID, ...Object.values(USER_INFO)]);
// };
// serverHandler.on("message", (message) => console.log("Received response: ", message.toString()))
