# TCA Socket Events Documentation

## Client -> Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `join-room` | `{ room, username }` | Join a chat room |
| `leave-room` | `{ room, username }` | Leave a chat room |
| `room-message` | `{ room, msg, user }` | Send a message to a room |
| `dm` | `{ to, msg, from }` | Send a direct message |
| `get-users` | `{ room }` | Request list of users in a room |
| `get-dm-history` | `{ user1, user2 }` | Request DM history |
| `typing` | `{ room, username }` | User started typing |
| `stop-typing` | `{ room, username }` | User stopped typing |
| `logout` | `null` | User logging out |

## Server -> Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `join-room-success` | `{ room }` | Successfully joined room |
| `join-room-error` | `{ msg }` | Error joining room |
| `room-message` | `{ room, msg, user }` | New message in room |
| `dm` | `{ from, to, msg }` | New direct message |
| `room-history` | `[messages]` | History of messages in room |
| `dm-history` | `[messages]` | History of direct messages |
| `users-list` | `[usernames]` | List of users in room |
| `room-users` | `[usernames]` | Updated list of users in room |
| `user-status` | `{ username, status }` | User online/offline status update |
| `user-typing` | `{ username }` | User is typing indicator |
| `dm-error` | `{ msg }` | Error sending DM |
