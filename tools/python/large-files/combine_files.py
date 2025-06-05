import os

# Directorio donde están los archivos .ndjson
folder_path = './folder'
output_file = 'combined.jsonl'

with open(output_file, 'w', encoding='utf-8') as outfile:
    for filename in os.listdir(folder_path):
        # if filename.endswith('.ndjson'):
        with open(os.path.join(folder_path, filename), 'r', encoding='utf-8') as infile:
            for line in infile:
                outfile.write(line)
        outfile.write("\n")
print(f'Archivos combinados en: {output_file}')