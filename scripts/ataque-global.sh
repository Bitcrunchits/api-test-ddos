#!/bin/bash

# ==========================================
# Script de prueba de carga - wrk simulation
# Simula ataque DDoS con múltiples endpoints
# ==========================================

API_URL="${API_URL:-http://localhost:3000}"

echo "=========================================="
echo "Prueba de carga - Simulación DDoS"
echo "=========================================="

# Verificar que la API esté corriendo
echo "Verificando que la API esté disponible..."
if ! curl -s --max-time 2 "$API_URL/api/status" > /dev/null; then
    echo "ERROR: La API no está disponible en $API_URL"
    echo "Ejecutar: cd api-test-ddos && npm run start:dev"
    exit 1
fi

echo "✓ API disponible"
echo ""

#ATAQUE 1: Login fallidos consecutively
echo ">>> ATAQUE 1: Login fallidos consecutively..."
for i in {1..10}; do
    curl -s -X POST "$API_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"hacker","password":"wrong"}' > /dev/null
    echo -n "."
done
echo " ✓ 10 intentos de login"

sleep 2

#ATAQUE 2: Múltiples requests al endpoint /api/status
echo ""
echo ">>> ATAQUE 2: Requests masivos a /api/status..."
for i in {1..50}; do
    curl -s "$API_URL/api/status" > /dev/null &
done
wait
echo " ✓ 50 requests en paralelo a /api/status"

sleep 1

#ATAQUE 3: Endpoints variados
echo ""
echo ">>> ATAQUE 3: Requests a múltiples endpoints..."
endpoints=("/api/items" "/api/heavy" "/api/status" "/api/delay/100")
for endpoint in "${endpoints[@]}"; do
    for i in {1..10}; do
        curl -s "$API_URL$endpoint" > /dev/null &
    done
done
wait
echo " ✓ Ataque a múltiples endpoints"

sleep 2

# Verificar estado
echo ""
echo "=========================================="
echo "RESULTADOS DEL ATAQUE:"
echo "=========================================="
echo ""
echo "--- Estado de bloqueo de tu IP ---"
curl -s "$API_URL/auth/status" | jq .
echo ""
echo "--- IPs bloqueadas actualmente ---"
curl -s -H "x-admin-key: admin-secret" "$API_URL/auth/logs" | jq '.blockedIPs'
echo ""
echo "--- Últimos logs ---"
curl -s -H "x-admin-key: admin-secret" "$API_URL/auth/logs" | jq '.logs | length' | xargs -I {} echo "Total de logs: {}"