/**
 * useTerminalDisplay - Custom hook for terminal display and rendering
 * Manages output, colors, formatting, and UI updates
 */

import { useCallback, useMemo } from 'react';
import { sanitizeMessage, sanitizeUsername, sanitizeRoomName } from '../utils/sanitization';

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

    const displayRoomMessage = useCallback((room, user, message) => {
        const sanitizedUser = sanitizeUsername(user);
        const sanitizedMsg = sanitizeMessage(message);
        if (xtermRef.current) {
            xtermRef.current.write(`\r\n[${room}] ${sanitizedUser}: ${sanitizedMsg}\r\n`);
        }
    }, [xtermRef]);

    const displayDM = useCallback((data, currentUsername) => {
        const direction = data.from === currentUsername ? 'to' : 'from';
        const other = direction === 'to' ? data.to : data.from;
        const sanitizedOther = sanitizeUsername(other);
        const sanitizedMsg = sanitizeMessage(data.msg);
        if (xtermRef.current) {
            xtermRef.current.write(`\r\n[DM ${direction} ${sanitizedOther}]: ${sanitizedMsg}\r\n`);
        }
    }, [xtermRef]);

    const displayUserList = useCallback((users) => {
        if (xtermRef.current && users && users.length > 0) {
            const userList = users.map(u => sanitizeUsername(u)).join(', ');
            xtermRef.current.write(`Users in room: ${userList}\r\n`);
        }
    }, [xtermRef]);

    const displayRoomHistory = useCallback((messages) => {
        if (xtermRef.current && messages && messages.length > 0) {
            messages.forEach(msg => {
                const room = sanitizeRoomName(msg.room);
                const user = sanitizeUsername(msg.from);
                const text = sanitizeMessage(msg.text);
                xtermRef.current.write(`[${room}] ${user}: ${text}\r\n`);
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
                xtermRef.current.write(`[DM ${direction} ${sanitizedOther}]: ${text}\r\n`);
            });
        }
    }, [xtermRef]);

    return useMemo(() => ({
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
    }), [
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
    ]);
};
