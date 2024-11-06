from flask import Flask, render_template, jsonify, request
import sqlite3

app = Flask(__name__) 

def database_connection():
  conn = sqlite3.connect('sqlme.db')
  conn.row_factory = sqlite3.Row
  return conn 
  
@app.route('/')
def home():
  return render_template('index.html')

@app.route('/view_tables', methods=['GET'])
def tables():
  conn = database_connection()
  tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
  conn.close()
  return jsonify({'tables':[table['name'] for table in tables]})

@app.route('/run', methods=['POST'])
def run_query():
  query = request.json.get('query')
  conn = database_connection()
  cursor = conn.cursor()
  
  try:
    cursor.execute(query)
    cols = [x[0] for x in cursor.description] if cursor.description else []
    rows = cursor.fetchall()
    conn.commit()
    conn.close()
    
    data = [dict(zip(cols, row)) for row in rows]
    return jsonify({'status': 'success', 'data': data})
  except Exception as e:
    conn.rollback()
    conn.close()
    return jsonify({'status': 'error', 'error': str(e)})
  
  
if __name__ == '__main__':
  app.run(debug=True)