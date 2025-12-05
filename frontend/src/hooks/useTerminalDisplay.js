/**
 * useTerminalDisplay - Custom hook for terminal display and rendering
 * Manages output, colors, formatting, and UI updates
 */

import { useCallback } from 'react';
import { sanitizeMessage, sanitizeUsername, sanitizeRoomName } from '../utils/sanitization';

// Helper: Format timestamp
const formatTime = (date) => {
    const d = date ? new Date(date) : new Date();
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

// Helper: Generate consistent color for username
const getUserColor = (username) => {
    const colors = [
        '\x1b[36m',  // Cyan
        '\x1b[33m',  // Yellow
        '\x1b[35m',  // Magenta
        '\x1b[32m',  // Green
        '\x1b[34m',  // Blue
        '\x1b[91m',  // Bright Red
        '\x1b[92m',  // Bright Green
        '\x1b[93m',  // Bright Yellow
        '\x1b[94m',  // Bright Blue
        '\x1b[95m',  // Bright Magenta
        '\x1b[96m',  // Bright Cyan
    ];
    // Hash username to get consistent color
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const RESET = '\x1b[0m';

export const useTerminalDisplay = (xtermRef, state) => {
    const getPrompt = useCallback(() => {
        if (state.current.inDM) {
            return `[DM:${state.current.dmUser}] > `;
        } else if (state.current.currentRoom) {
            return `[${state.current.currentRoom}] > `;
        } else if (state.current.loggedIn) {
            return `[${state.current.username}] > `;
        }
        return '> ';
    }, [state]);

    const writePrompt = useCallback(() => {
        if (xtermRef.current) {
            xtermRef.current.write(getPrompt());
        }
    }, [xtermRef, getPrompt]);

    const writeOutput = useCallback((text) => {
        if (xtermRef.current) {
            xtermRef.current.write(text + '\r\n');
        }
    }, [xtermRef]);

    const writeError = useCallback((error) => {
        if (xtermRef.current) {
            xtermRef.current.write(`\r\n⚠️  ${error}\r\n`);
        }
    }, [xtermRef]);

    const writeSuccess = useCallback((message) => {
        if (xtermRef.current) {
            xtermRef.current.write(`\r\n✓ ${message}\r\n`);
        }
    }, [xtermRef]);

    const clearLine = useCallback(() => {
        if (xtermRef.current) {
            xtermRef.current.write('\r\x1b[2K');
        }
    }, [xtermRef]);

    const displayHelp = useCallback(() => {
        const help = [
            'Available commands:',
            '/help                                          - Show this help',
            '/login <username>                              - Login',
            '/listrooms                                     - List available rooms',
            '/join <room>                                   - Join a room',
            '/users                                         - List users in current room',
            '/dm <username>                                 - Start direct message',
            '/exit                                          - Exit DM or leave room',
            '/logout                                        - Logout',
            '/adduser <username> <password> <securitykey>   - (Admin) Create new user',
            '/changepass <oldpass> <newpass> <securitykey>  - Change your password',
            '/createroom <roomname>                         - (Admin) Create new room',
            '/giveaccess <user1,user2,...> <roomname>       - (Admin) Grant room access to users',
            '/quit                                          - Quit the app',
            '',
            '--- New Features ---',
            '/clear                                         - Clear terminal screen',
            '/online                                        - Show all online users',
            '/theme <name>                                  - Change terminal theme',
            '/kick <username>                               - (Admin) Kick user from room',
            '/ban <username>                                - (Admin) Ban user from room',
            '/sound on|off                                  - Toggle sound notifications',
            '/profile [username]                            - View user profile',
            '/roominfo                                      - View current room info',
            ''
        ];
        if (xtermRef.current) {
            help.forEach(line => xtermRef.current.write(line + '\r\n'));
        }
    }, [xtermRef]);

    const displayWelcome = useCallback(() => {
        if (xtermRef.current) {
            const welcomeAscii = `
  _______  _______  _______ 
 |       ||       ||       |
 |_     _||       ||   _   |
   |   |  |       ||  |_|  |
   |   |  |      _||       |
   |   |  |     |_ |   _   |
   |___|  |_______||__| |__|
   
   Terminal Communication Array v2.0
   Secure. Fast. Decentralized.
   
   Type /help to see available commands.
            `;
            xtermRef.current.write(welcomeAscii.replace(/\n/g, '\r\n') + '\r\n');
        }
    }, [xtermRef]);

    const displayRoomMessage = useCallback((room, user, message, timestamp) => {
        const sanitizedUser = sanitizeUsername(user);
        const sanitizedMsg = sanitizeMessage(message);
        const time = formatTime(timestamp);
        const color = getUserColor(user);
        if (xtermRef.current) {
            xtermRef.current.write(`\r\n\x1b[90m[${time}]\x1b[0m [${room}] ${color}${sanitizedUser}${RESET}: ${sanitizedMsg}\r\n`);
        }
    }, [xtermRef]);

    const displayDM = useCallback((data, currentUsername) => {
        const direction = data.from === currentUsername ? 'to' : 'from';
        const other = direction === 'to' ? data.to : data.from;
        const sanitizedOther = sanitizeUsername(other);
        const sanitizedMsg = sanitizeMessage(data.msg);
        const time = formatTime(data.timestamp);
        const color = getUserColor(other);
        if (xtermRef.current) {
            xtermRef.current.write(`\r\n\x1b[90m[${time}]\x1b[0m [DM ${direction} ${color}${sanitizedOther}${RESET}]: ${sanitizedMsg}\r\n`);
        }
    }, [xtermRef]);

    const displayUserList = useCallback((users) => {
        if (xtermRef.current && users && users.length > 0) {
            const userList = users.map(u => {
                const color = getUserColor(u);
                return `${color}${sanitizeUsername(u)}${RESET}`;
            }).join(', ');
            xtermRef.current.write(`Users in room: ${userList}\r\n`);
        }
    }, [xtermRef]);

    const displayRoomHistory = useCallback((messages) => {
        if (xtermRef.current && messages && messages.length > 0) {
            messages.forEach(msg => {
                const room = sanitizeRoomName(msg.room);
                const user = sanitizeUsername(msg.from);
                const text = sanitizeMessage(msg.text);
                const time = formatTime(msg.timestamp);
                const color = getUserColor(msg.from);
                xtermRef.current.write(`\x1b[90m[${time}]\x1b[0m [${room}] ${color}${user}${RESET}: ${text}\r\n`);
            });
        }
    }, [xtermRef]);

    const displayDMHistory = useCallback((messages, currentUsername) => {
        if (xtermRef.current && messages && messages.length > 0) {
            messages.forEach(msg => {
                const direction = msg.from === currentUsername ? 'to' : 'from';
                const other = direction === 'to' ? msg.to : msg.from;
                const sanitizedOther = sanitizeUsername(other);
                const text = sanitizeMessage(msg.text);
                const time = formatTime(msg.timestamp);
                const color = getUserColor(other);
                xtermRef.current.write(`\x1b[90m[${time}]\x1b[0m [DM ${direction} ${color}${sanitizedOther}${RESET}]: ${text}\r\n`);
            });
        }
    }, [xtermRef]);

    return {
        getPrompt,
        writePrompt,
        writeOutput,
        writeError,
        writeSuccess,
        clearLine,
        displayHelp,
        displayRoomMessage,
        displayDM,
        displayUserList,
        displayRoomHistory,
        displayDMHistory,
        displayWelcome
    };
};
