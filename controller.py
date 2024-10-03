from flask import Flask, jsonify, request
from flask_cors import CORS
import backend

app = Flask(__name__)
CORS(app)

import os
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Route Flask pour récupérer une adresse aléatoire
@app.route('/api_random_address', methods=['GET'])
def random_address():
    address = backend.get_random_address()
    return jsonify({"address": address})  # Retourne une réponse JSON

# Route Flask pour l'autocomplétion d'adresses
@app.route('/api_autocomplete_address', methods=['GET'])
def autocomplete_address():
    query = request.args.get('query')
    
    if not query:
        return jsonify({"suggestions": []})  # Retourne une liste vide si aucun input n'est fourni

    # Appel à la fonction backend pour obtenir les suggestions d'autocomplétion
    suggestions = backend.get_autocomplete_suggestions(query, GOOGLE_API_KEY)
    
    return jsonify({"suggestions": suggestions})  # Retourne les suggestions sous forme de JSON


# Route pour obtenir les lieux à proximité
@app.route('/api_get_places', methods=['POST'])
def get_places():
    data = request.json
    address = data.get("address")
    category = data.get("category")

    if not address or not category:
        return jsonify({"error": "Adresse et catégorie manquantes"}), 400

    # Appel au backend pour récupérer les lieux
    places = backend.get_nearby_places(address, category)

    # Appeler Mistral AI pour trier les lieux
    prompt = f"Voici les adresses trouvées près de {address} dans la catégorie {category}: {places}."
    mistral_response = backend.ask_mistral(prompt)

    # Renvoyer les données JSON
    return jsonify({"places": places, "mistral_response": mistral_response})



if __name__ == "__main__":
    app.run(debug=True)
