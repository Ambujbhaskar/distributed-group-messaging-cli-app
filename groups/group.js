// group
const { v4: uuidv4 } = require('uuid');
const zmq = require("zeromq");

const GROUP_INFO = {
  id: "669875df-8ab6-42ac-9270-bfa07ee4fbf8",
  name: "Group1",
  address: "127.0.0.1:3011"
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

const handleUserRequest = (type, groupID, payload) => {
  const payloadObject = JSON.parse(payload.toString());
  const user = {
    id: payloadObject.id,
    name: payloadObject.name,
    address: payloadObject.address
  };

  console.group("Received request");
  console.log("Type:", type?.toString());
  console.log("GroupID:", groupID?.toString());
  console.log("Payload:", payloadObject);
  console.groupEnd();

  switch (type.toString()) {
    case "GET":
      userHandler.send(getMessagesFrom(user, payloadObject.timestamp));
      break;
    case "SEND":
      userHandler.send(receiveChatMessage(user, payloadObject.content));
      break;
    case "JOIN":
      userHandler.send(addUser(user));
      break;
    case "LEAVE":
      userHandler.send(removeUser(user));
      break;
    default:
      console.log("Invalid request type!");
      userHandler.send("Invalid request type!");
      break;
  };
};

userHandler.on("message", handleUserRequest);

function userExists(user) {
  const userIndex = userList.findIndex((existingUser) => existingUser.id === user.id);
  return userIndex !== -1
};

function addUser(user) {
  // if user not already present, add 
  if (!userExists(user)) {
    console.log("Adding user", user.name, "to group", GROUP_INFO.name);
    userList.push({ ...user });
    return "SUCCESS";
  };
  console.log("User already exists!");
  return "User already exists!";
};

function removeUser(user) {
  // if user already exists, remove
  if (userExists(user)) {
    console.log("Removing user", user.name, "from group", GROUP_INFO.name);
    userList.splice(userIndex, 1);
    return "SUCCESS";
  };
  console.log("User does not exist in Group!");
  return "User does not exist in Group!";
};

function receiveChatMessage(user, messageContent) {
  if (!userExists(user)) {
    console.log("User not in Group");
    return "User not in Group";
  };
  const newMessage = {
    id: uuidv4(),
    content: messageContent,
    sender: user,
    timestamp: new Date()
  };
  messages.push(newMessage);
  console.group("New chat message");
  console.log("MessageID:", newMessage.id);
  console.log("Content:", newMessage.content);
  console.log("Sender Name:", newMessage.sender.name);
  console.log("Timestamp:", newMessage.timestamp.toLocaleString());
  console.groupEnd();
  return "SUCCESS";
};

function getMessagesFrom(user, dateTimeString) {
  if (!userExists(user)) {
    console.log("User not in Group");
    return "User not in Group";
  };
  let queryResult = [];
  try {
    const queryDateTime = new Date(dateTimeString ?? 0);
    queryResult = JSON.stringify(messages.filter(message => {
      console.log(message.timestamp.toLocaleString(), queryDateTime.toLocaleString());
      return ((message?.timestamp).getTime() >= queryDateTime.getTime())
    }));
    console.log("Query performed successfully!");
  } catch (err) {
    queryResult = "Invalid Timestamp provided";
    console.log("Invalid Timestamp provided");
  };
  return queryResult;
};