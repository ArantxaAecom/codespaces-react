from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route("/api/update-table", methods=["POST", "OPTIONS"])
def update_table():

    if request.method == "OPTIONS":
        return "", 200

    print("REQUEST RECIBIDA")
    data = request.json

    dataset = data["dataset"]
    rows = data["rows"]

    file_path = f"../public/{dataset}.json"

    with open(file_path, "r") as f:
        geojson = json.load(f)

    for feature, row in zip(geojson["features"], rows):
        feature["properties"] = row

    with open(file_path, "w") as f:
        json.dump(geojson, f, indent=2)

    return jsonify({"status": "ok"})
    

if __name__ == "__main__":
    app.run(port=5000, debug=True)