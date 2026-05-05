#!/bin/bash

# ==========================================
# PARTE 3 - Simulación de Ataque DDoS
# ==========================================

echo "=========================================="
echo "Simulación de Ataque al Endpoint /auth/login"
echo "=========================================="

API_URL="${API_URL:-http://localhost:3000}"
TOTAL_REQUEST=${1:-20}  # Por defecto 20 intentos

echo "URL: $API_URL"
echo "Total de intentos: $TOTAL_REQUEST"
echo ""

# Función para hacer login fallido
intento_fallido() {
    local attempt=$1
    local response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"wrongpass"}')
    
    local http_code=$(echo "$response" | tail -1)
    local body=$(echo "$response" | head -n -1)
    
    echo "[$attempt] HTTP $http_code"
}

echo "Iniciando ataques..."
echo ""

# Ejecutar ataques consecutivos
for i in $(seq 1 $TOTAL_REQUEST); do
    intento_fallido $i
    sleep 0.1  # Pequeña pausa para no saturar la red local
done

echo ""
echo "=========================================="
echo "Ataque completado. Verificar estado:"
echo " curl http://localhost:3000/auth/status"
echo " curl http://localhost:3000/auth/logs"
echo "=========================================="