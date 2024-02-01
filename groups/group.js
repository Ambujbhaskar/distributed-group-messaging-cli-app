// group
const { v4: uuidv4 } = require('uuid');
const zmq = require("zeromq");

const GROUP_INFO = {
  id: "669875df-8ab6-42ac-9270-bfa07ee4fbf8",
  name: "Group1",
  address: "127.0.0.1:3011"
};
const MESSAGE_SERVER_ENDPOINT = "127.0.0.1:3002";

let userList = [];
let messages = [];

const sock = zmq.socket("sub");
sock.connect(`tcp://${MESSAGE_SERVER_ENDPOINT}`);
sock.subscribe(GROUP_INFO.id);
console.log("Group connected to message server at", MESSAGE_SERVER_ENDPOINT);

function receiveMessage(topic, groupID, userID, userName, userAddress) {
  const user = {
    id: userID?.toString(),
    name: userName?.toString(),
    address: userAddress?.toString()
  };

  console.group("Received message");
  console.log("Topic:", topic.toString());
  console.log("GroupID:", groupID?.toString());
  console.log("UserID:", user.id);
  console.log("userName:", user.name);
  console.log("userAddress:", user.address);
  console.groupEnd();

  const queryType = (topic.toString()).slice(groupID.length + 1, undefined);

  switch (queryType) {
    case "JOIN":
      addUser(user, groupID.toString());
      break;
    case "LEAVE":
      removeUser(user, groupID.toString());
      break;
    default:
      console.log("Invalid query type!");
      break;
  };
};

function addUser(user) {
  const userIndex = userList.findIndex((existingUser) => existingUser.id === user.id);
  // if user not already present, add 
  if (userIndex === -1) {
    console.log("Adding user", user.name, "to group", GROUP_INFO.name);
    return userList.push({ ...user });
  };
  console.log("User already exists!");
  return "User already exists!";
};

function removeUser(user, groupID) {
  const userIndex = userList.findIndex((existingUser) => existingUser.id === user.id);
  // if user already exists, remove
  if (userIndex !== -1) {
    console.log("Removing user", user.name, "from group", GROUP_INFO.name);
    return userList.splice(userIndex, 1);
  };
  console.log("User does not exist!");
  return "User does not exist!";
};

sock.on("message", receiveMessage);