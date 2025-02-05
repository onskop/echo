// Initialize message container
const messageContainer = document.createElement('div');
messageContainer.id = 'message-container';
document.body.appendChild(messageContainer);

export function showMessage(message, level = 'success', timeout = 3000) {
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'message';

    // Set styles based on level
    const styles = {
        success: {
            background: 'lightgreen',
            color: 'darkgreen',
            border: '1px solid darkgreen'
        },
        warning: {
            background: 'lightyellow',
            color: 'darkorange',
            border: '1px solid orange'
        },
        error: {
            background: 'lightcoral',
            color: 'white',
            border: '1px solid darkred'
        }
    };

    Object.assign(messageElement.style, styles[level] || styles.success);
    messageElement.textContent = message;

    // Add to container
    messageContainer.appendChild(messageElement);

    // Start fade out after timeout
    setTimeout(() => {
        messageElement.classList.add('fade-out');
        // Remove element after animation completes
        setTimeout(() => {
            messageElement.remove();
        }, 500); // 500ms matches the CSS transition duration
    }, timeout);
}