from flask import Flask, render_template, request, redirect, url_for, jsonify
import json
import os
from datetime import datetime

app = Flask(__name__)
NOTES_FILE = 'notes.json'

# Load existing notes or initialize empty list
def load_notes():
    if os.path.exists(NOTES_FILE):
        try:
            with open(NOTES_FILE, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return []
    return []

# Save notes to file
def save_notes(notes):
    with open(NOTES_FILE, 'w') as f:
        json.dump(notes, f, indent=4)

@app.route('/')
def index():
    notes = load_notes()
    return render_template('index.html', notes=notes)

@app.route('/add', methods=['GET', 'POST'])
def add_note():
    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        content = request.form.get('content', '').strip()
        
        if title and content:
            notes = load_notes()
            new_note = {
                'title': title,
                'content': content,
                'created_at': datetime.now().isoformat(),
                'id': max([n.get('id', 0) for n in notes], default=0) + 1
            }
            notes.append(new_note)
            save_notes(notes)
            return redirect(url_for('index'))
        else:
            return render_template('add.html', error="Both title and content are required")
    
    return render_template('add.html')

@app.route('/edit/<int:note_id>', methods=['GET', 'POST'])
def edit_note(note_id):
    notes = load_notes()
    note = None
    note_index = None
    
    for i, n in enumerate(notes):
        if n.get('id') == note_id:
            note = n
            note_index = i
            break
    
    if not note:
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        content = request.form.get('content', '').strip()
        
        if title and content:
            notes[note_index]['title'] = title
            notes[note_index]['content'] = content
            notes[note_index]['updated_at'] = datetime.now().isoformat()
            save_notes(notes)
            return redirect(url_for('index'))
        else:
            return render_template('edit.html', note=note, error="Both title and content are required")
    
    return render_template('edit.html', note=note)

@app.route('/delete/<int:note_id>')
def delete_note(note_id):
    notes = load_notes()
    notes = [note for note in notes if note.get('id') != note_id]
    save_notes(notes)
    return redirect(url_for('index'))

# API endpoints for AJAX requests
@app.route('/api/notes')
def api_notes():
    notes = load_notes()
    return jsonify(notes)

@app.route('/api/notes', methods=['POST'])
def api_add_note():
    data = request.get_json()
    title = data.get('title', '').strip()
    content = data.get('content', '').strip()
    
    if not title or not content:
        return jsonify({'error': 'Title and content are required'}), 400
    
    notes = load_notes()
    new_note = {
        'title': title,
        'content': content,
        'created_at': datetime.now().isoformat(),
        'id': max([n.get('id', 0) for n in notes], default=0) + 1
    }
    notes.append(new_note)
    save_notes(notes)
    
    return jsonify(new_note), 201

@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
def api_delete_note(note_id):
    notes = load_notes()
    original_length = len(notes)
    notes = [note for note in notes if note.get('id') != note_id]
    
    if len(notes) == original_length:
        return jsonify({'error': 'Note not found'}), 404
    
    save_notes(notes)
    return jsonify({'message': 'Note deleted successfully'})

if __name__ == '__main__':
    app.run(debug=True)