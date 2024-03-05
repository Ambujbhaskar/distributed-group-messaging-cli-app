# Group Messaging Application Documentation

## Overview

The Group Messaging Application is a distributed system that enables users to communicate within groups. The system is composed of three main components: MESSAGE_SERVER, GROUP_SERVERs, and USERs. ZeroMQ is utilized for communication between these components.

## Architecture

### MESSAGE_SERVER

The MESSAGE_SERVER is responsible for managing online groups and facilitating communication between GROUP_SERVERs and USERs. It provides an API for retrieving a list of online groups.

### GROUP_SERVER

GROUP_SERVERs are responsible for managing specific groups. They handle user joins, leaves, and message storage for their respective groups.

### USER

USERs are clients that interact with the system. They can perform actions such as getting a list of online groups, joining/leaving groups, sending messages, and retrieving messages from groups.

## Key Components

- **MESSAGE_SERVER:**
  - Provides an API for getting online groups.
  - Listens for requests from GROUP_SERVERs and USERs.

- **GROUP_SERVER:**
  - Manages a specific group, handling user joins, leaves, and message storage.
  - Communicates with the MESSAGE_SERVER for online group information.

- **USER:**
  - Interacts with the system by performing actions such as joining/leaving groups and sending/receiving messages.
  - Utilizes ZeroMQ to communicate with MESSAGE_SERVER and GROUP_SERVERs.

## Communication Protocols

### ZeroMQ

ZeroMQ is used for communication between components. The following patterns are employed:

- **Request-Reply:**
  - USERs send requests to MESSAGE_SERVER and GROUP_SERVERs to perform actions.
  - MESSAGE_SERVER and GROUP_SERVERs reply with appropriate responses.

## Usage Guidelines

Each user and each group are randomly assigned ports and unique ids, as well as names.

### Running the Application

1. Start the MESSAGE_SERVER:
   ```bash
   node message_server.js
   ```

2. Start GROUP_SERVERs (one for each group):
   ```bash
   node group_server.js
   ```

3. Start USERs:
   ```bash
   node user_client.js
   ```

### Actions

1. **Getting Online Groups:**
   - USER: Execute action 1 to get a list of online groups.

2. **Joining a Group:**
   - USER: Execute action 2, select a group from the list, and join.

3. **Leaving a Group:**
   - USER: Execute action 3, select a joined group, and leave.

4. **Sending a Message:**
   - USER: Execute action 4, select a joined group, and provide a message.

5. **Getting Messages:**
   - USER: Execute action 5, select a joined group, and provide a timestamp (optional).

## Conclusion

The Group Messaging Application leverages ZeroMQ to create a scalable and efficient distributed system. Users can seamlessly interact with online groups, join/leave groups, and exchange messages in real-time.