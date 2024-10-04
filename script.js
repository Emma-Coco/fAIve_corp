document.addEventListener("DOMContentLoaded", function () {
    const chatWrapper = document.getElementById("chat-wrapper");
    let userAddress = ''; 
    let selectedCategory = '';
    let selectedSubcategory = '';
    let currentPlaceIndex = 0;
    let allPlaces = []; // Stocke toutes les places récupérées
    let validAddressSelected = false;
    


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

// Exemple d'utilisation pour afficher les lieux et le message du bot progressivement
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
            // D'abord, afficher le message du bot, puis les lieux un par un
            displayBotMessage(userAddress, selectedCategory, () => {
                displayUserPlacesSequentially(data.places); // Afficher les lieux un par un
            });
        } else {
            console.log("Aucun lieu trouvé");
        }
    })
    .catch(error => console.error('Erreur:', error));
}

    // Fonction pour afficher le message du bot avec les résultats
function displayBotMessage(address, category, callback) {
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
    setTimeout(callback, 1000); // Appeler le callback après 1 seconde
}

// Fonction pour afficher un lot de lieux avec temporisation
function displayUserPlacesBatch(places, startIndex) {
    const batch = places.slice(startIndex, startIndex + 5); // Récupère les lieux par lot de 5

    // Afficher chaque lieu avec un délai
    batch.forEach((place, index) => {
        setTimeout(() => {
            const userBubble = `
                <div class="user-container user-bubble">
                    <a href="${place.url}" target="_blank" class="activity-link">
                        <div class="place-name">${place.name}</div>
                    </a>
                    <div class="place-details">
                        ${place.address}<br>
                        ⭐️ ${place.rating} (${place.user_ratings_total} avis)
                    </div>
                </div>
            `;
            chatWrapper.innerHTML += userBubble;
            scrollToBottom(); // Scroll automatique après chaque bulle
        }, index * 1000); // Délai de 1 seconde entre chaque lieu
    });

    // Vérifier si tous les lieux ont été affichés
    if (startIndex + 5 < places.length) {
        // Si d'autres lieux existent, afficher le bouton "Afficher plus"
        setTimeout(() => {
            displayShowMoreButton();
        }, batch.length * 1000); // Attendre l'affichage du dernier lieu avant d'afficher le bouton
    } else if (places.length === 0) {
        // Si aucun lieu n'est retourné par l'API, afficher un message de fin
        setTimeout(() => {
            const endMessage = `
                <div class="chat-row">
                    <img src="assets/robot_chat.png" alt="Robot" class="robot-image">
                    <div class="chat-bubble">
                        Toutes les propositions ont été affichées.
                    </div>
                </div>
            `;
            chatWrapper.innerHTML += endMessage;
            scrollToBottom();
        }, batch.length * 1000);
    }
}



// Fonction pour afficher le message du bot "Voici cinq propositions de plus !"
function displayBotMoreMessage() {
    const botMessage = `
        <div class="chat-row">
            <img src="assets/robot_chat.png" alt="Robot" class="robot-image">
            <div class="chat-bubble">
                Voici cinq propositions de plus !
            </div>
        </div>
    `;
    chatWrapper.innerHTML += botMessage;
    scrollToBottom(); // Scroll automatique après l'affichage du message
}

// Fonction pour afficher le bouton "Afficher plus"
function displayShowMoreButton() {
    const showMoreButton = `
        <div class="show-more-container user-container">
            <button id="show-more-btn" class="show-more-btn">Afficher plus</button>
        </div>
    `;
    chatWrapper.innerHTML += showMoreButton;
    scrollToBottom(); // Scroll automatique pour faire apparaître le bouton dans la vue

    // Ajouter un listener pour le bouton
    document.getElementById("show-more-btn").addEventListener("click", () => {
        document.querySelector(".show-more-container").remove(); // Supprimer le bouton après clic
        currentPlaceIndex += 5; // Incrémenter l'index pour afficher le prochain lot
        displayBotMoreMessage(); // Afficher le message du bot après avoir cliqué sur "Afficher plus"
        setTimeout(fetchMorePlaces, 1000); // Délai d'une seconde après le message du bot avant d'afficher les nouveaux lieux
    });
}

// Fonction pour appeler l'API et récupérer plus de lieux
function fetchMorePlaces() {
    // Envoyer l'index actuel à l'API pour récupérer le prochain lot de lieux
    const requestData = {
        address: userAddress,
        category: selectedCategory,
        offset: currentPlaceIndex // Utilisation de l'offset pour gérer la pagination côté API
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
            allPlaces = [...allPlaces, ...data.places]; // Ajouter les nouveaux lieux à ceux déjà affichés
            displayUserPlacesBatch(allPlaces, currentPlaceIndex); // Afficher les nouveaux lieux
        } else {
            // Si l'API ne retourne plus de lieux, afficher un message de fin
            const endMessage = `
                <div class="chat-row">
                    <img src="assets/robot_chat.png" alt="Robot" class="robot-image">
                    <div class="chat-bubble">
                        Toutes les propositions ont été affichées.
                    </div>
                </div>
            `;
            chatWrapper.innerHTML += endMessage;
            scrollToBottom();
        }
    })
    .catch(error => console.error('Erreur:', error));
}



// Fonction pour afficher les lieux initiaux de manière progressive
function displayUserPlacesSequentially() {
    currentPlaceIndex = 0; // Réinitialiser l'index au début
    allPlaces = []; // Vider la liste existante
    fetchMorePlaces(); // Appeler la fonction pour commencer à récupérer les lieux
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
    
        // Fonction pour afficher chaque lieu dans une bulle utilisateur individuelle
function displayUserPlaces(places) {
    places.slice(0, 5).forEach(place => {
        const userBubble = `
            <div class="user-container user-bubble">
                <strong>${place.name}</strong> - ${place.address} | ⭐️ ${place.rating} (${place.user_ratings_total} avis)
            </div>
        `;
        chatWrapper.innerHTML += userBubble;
        scrollToBottom(); // Scroll automatique après chaque bulle
    });
}

// Appel de la fonction fetchNearbyPlaces pour démarrer la progression
fetchNearbyPlaces();

    });
    