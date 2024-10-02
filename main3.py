import streamlit as st
import requests
import streamlit.components.v1 as components
import datetime

# Configuration de l'API Google Maps
GOOGLE_API_KEY = 'AIzaSyAN6QE5WpnV5aAcGGs74XUQaGnaJP1j2xs'
# Configuration de l'API Mistral AI
MISTRAL_API_KEY = 'UjEVrxoHP7SWphfUlhYAbOQkzjGGKIm9'


# Fonction pour récupérer les catégories
def get_categories():
    return ["Restaurants", "Cafés", "Magasins", "Hôtels", "Lieux touristiques"]

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
def get_nearby_places(address, category, min_rating, max_rating, min_reviews, max_reviews):
    url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query={category}+near+{address}&key={GOOGLE_API_KEY}"
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

    # Trier par évaluation et récupérer les 5 meilleures adresses
    places.sort(key=lambda x: x[2], reverse=True)  # Trier par rating (étoiles)
    return places[:5]  # Retourner les 5 meilleures adresses

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
	"Choisissez le nombre d'étoiles":(1.0,5.0),
    "Entre 1 et 2 étoiles": (1.0, 2.0),
    "Entre 2 et 3 étoiles": (2.0, 3.0),
    "Entre 3 et 4 étoiles": (3.0, 4.0),
    "4 étoiles et plus": (4.0, 5.0)  # 4 et au-dessus
}

selected_rating = st.selectbox("Choisissez la plage d'étoiles(Facultative) :", list(rating_options.keys()))
min_rating, max_rating = rating_options[selected_rating]

# Choix de la plage d'avis
review_options = {
	"Choisissez le nombre d'avis":(0,9999999),
    "10 à 100 avis": (10, 100),
    "200 à 400 avis": (200, 400),
    "400 à 800 avis": (400, 800),
    "1000+ avis": (1000, float('inf'))
}

selected_review_range = st.selectbox("Choisissez la plage d'avis(Facultative):", list(review_options.keys()))
min_reviews, max_reviews = review_options[selected_review_range]

if user_address:
    categories = get_categories()
    selected_category = st.selectbox("Choisissez une catégorie:", categories)

    if st.button("Rechercher"):
        # Obtenir les adresses
        places = get_nearby_places(user_address, selected_category, min_rating, max_rating, min_reviews, max_reviews)
        
        if places:
            st.write("Voici les 5 meilleures adresses:")
            for name, address, rating, user_ratings_total, google_maps_link, place_id in places:
                open_status = "(ouvert)" if is_open_now(place_id) else "(fermé)"
                st.write(f"- **{name}** - {address} | ⭐️ {rating} ({user_ratings_total} avis) | [Lien Google Maps]({google_maps_link}) {open_status}")
            
            # Préparer le prompt pour Mistral AI
            prompt = f"Voici les adresses trouvées près de {user_address} dans la catégorie {selected_category}: {places}."
            mistral_response = ask_mistral(prompt)
            
            # Afficher la réponse de Mistral AI
            st.write("Réponse de Mistral AI:")
            st.write(mistral_response)
        else:
            st.write("Aucun résultat trouvé.")