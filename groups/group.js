// group
const { v4: uuidv4 } = require('uuid');
const { uniqueNamesGenerator, adjectives, colors, animals, countries } = require('unique-names-generator');
const zmq = require("zeromq");
const { Worker } = require("worker_threads");

const GROUP_INFO = {
  id: "669875df-8ab6-42ac-9270-bfa07ee4fbf8",
  name: uniqueNamesGenerator({
    dictionaries: [colors, countries],
    length: 2,
    separator: " ",
    style: "capital"
  }),
  address: `127.0.0.1:${(Math.floor(Math.random() * 1000) + 7000)}`
};
const USER_ENDPOINT = GROUP_INFO.address;
const MESSAGE_SERVER_ENDPOINT = "127.0.0.1:3002";

let userList = [];
let messages = [];

const serverHandler = zmq.socket("req");
serverHandler.connect(`tcp://${MESSAGE_SERVER_ENDPOINT}`);
console.log("Group connected to message server at", MESSAGE_SERVER_ENDPOINT);
serverHandler.send(JSON.stringify(GROUP_INFO));
serverHandler.on("message", msg => console.log(msg.toString()));

const userHandler = zmq.socket("rep");
userHandler.bindSync(`tcp://${USER_ENDPOINT}`);
console.log("User handler socket (rep) initialized at", USER_ENDPOINT);

const userRequest = (type, groupID, payload) => {
  
  console.group("Received request");
  console.log("Type:", type.toString());
  console.log("GroupID:", groupID.toString());
  console.log("Payload:", JSON.parse(payload.toString()));
  console.groupEnd();

  const worker = new Worker("./group-worker.js", {
    workerData: {
      type: (type.toString()),
      groupID: (groupID.toString()),
      payload: (JSON.parse(payload.toString())),
      userList: userList,
      messages: messages,
      GROUP_INFO: GROUP_INFO
    }
  });

  worker.on("message", (msg) => {
    console.log("Main Thread", msg);
    if (msg.status === "complete" && msg.payload)
      userHandler.send(msg.payload);
    else if (msg.status === "incomplete") {
      if (msg.type === "add-user") {
        console.log("Adding new user ...");
        userList.push({ ...msg.payload });
        userHandler.send("SUCCESS");
        console.log("User added!");
      } else if (msg.type === "remove-user") {
        console.log("Removing user ...");
        userList.splice(msg.payload, 1);
        userHandler.send("SUCCESS");
        console.log("User removed!");
      } else if (msg.type === "new-message") {
        console.log("Appending new message ...");
        messages.push(msg.payload);
        console.group("New chat message");
        console.log("MessageID:", msg.payload.id);
        console.log("Content:", msg.payload.content);
        console.log("Sender Name:", msg.payload.sender.name);
        console.log("Timestamp:", msg.payload.timestamp.toLocaleString());
        console.groupEnd();
        userHandler.send("SUCCESS");
        console.log("Message saved!");
      };
      console.log("\n\n");
    }
    else {
      console.log("Waiting for operation to finish...");
      setTimeout(() => {
        console.log("Timed out :(");
        userHandler.send("ERR: Timed out! Something went wrong while handling user request.");
      }, 10000);
    };
  });

  // worker.on("error", (msg) => {
  //   userHandler.send(`An error occured ${msg}`);
  // });
}

userHandler.on("message", userRequest);
