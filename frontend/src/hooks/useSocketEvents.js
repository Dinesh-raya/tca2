/**
 * useSocketEvents - Custom hook for socket.io event handlers
 * Manages all socket event listeners and responses
 */

import { useCallback } from 'react';

export const useSocketEvents = (socketRef, state, xtermRef, display) => {
    const setupSocketListeners = useCallback(() => {
        const socket = socketRef.current;
        if (!socket) return;

        // Clean up existing listeners
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('room-message');
        socket.off('dm');
        socket.off('room-user-disconnect');
        socket.off('dm-user-disconnect');
        socket.off('join-room-success');
        socket.off('join-room-error');
        socket.off('users-list');
        socket.off('room-users');
        socket.off('room-history');
        socket.off('dm-history');
        socket.off('dm-error');

        // Join room events
        socket.on('join-room-success', ({ room }) => {
            state.current.currentRoom = room;
            state.current.inDM = false;
            state.current.dmUser = '';
            display.writeSuccess(`Joined room: ${room}`);
            socket.emit('get-users', { room });
            display.writePrompt();
        });

        socket.on('join-room-error', ({ msg }) => {
            display.writeError(`Join room failed: ${msg}`);
            display.writePrompt();
        });

        // Users list
        socket.on('users-list', (users) => {
            display.displayUserList(users);
            display.writePrompt();
        });

        // Real-time user list updates
        socket.on('room-users', (users) => {
            display.clearLine();
            display.writeOutput(`[Updated] Users in room: ${users.join(', ')}`);
            display.writePrompt();
        });

        // Room history
        socket.on('room-history', (messages) => {
            display.displayRoomHistory(messages);
            display.writePrompt();
        });

        // DM history
        socket.on('dm-history', (messages) => {
            display.displayDMHistory(messages, state.current.username);
            display.writePrompt();
        });

        // Room messages
        socket.on('room-message', (data) => {
            display.clearLine();
            display.displayRoomMessage(data.room, data.user, data.msg);
            display.writePrompt();
        });

        // Direct messages
        socket.on('dm', (data) => {
            display.clearLine();
            display.displayDM(data, state.current.username);
            display.writePrompt();
        });

        // DM errors
        socket.on('dm-error', ({ msg }) => {
            display.clearLine();
            display.writeError(`DM Error: ${msg}`);
            display.writePrompt();
        });

        // Connection events
        socket.on('connect', () => {
            display.writeOutput('Connected to server.');
            if (state.current.currentRoom) {
                display.writeOutput(`Re-joining room ${state.current.currentRoom}...`);
                socket.emit('join-room', {
                    room: state.current.currentRoom,
                    username: state.current.username
                });
            }
            display.writePrompt();
        });

        socket.on('disconnect', () => {
            const timestamp = new Date().toLocaleTimeString();
            display.writeError(`Disconnected from server at ${timestamp}`);
            display.writePrompt();
        });

        socket.on('connect_error', (error) => {
            display.writeError(`Connection error: ${error.message}`);
            display.writePrompt();
        });

        // Disconnect notifications
        socket.on('room-user-disconnect', ({ username, timestamp }) => {
            display.clearLine();
            display.writeOutput(`[${state.current.currentRoom}] ${username} disconnected at ${timestamp}`);
            display.writePrompt();
        });

        socket.on('dm-user-disconnect', ({ username, timestamp }) => {
            display.clearLine();
            display.writeOutput(`[DM] ${username} disconnected at ${timestamp}`);
            display.writePrompt();
        });
        // User Status
        socket.on('user-status', ({ username, status }) => {
            if (username !== state.current.username) {
                display.clearLine();
                display.writeOutput(`[Status] ${username} is now ${status}`);
                display.writePrompt();
            }
        });

        // Typing Indicators
        socket.on('user-typing', ({ username }) => {
            display.clearLine();
            display.writeOutput(`... ${username} is typing ...`);
            display.writePrompt();
        });

        socket.on('user-stop-typing', ({ username }) => {
            // Optional: Clear the typing message or just ignore
            // For a cleaner terminal, we might just ignore the stop event 
            // or overwrite the line if we tracked it.
            // For now, let's just reprint prompt to "clear" the visual distraction
            display.writePrompt();
        });

    }, [socketRef, state, display]);

    const sendRoomMessage = useCallback((message) => {
        if (!state.current.loggedIn || !socketRef.current) return;

        if (state.current.currentRoom) {
            socketRef.current.emit('room-message', {
                room: state.current.currentRoom,
                msg: message,
                user: state.current.username
            }, (response) => {
                if (response && response.status !== 'ok') {
                    display.writeError(`Error sending message: ${response.msg}`);
                    display.writePrompt();
                }
            });
        }
    }, [state, socketRef, display]);

    const sendDM = useCallback((message) => {
        if (!state.current.loggedIn || !socketRef.current) return;

        if (state.current.inDM) {
            socketRef.current.emit('dm', {
                to: state.current.dmUser,
                msg: message,
                from: state.current.username
            }, (response) => {
                if (response && response.status !== 'ok') {
                    display.writeError(`Error sending DM: ${response.msg}`);
                    display.writePrompt();
                }
            });
        }
    }, [state, socketRef, display]);

    return {
        setupSocketListeners,
        sendRoomMessage,
        sendDM
    };
};
