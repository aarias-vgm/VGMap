import os
import json

def split_file_by_size_and_hospital(input_filename, base_output_filename='divided', max_size_mb=45):
    max_size_bytes = max_size_mb * 1024 * 1024  # Convertir MB a bytes
    file_index = 1
    current_output_filename = f"{base_output_filename}_{file_index}.jsonl"
    current_file = open(current_output_filename, 'w', encoding='utf-8')
    current_size = 0
    checkpoint_hospital = None  # Se asignará una vez se alcance el límite de 45 MB

    with open(input_filename, 'r', encoding='utf-8') as infile:
        for line in infile:
            line = line.rstrip("\n")
            if not line.strip():
                continue  # Omitir líneas vacías
            
            try:
                data = json.loads(line)
            except json.JSONDecodeError:
                print(f"Error al decodificar JSON: {line}")
                continue

            # Calculamos el tamaño de la línea en bytes (contando el salto de línea)
            current_line_size = len(line.encode('utf-8')) + 1
            
            # Obtener el hospital de la línea actual
            current_line_hospital = data.get("hospital")
            
            # Si el tamaño acumulado es menor al límite, se escribe la línea sin comprobar hospital.
            if current_size < max_size_bytes:
                current_file.write(json.dumps(data) + "\n")
                current_size += current_line_size
                # Una vez se alcanza el límite, se registra el hospital de referencia (checkpoint)
                if current_size >= max_size_bytes and checkpoint_hospital is None:
                    checkpoint_hospital = current_line_hospital
            else:
                # Ya se alcanzó el límite de 45 MB, se comprueba el hospital
                if current_line_hospital != checkpoint_hospital:
                    # Se detectó cambio en el hospital: se finaliza el archivo actual y se inicia uno nuevo
                    current_file.close()
                    print(f"Archivo guardado: {current_output_filename} (tamaño acumulado: {current_size} bytes, hospital checkpoint: {checkpoint_hospital}).")
                    
                    file_index += 1
                    current_output_filename = f"{base_output_filename}_{file_index}.jsonl"
                    current_file = open(current_output_filename, 'w', encoding='utf-8')
                    
                    # Reiniciamos el contador y el checkpoint para el nuevo archivo
                    current_size = 0
                    checkpoint_hospital = None
                    
                    # Se escribe la línea actual en el nuevo archivo
                    current_file.write(json.dumps(data) + "\n")
                    current_size += current_line_size
                else:
                    # Si el hospital es el mismo, se sigue escribiendo en el archivo actual
                    current_file.write(json.dumps(data) + "\n")
                    current_size += current_line_size

    # Cerramos el último archivo abierto
    current_file.close()
    print("Procesamiento completado.")

# Ejemplo de uso:
split_file_by_size_and_hospital('processed.jsonl')
