/**
 * ==========================================
 * Simulación de Ataque DDoS - Node.js
 * Parte 3 del proyecto
 * ==========================================
 * 
 * Uso: node ataque-node.js [tipo]
 * Tipos: login, status, heavy, all
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

// Colores para consola
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

// Función para hacer request
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: { 'Content-Type': 'application/json', ...options.headers }
        });
        return { status: response.status, data: await response.json().catch(() => ({})) };
    } catch (error) {
        return { status: 0, error: error.message };
    }
}

// Ataque 1: Login fallidos
async function ataqueLogin(count = 10) {
    console.log(`${colors.cyan}>>> ATAQUE 1: Login fallidos${colors.reset}`);
    for (let i = 1; i <= count; i++) {
        const result = await makeRequest(`${API_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ username: 'attacker', password: 'wrongpass' })
        });
        console.log(`  [${i}] HTTP ${result.status} - ${result.data.message || ''}`);
    }
}

// Ataque 2: Requests masivos a status
async function ataqueStatus(count = 30) {
    console.log(`${colors.cyan}>>> ATAQUE 2: Requests masivos a /api/status${colors.reset}`);
    const promises = [];
    for (let i = 1; i <= count; i++) {
        promises.push(makeRequest(`${API_URL}/api/status`));
    }
    const results = await Promise.all(promises);
    const successCount = results.filter(r => r.status === 200).length;
    console.log(`  ✓ Completados: ${successCount}/${count}`);
}

// Ataque 3: Endpoint pesado
async function ataqueHeavy(count = 10) {
    console.log(`${colors.cyan}>>> ATAQUE 3: Endpoint /api/heavy${colors.reset}`);
    for (let i = 1; i <= count; i++) {
        const result = await makeRequest(`${API_URL}/api/heavy`);
        console.log(`  [${i}] HTTP ${result.status}`);
    }
}

// Ataque 4: Delayed responses
async function ataqueDelay(count = 10) {
    console.log(`${colors.cyan}>>> ATAQUE 4: Delayed endpoints${colors.reset}`);
    const promises = [];
    for (let i = 1; i <= count; i++) {
        promises.push(makeRequest(`${API_URL}/api/delay/500`));
    }
    const results = await Promise.all(promises);
    console.log(`  ✓ Completados: ${results.filter(r => r.status === 200).length}/${count}`);
}

// Verificar estado después del ataque
async function verificarEstado() {
    console.log(`\n${colors.yellow}==========================================`);
    console.log('RESULTADOS DEL ATAQUE');
    console.log('==========================================\n');
    
    const status = await makeRequest(`${API_URL}/auth/status`);
    console.log(`${colors.blue}Estado de tu IP:${colors.reset}`);
    console.log(JSON.stringify(status.data, null, 2));
}

// Main
async function main() {
    const tipo = process.argv[2] || 'all';
    
    console.log(`${colors.green}DDoS Simulation Test${colors.reset}`);
    console.log(`URL: ${API_URL}\n`);
    
    switch(tipo) {
        case 'login':
            await ataqueLogin(10);
            break;
        case 'status':
            await ataqueStatus(50);
            break;
        case 'heavy':
            await ataqueHeavy(20);
            break;
        case 'all':
        default:
            await ataqueLogin(8);
            await new Promise(r => setTimeout(r, 1000));
            await ataqueStatus(30);
            await new Promise(r => setTimeout(r, 1000));
            await ataqueHeavy(10);
            break;
    }
    
    await verificarEstado();
}

main().catch(console.error);