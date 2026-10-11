#!/usr/bin/env bash
set -e

echo "🚀 Запуск Cyber Sport Hunter..."
docker-compose up -d

echo ""
echo "⏳ Ожидание завершения миграций и seed..."
# Ждём, пока сервисы migrate и seed завершатся
while docker-compose ps | grep -q "migrate"; do
    sleep 2
done
while docker-compose ps | grep -q "seed"; do
    sleep 2
done

echo ""
echo "📊 Логи миграций:"
docker-compose logs --tail=20 migrate

echo ""
echo "📊 Логи seed:"
docker-compose logs --tail=20 seed

echo ""
echo "✅ Готово! Проверьте:"
echo "   Фронтенд: http://web.localhost"
echo "   API:      http://api.localhost/docs"
echo "   Keycloak: http://kc.localhost:8081/admin"