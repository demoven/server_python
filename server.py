import json
import os
from flask import Flask, request, jsonify, render_template, redirect, url_for, flash, session
from unidecode import unidecode

app = Flask(__name__)
app.secret_key = 'supersecretkey'
EQUIPMENTS_FILE = 'equipments.json'

def load_equipments():
    if os.path.exists(EQUIPMENTS_FILE):
        with open(EQUIPMENTS_FILE, 'r') as file:
            return json.load(file)
    else:
        return ["Casque", "Lunettes", "Gants", "Bouchons auditifs", "Gilet Fluo", "Chaussures de sécurité"]

def save_equipments(equipments):
    with open(EQUIPMENTS_FILE, 'w') as file:
        json.dump(equipments, file)

@app.route('/')
def home():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.form
    username = data.get('username')
    password = data.get('password')
    if (username == 'Responsable' and password == '123'):
        session['username'] = username  # Store username in session
        if 'consignes' not in session:
            session['consignes'] = {}
        return redirect(url_for('choose_rooms'))
    else:
        flash('Invalid credentials')
        return redirect(url_for('home'))

@app.route('/choose_rooms')
def choose_rooms():
    return render_template('choose_rooms.html')

@app.route('/room/<int:room_id>')
def room(room_id):
    consignes = load_equipments()
    selected_consignes = session.get('consignes', {}).get(str(room_id), {})
    return render_template('room.html', room_id=room_id, consignes=consignes, selected_consignes=selected_consignes)

@app.route('/send-consignes', methods=['POST'])
def send_consignes():
    data = request.get_json()
    room_id = str(data.get('room_id'))
    obligatory = data.get('obligatory', [])
    recommended = data.get('recommended', [])

    if 'consignes' not in session:
        session['consignes'] = {}
    
    session['consignes'][room_id] = {
        'obligatory_' + unidecode(consigne): True for consigne in obligatory
    }
    session['consignes'][room_id].update({
        'recommended_' + unidecode(consigne): True for consigne in recommended
    })

    with open('consignes.txt', 'w') as f:
        for rid, consignes in session['consignes'].items():
            obligatory = [k.split('_', 1)[1] for k in consignes if k.startswith('obligatory')]
            recommended = [k.split('_', 1)[1] for k in consignes if k.startswith('recommended')]
            f.write(f"Zone {rid}\n")
            f.write(f"Obligatoire : {', '.join(obligatory)} - Recommande : {', '.join(recommended)}\n")

    return jsonify({'status': 'success'}), 200

@app.route('/add-equipment', methods=['POST'])
def add_equipment():
    new_equipment = request.json.get('equipment')
    if new_equipment:
        equipments = load_equipments()
        equipments.append(new_equipment)
        save_equipments(equipments)
        return jsonify({'status': 'success', 'equipment': new_equipment}), 200
    return jsonify({'status': 'error', 'message': 'Invalid equipment name'}), 400

@app.route('/get-equipments', methods=['GET'])
def get_equipments():
    return jsonify(load_equipments()), 200

@app.route('/delete-equipment', methods=['POST'])
def delete_equipment():
    equipment_to_delete = request.json.get('equipment')
    if equipment_to_delete:
        equipments = load_equipments()
        if equipment_to_delete in equipments:
            equipments.remove(equipment_to_delete)
            save_equipments(equipments)
            return jsonify({'status': 'success', 'equipment': equipment_to_delete}), 200
    return jsonify({'status': 'error', 'message': 'Equipment not found or invalid'}), 400


@app.route('/logout')
def logout():
    session.pop('username', None)  # Remove username from session
    session.pop('consignes', None)  # Remove consignes from session
    return redirect(url_for('home'))
    

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
