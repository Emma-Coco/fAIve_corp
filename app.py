import streamlit as st
from backend import get_base64_image

# Chemins vers les images
logo_image_path = "assets/fAIve_text.PNG"
profil_image_path = "assets/profile.png"

# Convertir les images en base64
logo_image_base64 = get_base64_image(logo_image_path)
profil_image_base64 = get_base64_image(profil_image_path)

# HTML et CSS pour le logo et la barre d'entête
st.markdown(
    f"""
    <style>
        .header {{
            background-color: black;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: space-between;
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
            flex-direction: column;
            justify-content: flex-start;
            position: relative;
        }}
        .chat-message {{
            padding: 8px 10px;
            margin-bottom: 10px;
            border-radius: 8px;
            background-color: #f1f1f1;
            width: fit-content;
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
    """
    <div class='chat-container'>
        <div class='chat-message'>hello</div>
    </div>
    """, 
    unsafe_allow_html=True
)
