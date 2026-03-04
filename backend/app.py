from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

@app.route("/api/update-table", methods=["POST", "OPTIONS"])
def update_table():

    # responder al preflight del navegador
    if request.method == "OPTIONS":
        return "", 200

    print("REQUEST RECIBIDA")

    data = request.json
    dataset = data["dataset"]
    rows = data["rows"]

    print("dataset:", dataset)

    file_path = f"../public/{dataset}.json"

    with open(file_path, "r") as f:
        geojson = json.load(f)

    for row in rows:
        gid = row["gid"]
        for feature in geojson["features"]:
            if feature["properties"]["gid"] == gid:
                feature["properties"] = row
                break

    with open(file_path, "w") as f:
        json.dump(geojson, f, indent=2)

    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)