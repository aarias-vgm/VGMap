import os
import json
import csv

base_path = os.path.dirname(os.path.abspath(__file__))
input_folder = os.path.join(base_path, "..\\public\\data\\geojson\\departments")
output_file = os.path.join(base_path, "departments-info.psv")

os.makedirs(input_folder, exist_ok=True)

with open(output_file, "w", newline="", encoding="utf-8") as f_output:
    writer = csv.writer(f_output, delimiter="|")

    writer.writerow(["id", "name", "type", "area", "population2025", "population2035", "density2025", "density2035"])

    for filename in os.listdir(input_folder):
        if filename.lower().endswith(".geojson"):
            print(f"Processing {filename}...")
            filepath = os.path.join(input_folder, filename)

            with open(filepath, "r", encoding="utf-8") as f_input:
                data = json.load(f_input)

                for feature in data.get("features", []):
                    id = feature.get("id", "")

                    properties = feature.get("properties", {})

                    name = properties.get("name", "")
                    type = properties.get("type", "")
                    area = properties.get("area", "")
                    population2025 = properties.get("population2025", "")
                    population2035 = properties.get("population2035", "")
                    density2025 = properties.get("density2025", "")
                    density2035 = properties.get("density2035", "")

                    row = [id, name, type, area, population2025, population2035, density2025, density2035]

                    writer.writerow(row)

print(f"Process completed. Generated file: {output_file}")
