#!/bin/bash
# Скрипт автоматической настройки прав клиента api в Keycloak
# Запускается один раз после старта Keycloak

set -e

KC_URL="${KC_URL:-http://keycloak:8081}"
KC_ADMIN="${KC_ADMIN:-admin}"
KC_PASSWORD="${KC_PASSWORD:-password}"
REALM="${REALM:-csh}"
CLIENT_ID="${CLIENT_ID:-api}"

echo " Ожидание запуска Keycloak..."
for i in $(seq 1 60); do
    if curl -sf "${KC_URL}/realms/master" >/dev/null 2>&1; then
        echo "✓ Keycloak доступен"
        break
    fi
    if [ "$i" -eq 60 ]; then
        echo " Keycloak не запустился за 60 секунд"
        exit 1
    fi
    sleep 1
done

echo " Получение admin-токена..."
ADMIN_TOKEN=$(curl -sf -X POST "${KC_URL}/realms/master/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=${KC_ADMIN}&password=${KC_PASSWORD}&grant_type=password&client_id=admin-cli" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [ -z "$ADMIN_TOKEN" ]; then
    echo "✗ Не удалось получить admin-токен"
    exit 1
fi
echo "✓ Токен получен"

echo "🔍 Поиск клиента '${CLIENT_ID}'..."
API_CLIENT_ID=$(curl -sf "${KC_URL}/admin/realms/${REALM}/clients?clientId=${CLIENT_ID}" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    | python3 -c "import sys,json; data=json.load(sys.stdin); print(data[0]['id'] if data else '')" 2>/dev/null)

if [ -z "$API_CLIENT_ID" ]; then
    echo "✗ Клиент '${CLIENT_ID}' не найден в realm '${REALM}'"
    exit 1
fi
echo "✓ Клиент найден: ${API_CLIENT_ID}"

echo "🔍 Поиск service-account пользователя..."
SA_USERNAME="service-account-${CLIENT_ID}"
SA_USER_ID=$(curl -sf "${KC_URL}/admin/realms/${REALM}/users?username=${SA_USERNAME}&exact=true" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    | python3 -c "import sys,json; data=json.load(sys.stdin); print(data[0]['id'] if data else '')" 2>/dev/null)

if [ -z "$SA_USER_ID" ]; then
    echo "⚠ Service-account пользователь '${SA_USERNAME}' не найден (возможно, serviceAccountsEnabled=false)"
    echo "  Пропускаем назначение ролей"
    exit 0
fi
echo "✓ Service-account найден: ${SA_USER_ID}"

echo "🔍 Поиск клиента realm-management..."
RM_CLIENT_ID=$(curl -sf "${KC_URL}/admin/realms/${REALM}/clients?clientId=realm-management" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    | python3 -c "import sys,json; data=json.load(sys.stdin); print(data[0]['id'] if data else '')" 2>/dev/null)

if [ -z "$RM_CLIENT_ID" ]; then
    echo "✗ Клиент realm-management не найден"
    exit 1
fi
echo "✓ realm-management найден: ${RM_CLIENT_ID}"

echo "🔍 Получение роли view-users..."
VIEW_USERS_ROLE=$(curl -sf "${KC_URL}/admin/realms/${REALM}/clients/${RM_CLIENT_ID}/roles/view-users" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" 2>/dev/null)

if [ -z "$VIEW_USERS_ROLE" ]; then
    echo "✗ Роль view-users не найдена"
    exit 1
fi
echo "✓ Роль view-users получена"

echo "📌 Назначение роли view-users service-account клиента '${CLIENT_ID}'..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    "${KC_URL}/admin/realms/${REALM}/users/${SA_USER_ID}/role-mappings/clients/${RM_CLIENT_ID}" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "[$VIEW_USERS_ROLE]")

if [ "$HTTP_CODE" = "204" ]; then
    echo "✅ Роль view-users успешно назначена!"
else
    echo " HTTP ${HTTP_CODE} (возможно, роль уже была назначена ранее — это нормально)"
fi

echo ""
echo "══════════════════════════════════════════════════════════"
echo "  Настройка Keycloak завершена"
echo "══════════════════════════════════════════════════════════"