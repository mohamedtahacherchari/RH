📂 Ajouter le fichier backend/.env contenant les variables suivantes :

      MONGODB_URI=mongodb://localhost:27017/mutuelle_comparateur
      PORT=5000
      client_id=11024adbb3cc2fed16989f68617f226f38e5eaf63930f402363f013e7ae205ee
      client_secret=8f2ead5f8745be7ffd36a34b3aeca12aecc320796ae887f35adb226809e15cfa
      AUTH_URL=https://api.neoliane.fr/nws/public/v1/auth/token
      API_URL=https://api.neoliane.com/v1
      GOOGLE_CLIENT_ID=
      GOOGLE_CLIENT_SECRET=
      SESSION_SECRET=your_session_secret
▶️ Démarrer le backend :
  
    cd backend
    npm run dev

🌐 Accéder à l’authentification Google :

   http://localhost:5000/auth/google