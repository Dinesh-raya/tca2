/**
 * useTerminalInput - Custom hook for terminal input handling
 * Manages input buffer, prompt display, and keyboard events
 */

import { useRef, useCallback } from 'react';

export const useTerminalInput = (xtermRef, state, onCommand, onMessage, getPrompt, writePrompt, availableCommands = []) => {
    const inputBuffer = useRef('');
    const history = useRef([]);
    const historyIndex = useRef(-1);

    const handleEnter = useCallback(() => {
        if (!xtermRef.current) return;

        const promptText = getPrompt();
        const totalLength = promptText.length + inputBuffer.current.length;
        xtermRef.current.write('\r' + ' '.repeat(totalLength) + '\r');

        const trimmedInput = inputBuffer.current.trim();

        // Add to history if not empty
        if (trimmedInput) {
            history.current.push(trimmedInput);
            historyIndex.current = history.current.length;
        }

        inputBuffer.current = '';

        if (trimmedInput.length > 0) {
            if (trimmedInput.startsWith('/')) {
                onCommand(trimmedInput);
            } else {
                onMessage(trimmedInput);
            }
        } else {
            writePrompt();
        }
    }, [xtermRef, getPrompt, onCommand, onMessage, writePrompt]);

    const handleBackspace = useCallback(() => {
        if (inputBuffer.current.length > 0) {
            inputBuffer.current = inputBuffer.current.slice(0, -1);
            if (xtermRef.current) {
                xtermRef.current.write('\b \b');
            }
        }
    }, [xtermRef]);

    const handleCharacter = useCallback((key) => {
        inputBuffer.current += key;
        if (xtermRef.current) {
            xtermRef.current.write(key);
        }
    }, [xtermRef]);

    const handleArrowUp = useCallback(() => {
        if (historyIndex.current > 0) {
            historyIndex.current--;
            const cmd = history.current[historyIndex.current];

            // Clear current line
            const promptText = getPrompt();
            const totalLength = promptText.length + inputBuffer.current.length;
            xtermRef.current.write('\r' + ' '.repeat(totalLength) + '\r');

            // Write new command
            inputBuffer.current = cmd;
            writePrompt();
            xtermRef.current.write(cmd);
        }
    }, [xtermRef, getPrompt, writePrompt]);

    const handleArrowDown = useCallback(() => {
        if (historyIndex.current < history.current.length - 1) {
            historyIndex.current++;
            const cmd = history.current[historyIndex.current];

            // Clear current line
            const promptText = getPrompt();
            const totalLength = promptText.length + inputBuffer.current.length;
            xtermRef.current.write('\r' + ' '.repeat(totalLength) + '\r');

            // Write new command
            inputBuffer.current = cmd;
            writePrompt();
            xtermRef.current.write(cmd);
        } else if (historyIndex.current === history.current.length - 1) {
            historyIndex.current++;

            // Clear current line
            const promptText = getPrompt();
            const totalLength = promptText.length + inputBuffer.current.length;
            xtermRef.current.write('\r' + ' '.repeat(totalLength) + '\r');

            // Clear buffer
            inputBuffer.current = '';
            writePrompt();
        }
    }, [xtermRef, getPrompt, writePrompt]);

    const handleTab = useCallback(() => {
        const currentInput = inputBuffer.current;
        if (currentInput.startsWith('/')) {
            const matches = availableCommands.filter(cmd => cmd.startsWith(currentInput));
            if (matches.length === 1) {
                const completion = matches[0].slice(currentInput.length);
                inputBuffer.current += completion;
                xtermRef.current.write(completion);
            }
        }
    }, [availableCommands, xtermRef]);

    const setupKeyboardListener = useCallback((_container) => {
        const handleKeyEvent = ({ key, domEvent }) => {
            if (domEvent.key === 'Enter') {
                handleEnter();
            } else if (domEvent.key === 'Backspace') {
                handleBackspace();
            } else if (domEvent.key === 'ArrowUp') {
                handleArrowUp();
            } else if (domEvent.key === 'ArrowDown') {
                handleArrowDown();
            } else if (domEvent.key === 'Tab') {
                domEvent.preventDefault(); // Prevent focus change
                handleTab();
            } else if (
                domEvent.key.length === 1 &&
                !domEvent.ctrlKey &&
                !domEvent.metaKey
            ) {
                handleCharacter(key);
            }
        };

        if (xtermRef.current) {
            xtermRef.current.onKey(handleKeyEvent);
        }

        return () => {
            // Cleanup handled by terminal disposal
        };
    }, [handleEnter, handleBackspace, handleCharacter, handleArrowUp, handleArrowDown, handleTab]);

    const getInputBuffer = useCallback(() => inputBuffer.current, []);

    const clearInputBuffer = useCallback(() => {
        inputBuffer.current = '';
    }, []);

    return {
        setupKeyboardListener,
        getInputBuffer,
        clearInputBuffer,
        handleEnter,
        handleBackspace,
        handleCharacter
    };
};
