@echo off
setlocal enabledelayedexpansion

set "dir=%CD%\formatted"
set "output_dir=%CD%\simplified"

if not exist "%output_dir%" mkdir "%output_dir%"

for /R "%dir%" %%f in (*.geojson) do (
    set "inputFile=%%f"

    rem Keeping relative path
    set "relPath=!inputFile:%dir%\=!"
    
    rem Using relative path to keep current structure
    set "outputFile=%output_dir%\!relPath!"
    
    for %%g in ("!outputFile!") do (
         if not exist "%%~dpg" mkdir "%%~dpg"
    )
    
    echo Simplifying GeoJSON: %%f
    
    rem Running ogr2ogr with flag -simplify x
    ogr2ogr -f GeoJSON "!outputFile!" "%%f" -simplify 0.004
)

endlocal
echo.
echo Success
pause
