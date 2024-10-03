import streamlit as st
import time
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
            background-color: black;
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
        .no-triangle .chat-message::before {{
            display: none;  /* Retirer le triangle pour la première bulle */
        }}
        /* Positionnement du triangle à côté de la bulle de dialogue pour la deuxième bulle */
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
            align-items: center;
            justify-content: flex-start;  /* Aligner les bulles à gauche dans le wrapper */
            width: 100%;
        }}
        .chat-bubble img {{
            height: 40px;
            margin-right: 10px;
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

# Déclaration d'un espace vide qui sera remplacé après 2 secondes
chat_placeholder = st.empty()

# Remplissage du conteneur initial avec la première bulle sans triangle
with chat_placeholder.container():
    st.markdown(
        f"""
        <div class='chat-container'>
            <div class="chat-wrapper">
                <!-- Bulle sans image de robot, sans triangle -->
                <div class="chat-bubble no-triangle">
                    <div class="chat-message">Bonjour, que souhaitez-vous faire aujourd'hui ?</div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )

# Attendre 2 secondes avant d'afficher la deuxième bulle
time.sleep(1)

# Remplacer le contenu avec les deux bulles (première sans triangle + deuxième avec le robot)
with chat_placeholder.container():
    st.markdown(
        f"""
        <div class='chat-container'>
            <div class="chat-wrapper">
                <!-- Bulle sans image de robot, sans triangle -->
                <div class="chat-bubble no-triangle">
                    <div class="chat-message">Bonjour, que souhaitez-vous faire aujourd'hui ?</div>
                </div>
                <!-- Bulle avec image de robot avec triangle -->
                <div class="chat-bubble">
                    <img src="data:image/png;base64,{robot_image_base64}" alt="Robot">
                    <div class="chat-message">Où êtes-vous ?</div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )
