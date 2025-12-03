/**
 * useTerminalCommands - Custom hook for terminal commands handling
 * Manages command execution, routing, and business logic
 */

import { useCallback } from 'react';
import { promptForPassword } from '../utils/terminalUtils';

export const useTerminalCommands = (state, socketRef, xtermRef, backendUrl, display) => {
    const handleLoginCommand = useCallback(async (args) => {
        if (state.current.loggedIn) {
            display.writeOutput('Already logged in.');
            display.writePrompt();
            return;
        }

        if (args.length < 1) {
            display.writeOutput('Usage: /login <username>');
            display.writePrompt();
            return;
        }

        const username = args[0];
        display.writeOutput(`Username: ${username}`);

        try {
            const password = await promptForPassword(xtermRef, 'Password: ');
            
            if (!password) {
                display.writeOutput('Login cancelled.');
                display.writePrompt();
                return;
            }

            const res = await fetch(`${backendUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const body = await res.json();

            if (res.status === 200 && body.token) {
                state.current.loggedIn = true;
                state.current.username = body.user.username;
                state.current.token = body.token;
                display.writeSuccess(`Logged in as ${body.user.username}`);

                socketRef.current = new (require('socket.io-client')).io(backendUrl, {
                    auth: { token: body.token }
                });
                // Socket listeners will be set up in useSocketEvents
            } else {
                display.writeError(`Login failed: ${body.msg || 'Invalid credentials'}`);
            }
            display.writePrompt();
        } catch (err) {
            display.writeError(`Login error: ${err.message}`);
            display.writePrompt();
        }
    }, [state, socketRef, xtermRef, backendUrl, display]);

    const handleListRoomsCommand = useCallback(async () => {
        try {
            const res = await fetch(`${backendUrl}/api/rooms`);
            const rooms = await res.json();
            if (rooms && rooms.length > 0) {
                display.writeOutput(`Available rooms: ${rooms.join(', ')}`);
            } else {
                display.writeOutput('No rooms available.');
            }
            display.writePrompt();
        } catch (err) {
            display.writeError('Could not fetch rooms.');
            display.writePrompt();
        }
    }, [backendUrl, display]);

    const handleJoinCommand = useCallback((args) => {
        if (!state.current.loggedIn) {
            display.writeError('Please login first.');
            display.writePrompt();
            return;
        }

        if (args.length < 1) {
            display.writeOutput('Usage: /join <room>');
            display.writePrompt();
            return;
        }

        if (socketRef.current) {
            socketRef.current.emit('join-room', { 
                room: args[0], 
                username: state.current.username 
            });
        }
    }, [state, socketRef, display]);

    const handleUsersCommand = useCallback(() => {
        if (!state.current.loggedIn || !state.current.currentRoom) {
            display.writeError('Join a room first.');
            display.writePrompt();
            return;
        }

        if (socketRef.current) {
            socketRef.current.emit('get-users', { room: state.current.currentRoom });
        }
    }, [state, socketRef, display]);

    const handleDMCommand = useCallback((args) => {
        if (!state.current.loggedIn) {
            display.writeError('Please login first.');
            display.writePrompt();
            return;
        }

        if (args.length < 1) {
            display.writeOutput('Usage: /dm <username>');
            display.writePrompt();
            return;
        }

        const targetUser = args[0];
        state.current.inDM = true;
        state.current.dmUser = targetUser;
        display.writeOutput(`[DM with ${targetUser} started]`);

        if (socketRef.current) {
            socketRef.current.emit('get-dm-history', {
                user1: state.current.username,
                user2: targetUser
            });
        }
    }, [state, socketRef, display]);

    const handleExitCommand = useCallback(() => {
        if (state.current.inDM) {
            state.current.inDM = false;
            state.current.dmUser = '';
            display.writeOutput('Exited DM.');
        } else if (state.current.currentRoom) {
            if (socketRef.current) {
                socketRef.current.emit('leave-room', {
                    room: state.current.currentRoom,
                    username: state.current.username
                });
            }
            state.current.currentRoom = '';
            display.writeOutput('Left the room.');
        } else {
            display.writeOutput('Nothing to exit.');
        }
        display.writePrompt();
    }, [state, socketRef, display]);

    const handleLogoutCommand = useCallback(() => {
        if (!state.current.loggedIn) {
            display.writeOutput('Not logged in.');
            display.writePrompt();
            return;
        }

        if (socketRef.current) {
            socketRef.current.emit('logout');
        }

        state.current.loggedIn = false;
        state.current.username = '';
        state.current.currentRoom = '';
        state.current.inDM = false;
        state.current.dmUser = '';
        state.current.token = null;
        display.writeOutput('Logged out.');
        display.writePrompt();
    }, [state, socketRef, display]);

    const handleAddUserCommand = useCallback(async (args) => {
        if (!state.current.loggedIn) {
            display.writeError('Please login first.');
            display.writePrompt();
            return;
        }

        if (args.length < 3) {
            display.writeOutput('Usage: /adduser <username> <password> <securitykey>');
            display.writePrompt();
            return;
        }

        try {
            const res = await fetch(`${backendUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': state.current.token
                },
                body: JSON.stringify({
                    username: args[0],
                    password: args[1],
                    securityKey: args[2]
                })
            });

            const body = await res.json();

            if (res.status === 200) {
                display.writeSuccess(body.msg);
            } else {
                display.writeError(body.msg || (body.errors && body.errors[0].msg) || 'Failed to create user');
            }
            display.writePrompt();
        } catch (err) {
            display.writeError('Network error.');
            display.writePrompt();
        }
    }, [state, backendUrl, display]);

    const handleChangePassCommand = useCallback(async (args) => {
        if (!state.current.loggedIn) {
            display.writeError('Please login first.');
            display.writePrompt();
            return;
        }

        if (args.length < 3) {
            display.writeOutput('Usage: /changepass <oldpassword> <newpassword> <securitykey>');
            display.writePrompt();
            return;
        }

        try {
            const res = await fetch(`${backendUrl}/api/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': state.current.token
                },
                body: JSON.stringify({
                    oldPassword: args[0],
                    newPassword: args[1],
                    securityKey: args[2]
                })
            });

            const body = await res.json();

            if (res.status === 200) {
                display.writeSuccess(body.msg);
                // Auto logout
                if (socketRef.current) socketRef.current.emit('logout');
                state.current.loggedIn = false;
                state.current.username = '';
                state.current.token = '';
            } else {
                display.writeError(body.msg || (body.errors && body.errors[0].msg) || 'Failed to change password');
            }
            display.writePrompt();
        } catch (err) {
            display.writeError('Network error.');
            display.writePrompt();
        }
    }, [state, socketRef, backendUrl, display]);

    const handleGiveAccessCommand = useCallback(async (args) => {
        if (!state.current.loggedIn) {
            display.writeError('Please login first.');
            display.writePrompt();
            return;
        }

        if (args.length < 2) {
            display.writeOutput('Usage: /giveaccess <username> <roomname>');
            display.writePrompt();
            return;
        }

        try {
            const res = await fetch(`${backendUrl}/api/admin/grant-room-access`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': state.current.token
                },
                body: JSON.stringify({
                    username: args[0],
                    roomName: args[1]
                })
            });

            const body = await res.json();

            if (res.status === 200) {
                display.writeSuccess(body.msg);
            } else {
                display.writeError(body.msg || 'Failed to grant access');
            }
            display.writePrompt();
        } catch (err) {
            display.writeError('Network error.');
            display.writePrompt();
        }
    }, [state, backendUrl, display]);

    const handleCommand = useCallback((cmd) => {
        const [command, ...args] = cmd.split(' ');

        switch (command) {
            case '/help':
                display.displayHelp();
                display.writePrompt();
                break;
            case '/login':
                handleLoginCommand(args);
                break;
            case '/listrooms':
                handleListRoomsCommand();
                break;
            case '/join':
                handleJoinCommand(args);
                break;
            case '/users':
                handleUsersCommand();
                break;
            case '/dm':
                handleDMCommand(args);
                break;
            case '/exit':
                handleExitCommand();
                break;
            case '/adduser':
                handleAddUserCommand(args);
                break;
            case '/changepass':
                handleChangePassCommand(args);
                break;
            case '/giveaccess':
                handleGiveAccessCommand(args);
                break;
            case '/logout':
                handleLogoutCommand();
                break;
            case '/quit':
                display.writeOutput('Thank you for using Terminal Chat!');
                break;
            default:
                display.writeError(`Unknown command: ${command}. Type /help for list of commands.`);
                display.writePrompt();
        }
    }, [
        display,
        handleLoginCommand,
        handleListRoomsCommand,
        handleJoinCommand,
        handleUsersCommand,
        handleDMCommand,
        handleExitCommand,
        handleAddUserCommand,
        handleChangePassCommand,
        handleGiveAccessCommand,
        handleLogoutCommand
    ]);

    return {
        handleCommand
    };
};
