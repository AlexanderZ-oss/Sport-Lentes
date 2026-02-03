/**
 * Script de Limpieza de Sesiones - Sport Lentes
 * 
 * Este script limpia todas las sesiones y datos de autenticación almacenados
 * para resolver problemas de acceso con diferentes cuentas de Gmail.
 * 
 * INSTRUCCIONES:
 * 1. Ejecuta este script en la consola del navegador (F12 → Console)
 * 2. Actualiza la página después de ejecutarlo
 * 3. Intenta iniciar sesión de nuevo
 */

(function clearAllSessions() {
    console.log('🧹 Iniciando limpieza de sesiones...');

    // 1. Limpiar localStorage
    const keysToKeep = [];
    const allKeys = Object.keys(localStorage);

    console.log(`📦 Encontradas ${allKeys.length} claves en localStorage`);

    // Limpiar solo claves relacionadas con autenticación de Supabase
    const supabaseAuthKeys = allKeys.filter(key =>
        key.includes('supabase.auth.token') ||
        key.includes('sb-') ||
        key.includes('supabase-auth-token')
    );

    if (supabaseAuthKeys.length > 0) {
        console.log(`🗑️ Eliminando ${supabaseAuthKeys.length} claves de autenticación de Supabase:`);
        supabaseAuthKeys.forEach(key => {
            console.log(`   - ${key}`);
            localStorage.removeItem(key);
        });
    } else {
        console.log('✅ No se encontraron claves de autenticación de Supabase');
    }

    // 2. Limpiar sessionStorage
    const sessionKeys = Object.keys(sessionStorage);
    const supabaseSessionKeys = sessionKeys.filter(key =>
        key.includes('supabase') ||
        key.includes('sb-')
    );

    if (supabaseSessionKeys.length > 0) {
        console.log(`🗑️ Eliminando ${supabaseSessionKeys.length} claves de sessionStorage:`);
        supabaseSessionKeys.forEach(key => {
            console.log(`   - ${key}`);
            sessionStorage.removeItem(key);
        });
    }

    // 3. Limpiar cookies relacionadas con Supabase
    const cookies = document.cookie.split(';');
    const supabaseCookies = cookies.filter(cookie =>
        cookie.includes('sb-') ||
        cookie.includes('supabase')
    );

    if (supabaseCookies.length > 0) {
        console.log(`🍪 Eliminando ${supabaseCookies.length} cookies de Supabase:`);
        supabaseCookies.forEach(cookie => {
            const cookieName = cookie.split('=')[0].trim();
            console.log(`   - ${cookieName}`);
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
    }

    console.log('✅ Limpieza completada!');
    console.log('🔄 Por favor, actualiza la página (F5) para aplicar los cambios');
    console.log('');
    console.log('📊 Resumen:');
    console.log(`   - ${supabaseAuthKeys.length} claves de localStorage eliminadas`);
    console.log(`   - ${supabaseSessionKeys.length} claves de sessionStorage eliminadas`);
    console.log(`   - ${supabaseCookies.length} cookies eliminadas`);

    return {
        success: true,
        message: 'Limpieza completada. Actualiza la página para aplicar los cambios.',
        stats: {
            localStorageKeys: supabaseAuthKeys.length,
            sessionStorageKeys: supabaseSessionKeys.length,
            cookies: supabaseCookies.length
        }
    };
})();
