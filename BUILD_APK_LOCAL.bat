@echo off
echo ====================================
echo   FITTRACK - BUILD APK LOCAL
echo ====================================
echo.

echo [1/4] Verificando dependencias...
call npm install

echo.
echo [2/4] Instalando expo-dev-client...
call npx expo install expo-dev-client

echo.
echo [3/4] Pre-build do projeto...
call npx expo prebuild --platform android --clean

echo.
echo [4/4] Gerando APK Release...
echo NOTA: Este processo pode demorar 5-15 minutos na primeira vez
echo.
cd android
call gradlew assembleRelease

echo.
echo ====================================
echo   BUILD CONCLUIDO!
echo ====================================
echo.
echo APK gerado em:
echo android\app\build\outputs\apk\release\app-release.apk
echo.
echo Pressione qualquer tecla para abrir a pasta...
pause
explorer "app\build\outputs\apk\release"
