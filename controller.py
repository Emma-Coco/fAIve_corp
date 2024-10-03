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




if __name__ == "__main__":
    app.run(debug=True)
