/**
 * Terminal Component (Refactored)
 * Main terminal component using custom hooks
 * Reduced from 598 to 240 lines
 */

import React, { useLayoutEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import {
    useTerminalInput,
    useTerminalDisplay,
    useTerminalCommands,
    useSocketEvents
} from '../hooks';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const Terminal = () => {
    const terminalRef = useRef(null);
    const xtermRef = useRef(null);
    const fitAddonRef = useRef(null);
    const socketRef = useRef(null);

    // Application state
    const state = useRef({
        loggedIn: false,
        username: '',
        currentRoom: '',
        inDM: false,
        dmUser: '',
        token: null,
    });

    // Available commands for autocomplete
    const AVAILABLE_COMMANDS = [
        '/help', '/login', '/listrooms', '/join', '/users', '/dm',
        '/exit', '/logout', '/adduser', '/changepass', '/giveaccess', '/quit'
    ];

    // Initialize hooks
    const display = useTerminalDisplay(xtermRef, state);
    const events = useSocketEvents(socketRef, state, xtermRef, display);

    // Setup commands after other dependencies are ready
    const commands = useTerminalCommands(state, socketRef, xtermRef, backendUrl, display);

    // Update input hook with command/message handlers
    const handleCommand = (cmd) => {
        commands.handleCommand(cmd);
    };

    const handleMessage = (msg) => {
        if (!state.current.loggedIn) {
            display.writeError('Please login to send messages.');
            return;
        }

        if (state.current.inDM) {
            events.sendDM(msg);
        } else if (state.current.currentRoom) {
            events.sendRoomMessage(msg);
        } else {
            display.writeError('Join a room or start a DM to send messages.');
        }
    };

    useLayoutEffect(() => {
        if (!terminalRef.current) return;

        // Initialize XTerm
        xtermRef.current = new XTerm({
            cursorBlink: true,
            fontFamily: 'monospace',
            fontSize: 16,
            theme: {
                background: '#1e1e1e',
                foreground: '#00ff00'
            }
        });

        fitAddonRef.current = new FitAddon();
        xtermRef.current.loadAddon(fitAddonRef.current);

        const container = terminalRef.current;
        xtermRef.current.open(container);
        fitAddonRef.current.fit();
        xtermRef.current.focus();

        // Setup input handler with command/message callbacks
        let inputBuffer = '';
        const getPrompt = display.getPrompt;
        const writePrompt = display.writePrompt;

        xtermRef.current.onKey(({ key, domEvent }) => {
            if (domEvent.key === 'Enter') {
                const promptText = getPrompt();
                const totalLength = promptText.length + inputBuffer.length;
                xtermRef.current.write('\r' + ' '.repeat(totalLength) + '\r');

                const trimmedInput = inputBuffer.trim();
                inputBuffer = '';

                if (trimmedInput.length > 0) {
                    if (trimmedInput.startsWith('/')) {
                        handleCommand(trimmedInput);
                    } else {
                        handleMessage(trimmedInput);
                    }
                } else {
                    writePrompt();
                }
            } else if (domEvent.key === 'Backspace') {
                if (inputBuffer.length > 0) {
                    inputBuffer = inputBuffer.slice(0, -1);
                    xtermRef.current.write('\b \b');
                }
            } else if (
                domEvent.key.length === 1 &&
                !domEvent.ctrlKey &&
                !domEvent.metaKey
            ) {
                inputBuffer += key;
                xtermRef.current.write(key);
            }
        });

        // Setup socket event listeners
        events.setupSocketListeners();

        // Setup event listeners
        const handleClick = () => xtermRef.current.focus();
        container.addEventListener('click', handleClick);

        const handleResize = () => fitAddonRef.current.fit();
        window.addEventListener('resize', handleResize);

        // Write initial prompt and welcome message
        display.displayWelcome();
        display.writePrompt();

        // Cleanup
        return () => {
            xtermRef.current?.dispose();
            if (container) container.removeEventListener('click', handleClick);
            window.removeEventListener('resize', handleResize);
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Keep empty - terminal should only initialize once

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#1e1e1e' }}>
            <div
                ref={terminalRef}
                style={{
                    width: '100vw',
                    height: '100vh',
                    background: '#1e1e1e'
                }}
                tabIndex={0}
            />
        </div>
    );
};

export default Terminal;
