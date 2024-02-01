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

// user Reply socket
const userHandler = zmq.socket("rep");
userHandler.bindSync(`tcp://${USER_ENDPOINT}`);
console.log("User handler socket (rep) bound to", USER_ENDPOINT);

// group publish socket
const groupHandler = zmq.socket("pub");
groupHandler.bindSync(`tcp://${GROUP_ENDPOINT}`);
console.log("Group handler socket (pub) bound to", GROUP_ENDPOINT);

const joinGroup = (groupID, userID, userName, userAddress) => {
  console.log("publishing JOIN request for groupID: ", groupID.toString());
  groupHandler.send([`${groupID.toString()}/JOIN`, groupID, userID, userName, userAddress]);
};

const leaveGroup = (groupID, userID, userName, userAddress) => {
  console.log("publishing LEAVE request for groupID: ", groupID.toString());
  groupHandler.send([`${groupID.toString()}/LEAVE`, groupID, userID, userName, userAddress]);
};

const handleUserRequest = async (type, groupID, userID, userName, userAddress) => {
  const user = {
    id: userID?.toString(),
    name: userName?.toString(),
    address: userAddress?.toString()
  };

  console.group("Received request");
  console.log("Type:", type.toString());
  console.log("GroupID:", groupID?.toString());
  console.log("UserID:", user.id);
  console.log("userName:", user.name);
  console.log("userAddress:", user.address);
  console.groupEnd();

  switch (type.toString()) {
    case "GET":
      break;
    case "JOIN":
      if (groupList.filter((group) => (groupID?.toString() === group.id)).length === 1) {
        // id is valid, group exists in the list maintained by the server
        joinGroup(groupID, userID, userName, userAddress);
        break;
      };
      console.log("GroupID is invalid!");
      userHandler.send("Invalid groupID!");
      break;
    case "LEAVE":
      if (groupList.filter((group) => (groupID?.toString() === group.id)).length === 1) {
        // id is valid, group exists in the list maintained by the server
        leaveGroup(groupID, userID, userName, userAddress);
        break;
      };
      console.log("GroupID is invalid!");
      userHandler.send("Invalid groupID!");
      break;
    default:
      console.log("Invalid query type!");
      break;
  };
};

userHandler.on("message", handleUserRequest);

groupHandler.on("message", (message) => console.log(message));

