from flask import Flask, request, jsonify
from flask_cors import CORS
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)

@app.route('/api/google-auth', methods=['POST'])
def google_auth():
    token = request.json.get('token')
    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            os.getenv('GOOGLE_CLIENT_ID')
        )
        return jsonify({'status': 'success', 'email': idinfo['email'], 'name': idinfo('name', "")})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 401
    
if __name__ == '__main__':
    app.run(debug=True)