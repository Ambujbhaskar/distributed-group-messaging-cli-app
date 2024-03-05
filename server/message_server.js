// message server
const zmq = require("zeromq");

const USER_ENDPOINT = "127.0.0.1:3001";
const GROUP_ENDPOINT = "127.0.0.1:3002";

let groupList = [];

// group Reply socket
const groupHandler = zmq.socket("rep");
groupHandler.bindSync(`tcp://${GROUP_ENDPOINT}`);
console.log("Group handler socket (rep) bound to", GROUP_ENDPOINT);
groupHandler.on("message", (group) => {
  group = JSON.parse(group.toString());
  console.log("JOIN request from group", group.id);
  const groupIndex = groupList.findIndex((existingGroup) => existingGroup.id === group.id);
  if (groupIndex === -1) {
    console.log("SUCCESS: group added to message server list!");
    groupList.push(group);
    console.log("List of groups online:");
    console.log(groupList);
    groupHandler.send("SUCCESS");
    return;
  };
  console.log("Group already exists!");
  groupHandler.send("Group already exists!");
});

// user Reply socket
const userHandler = zmq.socket("rep");
userHandler.bindSync(`tcp://${USER_ENDPOINT}`);
console.log("User handler socket (rep) bound to", USER_ENDPOINT);

const handleUserRequest = (user) => {
  user = JSON.parse(user.toString());

  console.group("GET group list request received from");
  console.log("UserID:", user.id);
  console.log("userName:", user.name);
  console.log("userAddress:", user.address);
  console.groupEnd();

  userHandler.send(JSON.stringify(groupList));
};

userHandler.on("message", handleUserRequest);