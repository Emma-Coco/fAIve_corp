document.addEventListener("DOMContentLoaded", function () {
    const chatWrapper = document.getElementById("chat-wrapper");
    let userAddress = ''; 
    let selectedCategory = '';
    let selectedSubcategory = '';

    // Fonction pour scroller automatiquement vers le bas
    function scrollToBottom() {
        chatWrapper.scrollTop = chatWrapper.scrollHeight;
    }

    // Fonction pour récupérer l'adresse depuis l'API Flask
    function fetchRandomAddress() {
        fetch('http://127.0.0.1:5000/api_random_address', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })
            .then(response => response.json())
            .then(data => {
                console.log("Adresse aléatoire récupérée :", data.address);
            })
            .catch(error => console.error('Erreur:', error));
    }

    // Appel de l'API pour récupérer les lieux après sélection
    function fetchNearbyPlaces() {
        const requestData = {
            address: userAddress,
            category: selectedCategory
        };

        fetch('http://127.0.0.1:5000/api_get_places', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.places && data.places.length > 0) {
                displayBotMessage(userAddress, selectedCategory); // Affiche le message du bot
                displayUserPlaces(data.places); // Affiche les 5 adresses dans une bulle utilisateur
            } else {
                console.log("Aucun lieu trouvé");
            }
        })
        .catch(error => console.error('Erreur:', error));
    }

    // Fonction pour afficher le message du bot avec les résultats
    function displayBotMessage(address, category) {
        const botMessage = `
            <div class="chat-row">
                <img src="assets/robot_chat.png" alt="Robot" class="robot-image">
                <div class="chat-bubble">
                    Voici les adresses trouvées près de ${address} dans la catégorie ${category} :
                </div>
            </div>
        `;
        chatWrapper.innerHTML += botMessage;
        scrollToBottom(); // Scroll automatique
    }

    // Fonction pour afficher les lieux dans une bulle utilisateur
    function displayUserPlaces(places) {
        let placesHTML = "<ul>";
        places.slice(0, 5).forEach(place => {
            placesHTML += `<li><strong>${place.name}</strong> - ${place.address} | ⭐️ ${place.rating} (${place.user_ratings_total} avis)</li>`;
        });
        placesHTML += "</ul>";

        const userBubble = `
            <div class="user-container user-bubble">
                ${placesHTML}
            </div>
        `;
        chatWrapper.innerHTML += userBubble;
        scrollToBottom(); // Scroll automatique
    }

    // Affichage initial du chatbot
    setTimeout(() => {
        const firstBubble = `
            <div class="chat-bubble no-triangle">
                Bonjour, que souhaitez-vous faire aujourd'hui ?
            </div>
        `;
        chatWrapper.innerHTML += firstBubble;
        scrollToBottom(); // Scroll automatique
    }, 0);

    // Deuxième bulle de chat avec le robot demandant l'adresse
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
        scrollToBottom(); // Scroll automatique
    }, 1000);

    // Bulle de chat avec l'input d'adresse et l'autocomplétion
    setTimeout(() => {
        const thirdBubble = `
            <div class="user-container" id="address-container">
                <input type="text" id="user-input" placeholder="Entrez votre adresse" autocomplete="off"/>
                <div id="autocomplete-list" class="autocomplete-items"></div>
                <button id="submit-address" disabled>Envoyer</button>
            </div>
        `;
        chatWrapper.innerHTML += thirdBubble;
        scrollToBottom();

        let validAddressSelected = false;

        // Fonction pour obtenir des suggestions d'adresses via l'API Google
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
                autocompleteList.innerHTML = ""; // Clear suggestions
                validAddressSelected = false; // Reset validation

                // Ajouter les 5 premières suggestions
                data.suggestions.slice(0, 5).forEach(suggestion => {
                    const suggestionItem = document.createElement("div");
                    suggestionItem.innerHTML = suggestion.description;
                    suggestionItem.addEventListener("click", () => {
                        document.getElementById("user-input").value = suggestion.description;
                        autocompleteList.innerHTML = ""; // Clear list
                        validAddressSelected = true;
                        document.getElementById("submit-address").disabled = false;
                        document.getElementById("submit-address").style.backgroundColor = "#0f0f0f"; // Normal state
                    });
                    autocompleteList.appendChild(suggestionItem);
                });
            })
            .catch(error => console.error('Erreur:', error));
        }

        // Gestion de la saisie dans l'input d'adresse
        const userInput = document.getElementById("user-input");
        userInput.addEventListener("input", function() {
            const query = userInput.value;
            fetchAutocompleteSuggestions(query); // Fetch suggestions
            document.getElementById("submit-address").disabled = true; // Désactiver le bouton
            document.getElementById("submit-address").style.backgroundColor = "#ccc"; // Griser le bouton
        });

        // Gestion de l'envoi de l'adresse
        const submitButton = document.getElementById("submit-address");
        submitButton.addEventListener("click", () => {
            if (validAddressSelected) {
                userAddress = document.getElementById("user-input").value;
                if (userAddress) {
                    const addressContainer = document.getElementById("address-container");
                    addressContainer.innerHTML = `
                        <div class="submitted-address">
                            ${userAddress}
                        </div>
                    `;
                    displayRobotText();  // Affiche la sélection de catégorie
                }
            }
        });
    }, 2000);

    // Fonction pour afficher le message du robot pour la catégorie
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
        scrollToBottom();

        setTimeout(displayCategoryButtons, 500);
    }

    // Fonction pour afficher les boutons de catégories
    function displayCategoryButtons() {
        const categories = ["Gastronomie", "Loisirs"];

        const buttonBubble = `
            <div class="user-container category-buttons">
                ${categories.map(category => `<button class="category-btn">${category}</button>`).join('')}
            </div>
        `;
        chatWrapper.innerHTML += buttonBubble;
        scrollToBottom();

        document.querySelectorAll('.category-btn').forEach(button => {
            button.addEventListener('click', () => {
                selectedCategory = button.textContent;
                displayBotSubcategoryPrompt(selectedCategory);
            });
        });
    }

    // Fonction pour afficher les sous-catégories
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
        scrollToBottom();

        setTimeout(() => displaySubcategories(category), 500);
    }

        // Fonction pour afficher les sous-catégories
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
            scrollToBottom(); // Descendre automatiquement après l'ajout de la bulle
    
            // Ajouter des listeners sur les boutons de sous-catégories
            document.querySelectorAll('.category-btn').forEach(button => {
                button.addEventListener('click', () => {
                    selectedSubcategory = button.textContent; // Stocker la sous-catégorie sélectionnée
                    fetchNearbyPlaces(); // Appeler l'API pour récupérer les lieux
                });
            });
        }
    
        // Fonction pour afficher les lieux dans une bulle utilisateur
        function displayUserPlaces(places) {
            let placesHTML = "<ul>";
            places.slice(0, 5).forEach(place => {
                placesHTML += `<li><strong>${place.name}</strong> - ${place.address} | ⭐️ ${place.rating} (${place.user_ratings_total} avis)</li>`;
            });
            placesHTML += "</ul>";
    
            const userBubble = `
                <div class="user-container user-bubble">
                    ${placesHTML}
                </div>
            `;
            chatWrapper.innerHTML += userBubble;
            scrollToBottom(); // Descendre automatiquement après l'ajout de la bulle
        }
    });
    