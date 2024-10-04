import streamlit as st
import requests
import streamlit.components.v1 as components
import datetime
from mistralai import Mistral

# Configuration de l'API Google Maps
GOOGLE_API_KEY = 'AIzaSyAN6QE5WpnV5aAcGGs74XUQaGnaJP1j2xs'
# Configuration de l'API Mistral AI
MISTRAL_API_KEY = 'UjEVrxoHP7SWphfUlhYAbOQkzjGGKIm9'


# Fonction pour récupérer les suggestions d'adresse
def autocomplete_address(input_text):
    url = f"https://maps.googleapis.com/maps/api/place/autocomplete/json?input={input_text}&key={GOOGLE_API_KEY}&types=address"
    response = requests.get(url)
    predictions = response.json().get("predictions", [])
    addresses = [prediction["description"] for prediction in predictions]
    return addresses

# Fonction pour résumer les avis
def summarize_avis(avis_list):
    avis_text = " ".join(avis_list)
    prompt = f"Synthétise ces avis de manière argumentée en français. Je veux en 3 lignes. Je veux uniquement la réponse : {avis_text}"
    
    client = Mistral(api_key=MISTRAL_API_KEY)
    chat_response = client.chat.complete(
        model="mistral-large-latest",
        messages=[
            {
                "role": "user",
                "content": prompt
            },
        ]
    )
        
    return chat_response.choices[0].message.content

# Fonction pour récupérer les catégories
def get_categories():
    return ["Gastronomie", "Loisirs"]

# Fonction pour récupérer les sous-catégories
def get_subcategories(selected_category):
    if selected_category == "Gastronomie":
        return ["African", "Asiatique", "Européen", "Fast Food"]
    elif selected_category == "Loisirs":
        return ["Culture", "Lieux Culturels", "Sport", "Divertissement"]
    return []

# Fonction pour vérifier si le lieu est ouvert
def is_open_now(place_id):
    details_url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&key={GOOGLE_API_KEY}"
    response = requests.get(details_url)
    result = response.json().get('result', {})
    
    opening_hours = result.get('opening_hours', {})
    if opening_hours:
        return opening_hours.get('open_now', False)  # True si le lieu est ouvert, False sinon
    return False  # Si l'information n'est pas disponible

# Fonction pour obtenir les adresses à partir de Google Maps
def get_nearby_places(address, subcategory, min_rating, max_rating, min_reviews, max_reviews):
    url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query={subcategory}+near+{address}&key={GOOGLE_API_KEY}"
    response = requests.get(url)
    results = response.json().get("results", [])
    
    places = []
    for result in results:
        name = result.get('name')
        formatted_address = result.get('formatted_address')
        rating = result.get('rating', 0)  # Nombre d'étoiles
        user_ratings_total = result.get('user_ratings_total', 0)  # Nombre d'avis
        place_id = result.get('place_id')  # ID du lieu
        
        # Vérifier si le lieu est ouvert
        if is_open_now(place_id):
            # Appliquer les filtres de note et d'avis
            if min_rating <= rating < max_rating and min_reviews <= user_ratings_total < max_reviews:
                google_maps_link = f"https://www.google.com/maps/place/?q=place_id:{place_id}"  # Lien Google Maps
                places.append((name, formatted_address, rating, user_ratings_total, google_maps_link, place_id))

    # Trier par évaluation et retourner jusqu'à 10 adresses
    places.sort(key=lambda x: x[2], reverse=True)  # Trier par rating (étoiles)
    return places  # Retourner toutes les adresses

# Fonction pour obtenir les commentaires d'un lieu via son place_id
def get_place_reviews(place_id):
    url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&key={GOOGLE_API_KEY}&fields=reviews"
    response = requests.get(url)
    result = response.json().get("result", {})
    
    reviews = result.get("reviews", [])
    comments = [review.get('text', '') for review in reviews]
    
    return comments

