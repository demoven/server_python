from flask import Flask, request, jsonify, render_template, redirect, url_for, flash, session
from unidecode import unidecode

app = Flask(__name__)
app.secret_key = 'supersecretkey'

@app.route('/')
def home():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.form
    username = data.get('username')
    password = data.get('password')
    if (username == 'Equipe1' and password == '123') or (username == 'EquipeSoir' and password == '123'):
        session['username'] = username  # Store username in session
        return redirect(url_for('choose_rooms'))
    else:
        flash('Invalid credentials')
        return redirect(url_for('home'))

@app.route('/choose_rooms')
def choose_rooms():
    return render_template('choose_rooms.html')

@app.route('/room/<int:room_id>')
def room(room_id):
    consignes = ["Casque", "Lunettes", "Gants", "Bouchons auditifs", "Gilet Fluo", "Chaussures de sécurité"]
    return render_template('room.html', room_id=room_id, consignes=consignes)

@app.route('/send-consignes', methods=['POST'])
def send_consignes():
    data = request.get_json()
    consignes = data.get('consignes', [])
    consignes_no_accents = [unidecode(consigne) for consigne in consignes]
    with open('consignes.txt', 'w') as f:
        f.write("\n".join(consignes_no_accents))
    return jsonify({'status': 'success'}), 200

@app.route('/logout')
def logout():
    session.pop('username', None)  # Remove username from session
    return redirect(url_for('home'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
