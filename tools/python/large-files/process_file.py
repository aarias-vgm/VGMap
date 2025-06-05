import os

CHUNK_SIZE = 100000  # número de líneas por chunk (ajustable)
TEMP_DIR = "chunks_tmp"

def dividir_en_chunks(archivo_entrada):
    if not os.path.exists(TEMP_DIR):
        os.mkdir(TEMP_DIR)

    chunk_index = 0
    with open(archivo_entrada, 'r', encoding='utf-8') as f:
        while True:
            lineas = []
            for _ in range(CHUNK_SIZE):
                linea = f.readline()
                if not linea:
                    break
                if not linea.endswith('\n'):
                    linea += '\n'
                lineas.append(linea)

            if not lineas:
                break

            lineas.sort()
            with open(f"{TEMP_DIR}/chunk_{chunk_index}.txt", 'w', encoding='utf-8') as chunk_file:
                chunk_file.writelines(lineas)

            chunk_index += 1

    return chunk_index

def merge_chunks(chunk_count, archivo_salida):
    archivos = [open(f"{TEMP_DIR}/chunk_{i}.txt", 'r', encoding='utf-8') for i in range(chunk_count)]
    lineas_actuales = [f.readline() for f in archivos]
    ultimo_escrito = None

    with open(archivo_salida, 'w', encoding='utf-8') as salida:
        while any(lineas_actuales):
            # Buscar la línea más pequeña entre las actuales
            min_linea = None
            min_index = -1
            for i, linea in enumerate(lineas_actuales):
                if linea and (min_linea is None or linea < min_linea):
                    min_linea = linea
                    min_index = i

            if min_linea != ultimo_escrito:
                salida.write(min_linea)
                ultimo_escrito = min_linea

            # Avanzar en el archivo de donde vino la línea mínima
            lineas_actuales[min_index] = archivos[min_index].readline()

    # Cerrar y limpiar archivos temporales
    for f in archivos:
        f.close()
    for i in range(chunk_count):
        os.remove(f"{TEMP_DIR}/chunk_{i}.txt")
    os.rmdir(TEMP_DIR)

def ordenar_y_deduplicar(archivo_entrada, archivo_salida):
    print("Dividiendo archivo en chunks...")
    chunk_count = dividir_en_chunks(archivo_entrada)
    print(f"{chunk_count} chunks creados. Comenzando merge...")
    merge_chunks(chunk_count, archivo_salida)
    print(f"Proceso completo. Resultado en: {archivo_salida}")

# Uso:
ordenar_y_deduplicar("combined.jsonl", "processed.jsonl")