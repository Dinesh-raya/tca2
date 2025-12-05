/**
 * Terminal Utilities
 * Handles password input masking and secret input prompts
 */

/**
 * Prompts user for password input with masking
 * Shows asterisks instead of actual characters
 * @param {React.MutableRefObject} xtermRef - Reference to xterm instance
 * @param {string} promptText - Prompt text to display
 * @returns {Promise<string>} User entered password
 */
export const promptForPassword = (xtermRef, promptText = 'Password: ') => {
    return new Promise((resolve) => {
        xtermRef.current.write(promptText);
        let password = '';
        let active = true;
        let disposable;

        const listener = (e) => {
            if (!active) return;

            // Stop propagation to prevent other listeners (like main terminal input) from firing
            if (e.domEvent) {
                e.domEvent.stopPropagation();
                e.domEvent.preventDefault();
            }

            const key = e.key;
            const domEvent = e.domEvent;

            if (domEvent.key === 'Enter') {
                // User pressed Enter - submit password
                xtermRef.current.write('\r\n');
                active = false;
                if (disposable) disposable.dispose(); // Remove listener
                resolve(password);
            } else if (domEvent.key === 'Backspace') {
                if (password.length > 0) {
                    // Remove last character from password
                    password = password.slice(0, -1);
                    // Move cursor back, overwrite with space, move back
                    xtermRef.current.write('\b \b');
                }
            } else if (key.length === 1 && !domEvent.ctrlKey && !domEvent.metaKey && !domEvent.altKey) {
                // Regular character - add to password
                password += key;
                // Display asterisk instead of actual character
                xtermRef.current.write('*');
            }
            // Ignore all other keys (arrows, ctrl+c, etc. handled by terminal)
        };

        disposable = xtermRef.current.onKey(listener);
    });
};

/**
 * Prompts user for secret input (e.g., security key)
 * Same as password but with different prompt
 * @param {React.MutableRefObject} xtermRef - Reference to xterm instance
 * @param {string} promptText - Prompt text to display
 * @returns {Promise<string>} User entered secret
 */
export const getSecretInput = (xtermRef, promptText = 'Enter security key: ') => {
    return promptForPassword(xtermRef, promptText);
};

/**
 * Prompts user for visible input (e.g., username)
 * Shows what the user types
 * @param {React.MutableRefObject} xtermRef - Reference to xterm instance
 * @param {string} promptText - Prompt text to display
 * @returns {Promise<string>} User entered input
 */
export const getVisibleInput = (xtermRef, promptText = 'Enter: ') => {
    return new Promise((resolve) => {
        xtermRef.current.write(promptText);
        let input = '';
        let active = true;
        let disposable;

        const listener = ({ key, domEvent }) => {
            if (!active) return;

            if (domEvent.key === 'Enter') {
                xtermRef.current.write('\r\n');
                active = false;
                if (disposable) disposable.dispose();
                resolve(input);
            } else if (domEvent.key === 'Backspace' && input.length > 0) {
                input = input.slice(0, -1);
                xtermRef.current.write('\b \b');
            } else if (domEvent.key.length === 1 && !domEvent.ctrlKey && !domEvent.metaKey && !domEvent.altKey) {
                input += key;
                xtermRef.current.write(key);
            }
        };

        disposable = xtermRef.current.onKey(listener);
    });
};

/**
 * Clears terminal screen
 * @param {React.MutableRefObject} xtermRef - Reference to xterm instance
 */
export const clearTerminal = (xtermRef) => {
    xtermRef.current.clear();
};

/**
 * Writes text to terminal with optional newline
 * @param {React.MutableRefObject} xtermRef - Reference to xterm instance
 * @param {string} text - Text to write
 * @param {boolean} newline - Add newline after text (default: true)
 */
export const writeToTerminal = (xtermRef, text, newline = true) => {
    if (typeof text !== 'string') text = String(text);
    if (newline) {
        xtermRef.current.write(text + '\r\n');
    } else {
        xtermRef.current.write(text);
    }
};
