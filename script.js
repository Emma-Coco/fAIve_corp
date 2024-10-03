document.addEventListener("DOMContentLoaded", function () {
    const chatWrapper = document.getElementById("chat-wrapper");

    // Create first chat bubble
    setTimeout(() => {
        const firstBubble = `
            <div class="chat-bubble no-triangle">
                Bonjour, que souhaitez-vous faire aujourd'hui ?
            </div>
        `;
        chatWrapper.innerHTML += firstBubble;
    }, 0);

    // Create second chat bubble with robot after delay
    setTimeout(() => {
        const secondBubble = `
            <div class="chat-row">
                <img src="assets/robot_chat.png" alt="Robot" class="robot-image">
                <div class="chat-bubble">
                    Où êtes-vous ?
                </div>
            </div>
        `;
        chatWrapper.innerHTML += secondBubble;
    }, 1000);

    // Create third chat bubble with input after another delay
    setTimeout(() => {
        const thirdBubble = `
            <div class="user-bubble">
                <div class="input-container">
                    <input type="text" placeholder="Votre réponse ici" />
                </div>
            </div>
        `;
        chatWrapper.innerHTML += thirdBubble;
    }, 2000);
});
