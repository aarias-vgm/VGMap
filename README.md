# MAPA COMERCIAL DE COLOMBIA

Un proyecto para visualizar estadísticas comerciales en Colombia

## Instrucciones

1. Descargar los datos estadísticos más actualizados para departamentos y municipios de Colombia del sitio web del [DANE](https://geoportal.dane.gov.co/servicios/descarga-y-metadatos/datos-geoestadisticos/)

   > En este caso se descargaron los archivos  
   > - "Versión MGN2023-Nivel Departamento"
   > - "Versión MGN2023-Nivel Municipio"
   > - "Proyecciones y Densidad de población por departamento 2020-2035"
   > - "Proyecciones y Densidad de población por municipio 2020-2035"

2. Convertir el archivo .shp a .geojson:

   - **Windows**:

     1. Descargar la última versión (en este caso gdal-3-10-0) .zip de los binarios y el .zip de las librerías y los headers en el sitio web de [_GisInternals_](https://gisinternals.com/release.php)

     2. Descomprimir y copiar el contenido en una misma carpeta: ejemplo **C:\gdal**

     3. Añadir al path:

      - `C:\gdal\bin`
      - `C:\gdal\bin\gdal\apps`

     4. Crear variables de entorno:
      
      |CLAVE|VALOR|
      |-|-|
      |GDAL_DATA|`C:\gdal\bin\gdal-data`|
      |PROJ_LIB|`C:\gdal\bin\proj9\share`|

     5. Ejecutar el comando `ogr2ogr [file].geojson [file].shp` para crear los GeoJSON

3. Procesar los archivos .geojson:

   1. Ingresar al sitio web del creador de GeoJSON.

   2. Llenar los campos de llaves y propiedades (especificados en los comentarios de HTML) para departamentos o municipios

   3. Ingresar los archivos

   4. Presionar el botón

4. Convertir en .geojson el archivo .shp de localidades de Bogotá en la página de [Datos Abiertos de Bogotá](https://datosabiertos.bogota.gov.co/dataset/localidad-bogota-d-c)

5. Obtener los datos de [proyección poblacional de Bogotá](https://www.dane.gov.co/index.php/estadisticas-por-tema/demografia-y-poblacion/proyecciones-de-poblacion/proyecciones-de-poblacion-bogota/) por localidad del DANE.

6. Ejecutar el GeoJSON processor en la misma ruta de la carpeta de los GeoJSON para optimización de polígonos que utiliza el siguiente comando de GDAL: `ogr2ogr -f GeoJSON output.geojson input.geojson -simplify 0.001`

7. Para disminuir el tamaño de los archivos .geojson de documentación se recomienda la eliminación de las líneas