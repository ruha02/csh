@echo off
chcp 65001 >nul 2>&1

echo 🚀 Запуск Cyber Sport Hunter...
docker-compose up -d

echo.
echo ⏳ Ожидание завершения миграций и seed...
:wait_loop
docker-compose ps | findstr /C:"migrate" >nul 2>&1
if %errorlevel% equ 0 (
    timeout /t 2 /nobreak >nul
    goto wait_loop
)
:wait_loop2
docker-compose ps | findstr /C:"seed" >nul 2>&1
if %errorlevel% equ 0 (
    timeout /t 2 /nobreak >nul
    goto wait_loop2
)

echo.
echo 📊 Логи миграций:
docker-compose logs --tail=20 migrate

echo.
echo 📊 Логи seed:
docker-compose logs --tail=20 seed

echo.
echo ✅ Готово!
pause