// user 
const { v4: uuidv4 } = require('uuid');
const { uniqueNamesGenerator, adjectives, colors, animals, countries } = require('unique-names-generator');
const zmq = require("zeromq");

const USER_INFO = {
  id: uuidv4(),
  name: uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    length: 3,
    separator: " ",
    style: "capital"
  }),
  address: `127.0.0.1:${(Math.floor(Math.random() * 1000) + 8000)}`
};
const MESSAGE_SERVER_ENDPOINT = "127:0.0.1:3001";
const GROUP_ENDPOINT = "127.0.0.1:7677";

let groups = [];

const groupHandler = zmq.socket("req");
groupHandler.connect(`tcp://${GROUP_ENDPOINT}`);
console.log("User info:", USER_INFO);
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
// groupHandler.send(["GET", "669875df-8ab6-42ac-9270-bfa07ee4fbf8", JSON.stringify({ "timestamp": "2/3/2024, 12:31:52 AM", ...USER_INFO })]);

groupHandler.on("message", msg => {
  console.log("raw:", msg);
  msg = msg.toString();
  try {
    msg = JSON.parse(msg);
  } catch { } finally {
    console.log(msg);
    console.log("\n");
  };
});

const serverHandler = zmq.socket("req");
serverHandler.connect(`tcp://${MESSAGE_SERVER_ENDPOINT}`);
console.log("User connected to message server at:", MESSAGE_SERVER_ENDPOINT);
serverHandler.send(JSON.stringify(USER_INFO));
serverHandler.on("message", (message) => console.log("Received response: ", message.toString()));
