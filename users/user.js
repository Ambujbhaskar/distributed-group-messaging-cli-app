// user 
const { v4: uuidv4 } = require('uuid');
const { uniqueNamesGenerator, adjectives, colors, animals, countries } = require('unique-names-generator');
const zmq = require("zeromq");
const readline = require('readline');

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
const MESSAGE_SERVER_ENDPOINT = "127.0.0.1:3001";

let onlineGroups = [];
let joinedGroups = [];

console.log("User info:", USER_INFO);

const groupHandler = zmq.socket("req");
const joinGroup = (group) => {
  console.log(group);
  groupHandler.connect(`tcp://${group.address}`);
  console.log("User connected to group at:", group.address);
  groupHandler.send(["JOIN", group.id, JSON.stringify(USER_INFO)]);
  joinedGroups.push(group);
};
const leaveGroup = (group, groupIndex) => {
  console.log(group);
  groupHandler.connect(`tcp://${group.address}`);
  console.log("User connected to group at:", group.address);
  groupHandler.send(["LEAVE", group.id, JSON.stringify(USER_INFO)]);
  joinedGroups.splice(groupIndex - 1, 1);
};
const sendMessage = (group, message) => {
  console.log(group);
  groupHandler.connect(`tcp://${group.address}`);
  console.log("User connected to group at:", group.address);
  groupHandler.send(["SEND", group.id, JSON.stringify({ "content": message, ...USER_INFO })]);
};
const getMessages = (group, timestamp) => {
  console.log(group);
  groupHandler.connect(`tcp://${group.address}`);
  console.log("User connected to group at:", group.address);
  groupHandler.send(["GET", group.id, JSON.stringify({ "timestamp": timestamp, ...USER_INFO })]);
};
groupHandler.on("message", (msg, type) => {
  console.log("raw:", msg);
  msg = msg.toString();
  try {
    msg = JSON.parse(msg);
  } catch { } finally {
    console.log(msg);
    console.log("\n");
  };
  if (type)
    switch (type.toString()) {
      case "JOIN":
        console.log(`Joined group.`);
        break;
      case "LEAVE":
        console.log(`Left group.`);
        break;
      case "SEND":
        console.log(`Sent message to group.`);
        break;
      case "GET":
        console.log(`Getting messages from group.`);
        break;
    };
    setTimeout(() => {
      displayMenu();
      promptForAction();
    }, 1000);
});

const serverHandler = zmq.socket("req");
serverHandler.connect(`tcp://${MESSAGE_SERVER_ENDPOINT}`);
console.log("User connected to message server at:", MESSAGE_SERVER_ENDPOINT);
serverHandler.on("message", (message) => {
  console.log("Received response: ", message.toString());
  let groups = [];
  try {
    groups = JSON.parse(message.toString());
  } catch (err) { } finally {
    onlineGroups = [...groups];
  };
  console.log("Online groups:");
  console.log(onlineGroups);
  setTimeout(() => {
    displayMenu();
    promptForAction();
  }, 1000);
});

// reading user input

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const promptForAction = () => {
  rl.question('Enter the action number (1-5): ', (action) => {
    switch (action) {
      case '1':
        // Handle GET list of online groups
        serverHandler.send(JSON.stringify(USER_INFO));
        console.log('Getting list of online groups...');
        break;
      case '2':
        // Handle JOIN a GROUP_SERVER
        displayGroups(onlineGroups);
        promptJoinGroup();
        break;
      case '3':
        // Handle LEAVE a GROUP_SERVER
        displayGroups(joinedGroups);
        promptLeaveGroup();
        break;
      case '4':
        // Handle SEND a text message
        displayGroups(joinedGroups);
        promptSendMessage();
        break;
      case '5':
        // Handle GET messages after a given timestamp
        displayGroups(joinedGroups);
        promptGetMessages();
        break;
      default:
        console.log('Invalid action. Please enter a number between 1 and 5.');
        setTimeout(() => {
          displayMenu();
          promptForAction();
        }, 2000);
        break;
    };
  });
};

function displayMenu() {
  console.group('\nAvailable Actions:');
  console.log('1. GET list of online groups from the MESSAGE_SERVER.');
  console.log('2. JOIN a GROUP_SERVER from the list of online groups.');
  console.log('3. LEAVE a GROUP_SERVER from the list of joined groups.');
  console.log('4. SEND a text message to a desired GROUP_SERVER.');
  console.log('5. GET messages from a GROUP_SERVER after a given timestamp.\n');
  console.groupEnd();
};

function displayGroups(groups) {
  console.log('\nAvailable Groups:');
  if (groups.length === 0) {
    console.log('none');
    return;
  };
  groups.forEach((group, index) => {
    console.log(`${index + 1}.`, group.name);
  });
};

function promptJoinGroup() {
  if (onlineGroups.length === 0) {
    console.log('No online groups available to join.');
    setTimeout(() => {
      displayMenu();
      promptForAction();
    }, 1000);
    return;
  };
  rl.question('Enter the serial number of the group you want to join: ', (groupIndex) => {
    joinGroup(onlineGroups[groupIndex - 1]);
  });
};

function promptLeaveGroup() {
  if (joinedGroups.length === 0) {
    console.log('You are not currently part of any groups.');
    setTimeout(() => {
      displayMenu();
      promptForAction();
    }, 1000);
    return;
  };
  rl.question('Enter the serial number of the group you want to leave: ', (groupIndex) => {
    leaveGroup(onlineGroups[groupIndex - 1], groupIndex);
  });
};

function promptSendMessage() {
  if (joinedGroups.length === 0) {
    console.log('You are not currently part of any groups. Please join a group first.');
    setTimeout(() => {
      displayMenu();
      promptForAction();
    }, 1000);
    return;
  };
  rl.question('Enter the serial number of the group and the text message (e.g., "1 Hello"): ', (input) => {
    const [groupIndex, message] = input.split(' ');
    sendMessage(onlineGroups[groupIndex - 1], message);
  });
};

function promptGetMessages() {
  if (joinedGroups.length === 0) {
    console.log('You are not currently part of any groups. Please join a group first.');
    setTimeout(() => {
      displayMenu();
      promptForAction();
    }, 1000);
    return;
  };
  rl.question('Enter the serial number of the group and the timestamp (e.g., "1 2024-02-16T12:00:00"): ', (input) => {
    const [groupIndex, timestamp] = input.split(' ');
    // Check if the timestamp is not provided and set it to an empty string if needed
    const actualTimestamp = timestamp || '';
    getMessages(onlineGroups[groupIndex - 1], actualTimestamp);
  });
};


displayMenu();
promptForAction();