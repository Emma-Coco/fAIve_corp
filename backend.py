import requests
from mistralai import Mistral
import base64
import os
from dotenv import load_dotenv
import random

# Charger les variables depuis le fichier .env
load_dotenv()

# Configuration de l'API Google Maps
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
# Configuration de l'API Mistral AI
MISTRAL_API_KEY = os.getenv('MISTRAL_API_KEY')


# Fonction pour obtenir une adresse aléatoire depuis l'API Google
def get_random_address():
    # Appel à l'API Google pour obtenir des adresses (par exemple via l'API Places)

    url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+paris&key={GOOGLE_API_KEY}"
    
    response = requests.get(url)
    data = response.json()

    if "results" in data:
        # Sélectionner une adresse aléatoire dans les résultats
        random_address = random.choice(data["results"])
        return random_address.get("formatted_address", "No address found")

    return "No address found"

def get_autocomplete_suggestions(query, google_api_key):
    url = f"https://maps.googleapis.com/maps/api/place/autocomplete/json?input={query}&key={google_api_key}"
    
    response = requests.get(url)
    data = response.json()

    if "predictions" in data:
        return data["predictions"]  # Retourne les suggestions
    return []  # Retourne une liste vide si aucune suggestion n'est trouvée


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

# Fonction pour convertir l'image en base64
def get_base64_image(image_path):
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode()
    

# Obtenir les lieux à proximité de l'adresse
def get_nearby_places(address, category):
    google_api_key = os.getenv("GOOGLE_API_KEY")
    # Faire une requête à l'API de Google Maps Places
    url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query={category}+near+{address}&key={google_api_key}"
    response = requests.get(url)
    data = response.json()

    places = []
    if "results" in data:
        for place in data["results"][:10]:  # Limiter à 10 premiers résultats
            place_info = {
                "name": place["name"],
                "address": place["formatted_address"],
                "rating": place.get("rating", "N/A"),
                "user_ratings_total": place.get("user_ratings_total", 0),
                "place_id": place["place_id"]
            }
            places.append(place_info)

    return places

# Vérifier si le lieu est ouvert maintenant
def is_open_now(place_id):
    google_api_key = os.getenv("GOOGLE_API_KEY")
    url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=opening_hours&key={google_api_key}"
    response = requests.get(url)
    data = response.json()
    if "result" in data and "opening_hours" in data["result"]:
        return data["result"]["opening_hours"].get("open_now", False)
    return False

# Appel à Mistral AI pour améliorer la sélection des meilleurs lieux
def ask_mistral(prompt):
    mistral_api_key = os.getenv("MISTRAL_API_KEY")
    headers = {
        "Authorization": f"Bearer {mistral_api_key}",
        "Content-Type": "application/json"
    }
    response = requests.post(
        "https://api.mistral.ai/v1/generate",
        json={"prompt": prompt, "max_tokens": 500},
        headers=headers
    )
    if response.status_code == 200:
        return response.json().get("text", "")
    return "No response from Mistral AI"
