document.addEventListener("DOMContentLoaded", function () {
    const chatWrapper = document.getElementById("chat-wrapper");
    let userAddress = ''; // Pour stocker l'adresse de l'utilisateur
    let selectedCategory = ''; // Pour stocker la catégorie sélectionnée
    let selectedSubcategory = ''; // Pour stocker la sous-catégorie sélectionnée

    // Fonction pour scroller automatiquement vers le bas
    function scrollToBottom() {
        chatWrapper.scrollTop = chatWrapper.scrollHeight;
    }

    // Fonction pour récupérer l'adresse depuis l'API Flask


    function fetchRandomAddress() {
        fetch('http://127.0.0.1:5000/api_random_address', {
            method: 'GET',
            mode: 'cors',  // Enable CORS
            headers: {
              'Content-Type': 'application/json',
            },
          })
            .then(response => response.json())
            .then(data => {
                console.log("Adresse aléatoire récupérée :", data.address);
                // Ici tu peux utiliser l'adresse dans ton chat ou dans un autre composant de l'interface
            })
            .catch(error => console.error('Erreur:', error));
    }

    // Appeler la fonction pour récupérer l'adresse à chaque démarrage
    fetchRandomAddress();


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
// Créer la troisième bulle de chat avec l'input
setTimeout(() => {
    const thirdBubble = `
        <div class="user-container" id="address-container">
            <input type="text" id="user-input" placeholder="Entrez votre adresse" autocomplete="off"/>
            <div id="autocomplete-list" class="autocomplete-items"></div>
            <button id="submit-address" disabled>Envoyer</button> <!-- Bouton désactivé par défaut -->
        </div>
    `;
    chatWrapper.innerHTML += thirdBubble;
    scrollToBottom(); // Descendre automatiquement après l'ajout de la bulle

    let validAddressSelected = false;

    // Fonction pour obtenir des suggestions d'adresses à partir de l'API Google
    function fetchAutocompleteSuggestions(query) {
        if (!query) return;

        fetch(`http://127.0.0.1:5000/api_autocomplete_address?query=${query}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            const autocompleteList = document.getElementById("autocomplete-list");
            autocompleteList.innerHTML = ""; // Clear previous suggestions
            validAddressSelected = false; // Reset valid address selection

            // Ajouter les cinq premières suggestions à la liste
            data.suggestions.slice(0, 5).forEach(suggestion => {
                const suggestionItem = document.createElement("div");
                suggestionItem.innerHTML = suggestion.description;
                suggestionItem.addEventListener("click", () => {
                    document.getElementById("user-input").value = suggestion.description;
                    autocompleteList.innerHTML = ""; // Clear suggestions after selection
                    validAddressSelected = true; // Une adresse valide a été sélectionnée
                    document.getElementById("submit-address").disabled = false; // Activer le bouton "Envoyer"
                    document.getElementById("submit-address").style.backgroundColor = "#0f0f0f"; // Retourner au style normal
                });
                autocompleteList.appendChild(suggestionItem);
            });
        })
        .catch(error => console.error('Erreur:', error));
    }

    // Event listener pour détecter la saisie dans l'input
    const userInput = document.getElementById("user-input");
    userInput.addEventListener("input", function() {
        const query = userInput.value;
        fetchAutocompleteSuggestions(query); // Fetch autocomplete suggestions
        document.getElementById("submit-address").disabled = true; // Désactiver le bouton pendant que l'utilisateur tape
        document.getElementById("submit-address").style.backgroundColor = "#ccc"; // Griser le bouton quand il est désactivé
    });

    // Add event listener for address submission
    const submitButton = document.getElementById("submit-address");
    submitButton.addEventListener("click", () => {
        if (validAddressSelected) {
            userAddress = document.getElementById("user-input").value; // Capture l'adresse de l'utilisateur
            if (userAddress) {
                // Remplacer l'input par le texte de l'adresse sélectionnée
                const addressContainer = document.getElementById("address-container");
                addressContainer.innerHTML = `
                    <div class="submitted-address">
                        ${userAddress}
                    </div>
                `;
                displayRobotText();  // Affiche le texte dans une nouvelle bulle
            }
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
