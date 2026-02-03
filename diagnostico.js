/**
 * SCRIPT DE DIAGNÓSTICO - Sport Lentes
 * 
 * Ejecuta este script en la consola del navegador (F12 → Console)
 * para diagnosticar problemas de conexión y autenticación.
 * 
 * INSTRUCCIONES:
 * 1. Presiona F12 en tu navegador
 * 2. Ve a la pestaña "Console"
 * 3. Copia y pega TODO este código
 * 4. Presiona Enter
 * 5. Lee los resultados del diagnóstico
 */

(async function diagnostico() {
    console.log('🔍 INICIANDO DIAGNÓSTICO DEL SISTEMA...\n');
    console.log('═'.repeat(60));

    const resultados = {
        navegador: {},
        localStorage: {},
        supabase: {},
        conexion: {},
        problemas: [],
        soluciones: []
    };

    // ==========================================
    // 1. INFORMACIÓN DEL NAVEGADOR
    // ==========================================
    console.log('\n📱 1. INFORMACIÓN DEL NAVEGADOR');
    console.log('─'.repeat(60));

    resultados.navegador = {
        userAgent: navigator.userAgent,
        plataforma: navigator.platform,
        idioma: navigator.language,
        enLinea: navigator.onLine,
        cookies: navigator.cookieEnabled
    };

    console.log('User Agent:', resultados.navegador.userAgent);
    console.log('Plataforma:', resultados.navegador.plataforma);
    console.log('Idioma:', resultados.navegador.idioma);
    console.log('¿Conectado a internet?', resultados.navegador.enLinea ? '✅ Sí' : '❌ No');
    console.log('¿Cookies habilitadas?', resultados.navegador.cookies ? '✅ Sí' : '❌ No');

    if (!resultados.navegador.enLinea) {
        resultados.problemas.push('❌ No hay conexión a internet');
        resultados.soluciones.push('→ Verifica tu conexión a internet');
    }

    if (!resultados.navegador.cookies) {
        resultados.problemas.push('❌ Las cookies están deshabilitadas');
        resultados.soluciones.push('→ Habilita las cookies en tu navegador');
    }

    // ==========================================
    // 2. VERIFICAR LOCALSTORAGE
    // ==========================================
    console.log('\n💾 2. VERIFICACIÓN DE LOCALSTORAGE');
    console.log('─'.repeat(60));

    try {
        const allKeys = Object.keys(localStorage);
        const sportLentesKeys = allKeys.filter(k => k.includes('sport_lentes'));
        const supabaseKeys = allKeys.filter(k => k.includes('supabase') || k.includes('sb-'));

        resultados.localStorage = {
            totalKeys: allKeys.length,
            sportLentesKeys: sportLentesKeys.length,
            supabaseAuthKeys: supabaseKeys.length,
            keys: {
                sportLentes: sportLentesKeys,
                supabase: supabaseKeys
            }
        };

        console.log('Total de claves:', allKeys.length);
        console.log('Claves de Sport Lentes:', sportLentesKeys.length);
        console.log('Claves de Supabase Auth:', supabaseKeys.length);

        if (sportLentesKeys.length > 0) {
            console.log('\n📦 Datos de Sport Lentes encontrados:');
            sportLentesKeys.forEach(key => {
                const value = localStorage.getItem(key);
                try {
                    const parsed = JSON.parse(value);
                    if (Array.isArray(parsed)) {
                        console.log(`  - ${key}: ${parsed.length} elementos`);
                    } else if (typeof parsed === 'object') {
                        console.log(`  - ${key}:`, Object.keys(parsed));
                    } else {
                        console.log(`  - ${key}:`, parsed);
                    }
                } catch (e) {
                    console.log(`  - ${key}: [No JSON]`);
                }
            });
        }

        if (supabaseKeys.length > 0) {
            console.log('\n⚠️ Sesiones de Supabase Auth encontradas:');
            supabaseKeys.forEach(key => console.log(`  - ${key}`));
            resultados.problemas.push('⚠️ Se encontraron sesiones de Supabase Auth');
            resultados.soluciones.push('→ Ejecuta el script clear-sessions.js para limpiarlas');
        }

    } catch (e) {
        console.error('❌ Error accediendo a localStorage:', e);
        resultados.problemas.push('❌ No se puede acceder a localStorage');
        resultados.soluciones.push('→ Verifica que el navegador permita localStorage');
    }

    // ==========================================
    // 3. VERIFICAR SUPABASE
    // ==========================================
    console.log('\n🗄️ 3. VERIFICACIÓN DE SUPABASE');
    console.log('─'.repeat(60));

    try {
        // Intentar leer variables de entorno
        const supabaseUrl = window.location.origin.includes('localhost')
            ? 'Variable no visible (compilado)'
            : 'Compilado en producción';

        console.log('URL de Supabase:', supabaseUrl);

        // Verificar si hay errores en la consola
        const errors = performance.getEntriesByType('resource')
            .filter(r => r.name.includes('supabase') && r.transferSize === 0);

        if (errors.length > 0) {
            console.log('⚠️ Problemas de conexión con Supabase detectados');
            resultados.problemas.push('⚠️ No se puede conectar a Supabase');
            resultados.soluciones.push('→ Verifica las credenciales en .env');
            resultados.soluciones.push('→ Verifica que el proyecto de Supabase esté activo');
        } else {
            console.log('✅ No se detectaron problemas de carga de Supabase');
        }

    } catch (e) {
        console.error('Error verificando Supabase:', e);
    }

    // ==========================================
    // 4. VERIFICAR USUARIO ACTUAL
    // ==========================================
    console.log('\n👤 4. USUARIO ACTUAL');
    console.log('─'.repeat(60));

    try {
        const currentUser = localStorage.getItem('sport_lentes_user');
        if (currentUser) {
            const user = JSON.parse(currentUser);
            console.log('✅ Usuario logueado:');
            console.log('  - ID:', user.id);
            console.log('  - Nombre:', user.name);
            console.log('  - Username:', user.username);
            console.log('  - Role:', user.role);
            resultados.supabase.currentUser = user;
        } else {
            console.log('ℹ️ No hay usuario logueado');
        }
    } catch (e) {
        console.error('Error leyendo usuario actual:', e);
    }

    // ==========================================
    // 5. DIAGNÓSTICO DE CONEXIÓN
    // ==========================================
    console.log('\n🌐 5. TEST DE CONEXIÓN');
    console.log('─'.repeat(60));

    try {
        const testUrl = 'https://umkztstvkbhghlkimsip.supabase.co/rest/v1/';
        console.log('Probando conexión a:', testUrl);

        const response = await fetch(testUrl, {
            method: 'HEAD',
            mode: 'no-cors'
        });

        console.log('✅ Conexión exitosa');
        resultados.conexion.supabase = true;

    } catch (e) {
        console.error('❌ Error de conexión:', e);
        resultados.conexion.supabase = false;
        resultados.problemas.push('❌ No se puede conectar a Supabase');
        resultados.soluciones.push('→ Verifica tu conexión a internet');
        resultados.soluciones.push('→ Verifica que Supabase no esté bloqueado');
    }

    // ==========================================
    // RESUMEN FINAL
    // ==========================================
    console.log('\n═'.repeat(60));
    console.log('📊 RESUMEN DEL DIAGNÓSTICO');
    console.log('═'.repeat(60));

    if (resultados.problemas.length === 0) {
        console.log('\n✅ ¡TODO ESTÁ BIEN! No se detectaron problemas.');
    } else {
        console.log('\n⚠️ PROBLEMAS DETECTADOS:');
        resultados.problemas.forEach((p, i) => console.log(`${i + 1}. ${p}`));

        console.log('\n💡 SOLUCIONES RECOMENDADAS:');
        resultados.soluciones.forEach((s, i) => console.log(`${i + 1}. ${s}`));
    }

    console.log('\n═'.repeat(60));
    console.log('🔍 Diagnóstico completado');
    console.log('═'.repeat(60));

    // Devolver resultados para análisis programático
    return resultados;
})();
