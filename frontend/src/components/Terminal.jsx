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
    useTerminalDisplay,
    useTerminalCommands,
    useSocketEvents,
    useTerminalInput
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

    // Ref for commands to break circular dependency
    const commandsRef = useRef(null);

    const handleCommand = (cmd) => {
        if (commandsRef.current) {
            commandsRef.current.handleCommand(cmd);
        }
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

    const input = useTerminalInput(xtermRef, state, handleCommand, handleMessage, display.getPrompt, display.writePrompt, AVAILABLE_COMMANDS);

    // Setup commands with input locking
    const commands = useTerminalCommands(state, socketRef, xtermRef, backendUrl, display, events.setupSocketListeners, input.lockInput, input.unlockInput);

    // Update ref
    useLayoutEffect(() => {
        commandsRef.current = commands;
    });

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

        // Setup input handler
        const cleanupInput = input.setupKeyboardListener();

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
            cleanupInput();
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
