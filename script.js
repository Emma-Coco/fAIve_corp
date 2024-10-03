document.addEventListener("DOMContentLoaded", function () {
    const chatWrapper = document.getElementById("chat-wrapper");
    let userAddress = ''; // Pour stocker l'adresse de l'utilisateur
    let selectedCategory = ''; // Pour stocker la catégorie sélectionnée
    let selectedSubcategory = ''; // Pour stocker la sous-catégorie sélectionnée

    // Fonction pour scroller automatiquement vers le bas
    function scrollToBottom() {
        chatWrapper.scrollTop = chatWrapper.scrollHeight;
    }

    // Create first chat bubble
    setTimeout(() => {
        const firstBubble = `
            <div class="chat-bubble no-triangle">
                Bonjour, que souhaitez-vous faire aujourd'hui ?
            </div>
        `;
        chatWrapper.innerHTML += firstBubble;
        scrollToBottom(); // Scroll after adding the bubble
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
        scrollToBottom(); // Scroll after adding the bubble
    }, 1000);

    // Create third chat bubble with input after another delay
    setTimeout(() => {
        const thirdBubble = `
                <div class="user-container" id="address-container">
                    <input type="text" id="user-input" placeholder="Votre réponse ici" />
                    <button id="submit-address">Envoyer</button>
                </div>
        `;
        chatWrapper.innerHTML += thirdBubble;
        scrollToBottom(); // Scroll after adding the bubble

        // Add event listener for address submission
        const submitButton = document.getElementById("submit-address");
        submitButton.addEventListener("click", () => {
            userAddress = document.getElementById("user-input").value; // Capture l'adresse de l'utilisateur
            if (userAddress) {
                // Remplace l'input par du texte affichant l'adresse entrée
                const addressContainer = document.getElementById("address-container");
                addressContainer.innerHTML = `
                    <div class="submitted-address">
                        ${userAddress}
                    </div>
                `;
                displayRobotText();  // Affiche le texte dans une nouvelle bulle
            }
        });
    }, 2000);

    // Function to display the robot's message text
    function displayRobotText() {
        const textBubble = `
            <div class="chat-row">
                <img src="assets/robot_chat.png" alt="Robot" class="robot-image">
                <div class="chat-bubble">
                    Choisissez une catégorie :
                </div>
            </div>
        `;
        chatWrapper.innerHTML += textBubble;
        scrollToBottom(); // Scroll after adding the bubble

        // Après un court délai, afficher la bulle utilisateur avec les boutons
        setTimeout(displayCategoryButtons, 500);
    }

    // Function to display category buttons in a new user bubble
    function displayCategoryButtons() {
        const categories = ["Gastronomie", "Loisirs"]; // Catégories récupérées depuis le backend

        const buttonBubble = `
                <div class="user-container category-buttons">
                    ${categories.map(category => `<button class="category-btn">${category}</button>`).join('')}
                </div>
        `;
        chatWrapper.innerHTML += buttonBubble;
        scrollToBottom(); // Scroll after adding the bubble

        // Ajouter des listeners sur les boutons de catégories
        document.querySelectorAll('.category-btn').forEach(button => {
            button.addEventListener('click', () => {
                selectedCategory = button.textContent; // Stocke la catégorie sélectionnée
                displayBotSubcategoryPrompt(selectedCategory); // Affiche la demande de sous-catégorie
            });
        });
    }

    // Function to display a bot bubble saying "Choose a subcategory"
    function displayBotSubcategoryPrompt(category) {
        const botBubble = `
            <div class="chat-row">
                <img src="assets/robot_chat.png" alt="Robot" class="robot-image">
                <div class="chat-bubble">
                    Choisissez une sous-catégorie pour ${category} :
                </div>
            </div>
        `;
        chatWrapper.innerHTML += botBubble;
        scrollToBottom(); // Scroll after adding the bubble

        // Après un court délai, afficher la bulle utilisateur avec les sous-catégories
        setTimeout(() => displaySubcategories(category), 500);
    }

    // Function to display subcategories in a new user bubble
    function displaySubcategories(category) {
        let subcategories = [];
        
        // Définir les sous-catégories en fonction de la catégorie sélectionnée
        if (category === "Gastronomie") {
            subcategories = ["African", "Asiatique", "Européen", "Fast Food"];
        } else if (category === "Loisirs") {
            subcategories = ["Culture", "Lieux Culturels", "Sport", "Divertissement"];
        }

        const subcategoryBubble = `
            <div class="user-container category-buttons">
                ${subcategories.map(subcategory => `<button class="category-btn">${subcategory}</button>`).join('')}
            </div>
        `;
        chatWrapper.innerHTML += subcategoryBubble;
        scrollToBottom(); // Scroll after adding the bubble

        // Ajouter des listeners sur les boutons de sous-catégories
        document.querySelectorAll('.category-btn').forEach(button => {
            button.addEventListener('click', () => {
                selectedSubcategory = button.textContent; // Stocke la sous-catégorie sélectionnée
                displayResults(); // Appelle la fonction pour afficher les résultats
            });
        });
    }

    // Function to display the final bot message with results
    function displayResults() {
        const resultsBubble = `
            <div class="chat-row">
                <img src="assets/robot_chat.png" alt="Robot" class="robot-image">
                <div class="chat-bubble">
                    Voici les adresses trouvées près de ${userAddress} dans la catégorie ${selectedCategory} :
                </div>
            </div>
        `;
        chatWrapper.innerHTML += resultsBubble;

       function scrollToBottom() {
    const chatWrapper = document.getElementById("chat-wrapper");
    chatWrapper.scroll({
        top: chatWrapper.scrollHeight,
        behavior: 'smooth'
    });
}


        // Ajout d'une nouvelle bulle utilisateur à la fin avec le texte "hello"
        setTimeout(() => {
            const userFinalBubble = `
                <div class="user-container user-bubble">
                    Hello
                </div>
            `;
            chatWrapper.innerHTML += userFinalBubble;
            scrollToBottom(); // Scroll after adding the bubble
        }, 500); // Délai après l'affichage des résultats
    }
});
