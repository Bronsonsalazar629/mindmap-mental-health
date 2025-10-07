@echo off
echo Setting up data-science directory structure...

REM Create main directories
mkdir "data-science\notebooks" 2>nul
mkdir "data-science\data\raw" 2>nul
mkdir "data-science\data\processed" 2>nul
mkdir "data-science\data\external" 2>nul
mkdir "data-science\models" 2>nul
mkdir "data-science\scripts" 2>nul
mkdir "data-science\requirements" 2>nul
mkdir "data-science\config" 2>nul

REM Create subdirectories for different data types
mkdir "data-science\data\raw\facilities" 2>nul
mkdir "data-science\data\raw\demographics" 2>nul
mkdir "data-science\data\raw\surveys" 2>nul
mkdir "data-science\data\processed\features" 2>nul
mkdir "data-science\data\processed\analysis" 2>nul

REM Create notebook subdirectories
mkdir "data-science\notebooks\exploratory" 2>nul
mkdir "data-science\notebooks\modeling" 2>nul
mkdir "data-science\notebooks\analysis" 2>nul
mkdir "data-science\notebooks\visualization" 2>nul

REM Create model subdirectories
mkdir "data-science\models\bias_detection" 2>nul
mkdir "data-science\models\recommendation" 2>nul
mkdir "data-science\models\classification" 2>nul

echo Directory structure created successfully!
echo.
echo Structure:
echo data-science\
echo   ^|-- notebooks\
echo   ^|     ^|-- exploratory\
echo   ^|     ^|-- modeling\
echo   ^|     ^|-- analysis\
echo   ^|     ^|-- visualization\
echo   ^|-- data\
echo   ^|     ^|-- raw\
echo   ^|     ^|     ^|-- facilities\
echo   ^|     ^|     ^|-- demographics\
echo   ^|     ^|     ^|-- surveys\
echo   ^|     ^|-- processed\
echo   ^|     ^|     ^|-- features\
echo   ^|     ^|     ^|-- analysis\
echo   ^|     ^|-- external\
echo   ^|-- models\
echo   ^|     ^|-- bias_detection\
echo   ^|     ^|-- recommendation\
echo   ^|     ^|-- classification\
echo   ^|-- scripts\
echo   ^|-- requirements\
echo   ^|-- config