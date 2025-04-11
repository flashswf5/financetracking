import os
from flask import Flask, send_from_directory, request, jsonify

app = Flask(__name__, static_folder='src', static_url_path='')


@app.route("/")
def index():
    return app.send_static_file('index.html')


@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('src', path)


@app.route('/save_google_sheet', methods=['POST'])
def save_google_sheet():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        google_sheet_link = data.get('googleSheetLink')

        # In a real application, you would store this data in a database
        # For this example, we'll just print it
        print(f"User ID: {user_id}, Google Sheet Link: {google_sheet_link}")

        # Here you would add code to save the Google Sheet link associated with the user
        # For example, you could save it in a local database, a file, etc.

        return jsonify({'message': 'Google Sheet link saved successfully'}), 200
    except Exception as e:
        print(f"Error saving Google Sheet link: {e}")
        return jsonify({'message': 'Error saving Google Sheet link'}), 500


if __name__ == "__main__":
    app.run(debug=True, port=8000)


if __name__ == "__main__":
    main()
