// message server
const { v4: uuidv } = require('uuid');
const zmq = require("zeromq");

const USER_ENDPOINT = "127.0.0.1:3001";
const GROUP_ENDPOINT = "127.0.0.1:3002";

let groupList = [
  {
    id: "669875df-8ab6-42ac-9270-bfa07ee4fbf8",
    name: "Group1",
    address: "127.0.0.1:3011"
  }
];

// group Reply socket
const groupHandler = zmq.socket("rep");
groupHandler.bindSync(`tcp://${GROUP_ENDPOINT}`);
console.log("Group handler socket (rep) bound to", GROUP_ENDPOINT);
groupHandler.on("message", (group) => {
  console.log("JOIN request from group", group.id);
  const groupIndex = groupList.findIndex((existingGroup) => existingGroup.id === group.id);
  if (groupIndex === -1) {
    console.log("SUCCESS: group added to message server list!");
    groupList.push(group);
    groupHandler.send("SUCCESS");
  };
  console.log("Group already exists!");
  groupHandler.send("Group already exists!");
});

// user Reply socket
const userHandler = zmq.socket("rep");
userHandler.bindSync(`tcp://${USER_ENDPOINT}`);
console.log("User handler socket (rep) bound to", USER_ENDPOINT);

const handleUserRequest = (payload) => {
  const payloadObject = JSON.parse(payload.toString())
  const user = {
    id: payloadObject.id,
    name: payloadObject.name,
    address: payloadObject.address
  };

  console.group("Received request for group list");
  console.log("UserID:", user.id);
  console.log("userName:", user.name);
  console.log("userAddress:", user.address);
  console.groupEnd();

  userHandler.send(JSON.stringify(groupList));
};

userHandler.on("message", handleUserRequest);