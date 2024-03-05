const { parentPort, workerData } = require("worker_threads");
const { v4: uuidv4 } = require('uuid');

/**
 * @
 * 
 * @param {*} type 
 * @param {*} groupID 
 * @param {*} payload 
 */

const handleUserRequest = (type, groupID, payload) => {
  const payloadObject = payload;
  const user = {
    id: payloadObject.id,
    name: payloadObject.name,
    address: payloadObject.address
  };

  switch (type) {
    case "GET":
      getMessagesFrom(user, payloadObject.timestamp);
      break;
    case "SEND":
      receiveChatMessage(user, payloadObject.content);
      break;
    case "JOIN":
      addUser(user);
      break;
    case "LEAVE":
      removeUser(user);
      break;
    default:
      console.log("Invalid request type!");
      parentPort.postMessage({
        status: "complete",
        payload: "Invalid request type!"
      });
      break;
  };
};

function userIndex(user) {
  const userIndex = workerData.userList.findIndex((existingUser) => existingUser.id === user.id);
  return userIndex;
};

function addUser(user) {
  // if user not already present, add 
  if (userIndex(user) === -1) {
    console.log("Adding user", user.name, "to group", workerData.GROUP_INFO.name);
    parentPort.postMessage({
      status: "incomplete",
      type: "add-user",
      payload: user
    });
  } else {
    console.log("User already exists!");
    parentPort.postMessage({
      status: "complete",
      payload: "User already exists!"
    });
  };
};

function removeUser(user) {
  // if user already exists, remove
  if (userIndex(user) !== -1) {
    console.log("Removing user", user.name, "from group", workerData.GROUP_INFO.name);
    parentPort.postMessage({
      status: "incomplete",
      type: "remove-user",
      payload: userIndex(user)
    });
  } else {
    console.log("User does not exist in Group!");
    parentPort.postMessage({
      status: "complete",
      payload: "User does not exist in Group!"
    });
  };

};

function receiveChatMessage(user, messageContent) {
  if (userIndex(user) === -1) {
    console.log("User not in Group");
    parentPort.postMessage({
      status: "complete",
      payload: "User not in Group"
    });
    return;
  }
  const newMessage = {
    id: uuidv4(),
    content: messageContent,
    sender: user,
    timestamp: new Date()
  };
  parentPort.postMessage({
    status: "incomplete",
    type: "new-message",
    payload: newMessage
  });
};

function getMessagesFrom(user, dateTimeString) {
  if (userIndex(user) === -1) {
    console.log("User not in Group");
    parentPort.postMessage({
      status: "complete",
      payload: "User not in Group"
    });
    return;
  };
  if (dateTimeString === "") {
    parentPort.postMessage({
      status: "complete",
      payload: JSON.stringify(workerData.messages)
    });
    return;
  };
  let queryResult = [];
  try {
    const queryDateTime = new Date(dateTimeString ?? 0);
    queryResult = JSON.stringify(workerData.messages.filter(message => {
      console.log(message.timestamp.toLocaleString(), queryDateTime.toLocaleString());
      return ((message?.timestamp).getTime() >= queryDateTime.getTime())
    }));
    console.log("Query performed successfully!");
  } catch (err) {
    queryResult = "Invalid Timestamp provided";
    console.log("Invalid Timestamp provided");
  };
  parentPort.postMessage({
    status: "complete",
    payload: JSON.stringify(queryResult)
  });
};

handleUserRequest(workerData.type, workerData.groupID, workerData.payload);
