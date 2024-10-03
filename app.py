import streamlit as st
from backend import get_base64_image

# Chemins vers les images
logo_image_path = "assets/fAIve_text.PNG"
profil_image_path = "assets/profile.png"
robot_image_path = "assets/robot_chat.png"  # Logo du robot

# Convertir les images en base64
logo_image_base64 = get_base64_image(logo_image_path)
profil_image_base64 = get_base64_image(profil_image_path)
robot_image_base64 = get_base64_image(robot_image_path)

# HTML et CSS pour le logo et la barre d'entête
st.markdown(
    f"""
    <style>
        .header {{
            background-color: #0f0f0f;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: space-between;  /* Espace entre le logo et le profil */
            padding: 0 20px;
        }}
        .header img {{
            height: 60px;
        }}
        .logo {{
            display: flex;
            align-items: center;
        }}
        .profile {{
            display: flex;
            align-items: center;
            justify-content: flex-end;
            margin: 0 10px;
        }}
        .profile img {{
            height: 30px;
        }}
        /* Style pour la zone de chat */
        .chat-container {{
            height: 400px;
            overflow-y: auto;
            border: 1px solid #ccc;
            padding: 10px;
            margin-bottom: 20px;
            display: flex;
            justify-content: center;  /* Centrer le wrapper dans le conteneur */
            align-items: center;
            position: relative;
        }}
        .chat-wrapper {{
            width: 100%;  /* Largeur du wrapper */
            max-width: 450px;  /* Limite maximale de la largeur du chat wrapper */
            display: flex;
            flex-direction: column;
            align-items: flex-start;  /* Aligner les bulles à gauche dans le wrapper */
            margin: 0 auto;  /* Centrer le wrapper dans le conteneur */
        }}
        .chat-message {{
            padding: 8px 20px;
            margin-bottom: 12px;
            border-radius: 20px;
            background: linear-gradient(90deg, #E0B1ED 0%, #C2EAFB 100%);
            color: white;
            display: inline-block;
            max-width: 100%;  /* Largeur maximale des bulles */
            position: relative;
            font-size: 16px;
            text-align: left;  /* Texte aligné à gauche dans la bulle */
            word-wrap: break-word;  /* Permettre le retour à la ligne */
        }}
        /* Conditionnel pour les bulles sans image */
        .no-robot .chat-message {{
            margin-left: 50px;  /* Ajoute une marge à gauche */
        }}
        /* Positionnement du triangle à côté de la bulle de dialogue */
        .chat-message::before {{
            content: '';
            position: absolute;
            top: 10px;  /* Ajuste la hauteur pour qu'il soit aligné avec la bulle */
            left: -7.5px;  /* Coller le triangle à la bulle */
            width: 0;
            height: 0;
            border-right: 10px solid transparent;
            border-left: 10px solid transparent;
            border-bottom: 10px solid #E0B1ED;  /* Couleur du triangle correspond à la bulle */
        }}
        .chat-bubble {{
            display: flex;
            align-items: center;  /* Aligner verticalement le contenu (image + bulle) */
            justify-content: flex-start;  /* Aligner les bulles à gauche dans le wrapper */
            width: 100%;
        }}
        .chat-bubble img {{
            height: 40px;
            margin-right: 10px;
            align-self: flex-start;  /* Aligner l'image du robot en haut de la bulle */
        }}
    </style>
    <header class="header">
        <div class="logo">
            <img src="data:image/png;base64,{logo_image_base64}" alt="Logo fAIve">
        </div>
        <div class="profile">
            <img src="data:image/png;base64,{profil_image_base64}" alt="Profil">
        </div>
    </header>
    """,
    unsafe_allow_html=True
)

# Utilisation de st.markdown avec un seul appel pour garantir que tout est inclus dans le conteneur
st.markdown(
    f"""
    <div class='chat-container'>
        <div class="chat-wrapper">
            <!-- Bulle sans image de robot -->
            <div class="chat-bubble no-robot">
                <div class="chat-message">Bonjour, que souhaitez-vous faire aujourd'hui ?</div>
            </div>
            <!-- Bulle avec image de robot -->
            <div class="chat-bubble">
                <img src="data:image/png;base64,{robot_image_base64}" alt="Robot">
                <div class="chat-message">Où êtes-vous ?</div>
            </div>
        </div>
    </div>
    """, 
    unsafe_allow_html=True
)