# Fonction pour interagir avec l'API Mistral AI
def ask_mistral(prompt):
    url = 'URL_DE_L_API_MISTRAL'  # Remplace par l'URL de l'API de Mistral AI
    headers = {
        'Authorization': f'Bearer {MISTRAL_API_KEY}',
        'Content-Type': 'application/json'
    }
    data = {
        'prompt': prompt,
        'max_tokens': 100
    }
    response = requests.post(url, headers=headers, json=data)
    return response.json().get('choices', [{}])[0].get('text', '')

# Fonction pour récupérer l'adresse à partir des coordonnées
def get_address_from_coordinates(lat, lon):
    reverse_geocode_url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lon}&key={GOOGLE_API_KEY}"
    response = requests.get(reverse_geocode_url)
    results = response.json().get("results", [])
    if results:
        return results[0]['formatted_address']
    return None

# Interface utilisateur avec Streamlit
st.title("Chatbot de Recherche d'Adresses")

# Saisie de l'adresse
user_address = st.text_input("Entrez votre adresse:")

# Choix de la plage d'étoiles
rating_options = {
    "Choisissez le nombre d'étoiles": (1.0, 5.0),
    "Entre 1 et 2 étoiles": (1.0, 2.0),
    "Entre 2 et 3 étoiles": (2.0, 3.0),
    "Entre 3 et 4 étoiles": (3.0, 4.0),
    "4 étoiles et plus": (4.0, 5.0)  # 4 et au-dessus
}

selected_rating = st.selectbox("Choisissez la plage d'étoiles (Facultative) :", list(rating_options.keys()))
min_rating, max_rating = rating_options[selected_rating]

# Choix de la plage d'avis
review_options = {
    "Choisissez le nombre d'avis": (0, 9999999),
    "10 à 100 avis": (10, 100),
    "200 à 400 avis": (200, 400),
    "400 à 800 avis": (400, 800),
    "1000+ avis": (1000, float('inf'))
}

selected_review_range = st.selectbox("Choisissez la plage d'avis (Facultative) :", list(review_options.keys()))
min_reviews, max_reviews = review_options[selected_review_range]

# Initialiser l'état pour stocker les résultats et le nombre d'affichages
if 'places' not in st.session_state:
    st.session_state.places = []

if 'display_count' not in st.session_state:
    st.session_state.display_count = 5  # Nombre de résultats à afficher par défaut

if user_address:
    categories = get_categories()
    selected_category = st.selectbox("Choisissez une catégorie :", categories)

    # Choix de la sous-catégorie
    subcategories = get_subcategories(selected_category)
    selected_subcategory = st.selectbox("Choisissez une sous-catégorie :", subcategories)

    if st.button("Rechercher"):
        # Obtenir les adresses
        st.session_state.places = get_nearby_places(user_address, selected_subcategory, min_rating, max_rating, min_reviews, max_reviews)
        st.session_state.display_count = 5  # Réinitialiser l'affichage à 5

# Afficher les résultats
if st.session_state.places:
    st.write("Voici les adresses:")
    for place in st.session_state.places[:st.session_state.display_count]:
        name, address, rating, user_ratings_total, google_maps_link, place_id = place
        
        # Gérer l'affichage du nombre d'avis
        avis = f"{user_ratings_total} avis" if user_ratings_total > 0 else "Aucun avis"
        
        st.write(f"- **{name}** - {address} | ⭐️ {rating} ({avis}) | [Lien Google Maps]({google_maps_link})")
        
        # Récupérer et afficher les commentaires
        reviews = get_place_reviews(place_id)
        if reviews:
            synthse = summarize_avis(reviews)
            st.write(f" - Avis global : \n {synthse}")
        else:
            st.write("  Aucun commentaire disponible.")

    # Afficher le bouton pour afficher plus de résultats
    if len(st.session_state.places) > st.session_state.display_count:
        if st.button("Afficher plus de résultats"):
            st.session_state.display_count += 5  # Augmenter le nombre de résultats à afficher
    else:
        st.write("Tous les résultats sont affichés.")  # Message si tous les résultats sont déjà affichés

else:
    st.write("Aucun résultat trouvé.")