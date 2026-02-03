/**
 * VERIFICACIÓN DE USUARIOS EN CONSOLA
 * 
 * Ejecuta este script en la consola del navegador (F12 → Console)
 * para verificar el estado de los usuarios en el sistema.
 */

(async function verificarUsuarios() {
    console.log('🔍 VERIFICANDO ESTADO DE USUARIOS...\n');
    console.log('═'.repeat(60));

    // 1. Verificar localStorage
    console.log('\n📦 1. VERIFICAR LOCALSTORAGE');
    console.log('─'.repeat(60));

    const userSession = localStorage.getItem('sport_lentes_user');
    const usersDB = localStorage.getItem('sport_lentes_users_db');

    console.log('Usuario actual:', userSession ? JSON.parse(userSession) : 'No hay sesión');
    console.log('Base de datos local de usuarios:', usersDB ? 'Existe (deprecated)' : 'No existe');

    // 2. Verificar conexión con Supabase
    console.log('\n🗄️ 2. VERIFICAR SUPABASE');
    console.log('─'.repeat(60));

    try {
        // Obtener la URL de Supabase desde la configuración
        const supabaseUrl = 'https://umkztstvkbhghlkimsip.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVta3p0c3R2a2JoZ2hsa2ltc2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MzcxNTUsImV4cCI6MjA4MzQxMzE1NX0.VKMt4RrTdFcbarnfOOosPQxxzY0i20qatv1HSXBbPeY';

        console.log('Intentando conectar a Supabase...');

        const response = await fetch(`${supabaseUrl}/rest/v1/users?select=*`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

        if (!response.ok) {
            console.error('❌ Error al conectar:', response.status, response.statusText);
            console.log('\n💡 SOLUCIONES POSIBLES:');
            console.log('1. Verifica que ejecutaste el script SQL en Supabase');
            console.log('2. Verifica las políticas RLS en Supabase Dashboard');
            console.log('3. Verifica que el proyecto de Supabase esté activo');
            return;
        }

        const users = await response.json();

        console.log('✅ Conexión exitosa con Supabase');
        console.log(`📊 Usuarios en la base de datos: ${users.length}`);

        if (users.length === 0) {
            console.warn('\n⚠️ LA TABLA DE USUARIOS ESTÁ VACÍA');
            console.log('\n💡 SOLUCIONES:');
            console.log('1. Los usuarios por defecto deberían insertarse automáticamente');
            console.log('2. Si no aparecen, ejecuta esto en la consola:');
            console.log('\n--- COPIA ESTE CÓDIGO ---');
            console.log(`
fetch('${supabaseUrl}/rest/v1/users', {
    method: 'POST',
    headers: {
        'apikey': '${supabaseKey}',
        'Authorization': 'Bearer ${supabaseKey}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    },
    body: JSON.stringify([
        {
            id: '27c4fb4e-5e36-479e-a6a9-826315848201',
            username: 'sportlents@gmail.com',
            password: '123',
            role: 'admin',
            name: 'Super Admin Sport Lentes',
            status: 'active'
        },
        {
            id: '27c4fb4e-5e36-479e-a6a9-826315848202',
            username: 'admin',
            password: '123',
            role: 'admin',
            name: 'Administrador Sport',
            status: 'active'
        },
        {
            id: '27c4fb4e-5e36-479e-a6a9-826315848203',
            username: 'empleado',
            password: '123',
            role: 'employee',
            name: 'Empleado Ventas',
            status: 'active'
        }
    ])
})
.then(r => r.json())
.then(d => console.log('✅ Usuarios insertados:', d))
.catch(e => console.error('❌ Error:', e));
            `);
            console.log('--- FIN DEL CÓDIGO ---\n');
        } else {
            console.log('\n✅ Usuarios encontrados:');
            users.forEach((u, i) => {
                console.log(`${i + 1}. ${u.name} (${u.username}) - ${u.role} - ${u.status}`);
            });
        }

        // 3. Verificar políticas RLS
        console.log('\n🔐 3. VERIFICAR POLÍTICAS RLS');
        console.log('─'.repeat(60));
        console.log('Para verificar las políticas RLS:');
        console.log('1. Ve a Supabase Dashboard');
        console.log('2. Authentication → Policies');
        console.log('3. Verifica que la tabla "users" tenga políticas abiertas');
        console.log('4. Si no, ejecuta el script fix-rls-policies.sql');

        // 4. Estado del contexto React
        console.log('\n⚛️ 4. ESTADO DEL CONTEXTO REACT');
        console.log('─'.repeat(60));
        console.log('El contexto de React debería actualizarse automáticamente.');
        console.log('Si no ves usuarios en la interfaz:');
        console.log('1. Abre las herramientas de desarrollo de React');
        console.log('2. Busca el AuthContext');
        console.log('3. Verifica que usersList tenga datos');
        console.log('4. Si está vacío, recarga la página (F5)');

    } catch (error) {
        console.error('❌ ERROR:', error);
        console.log('\n💡 SOLUCIÓN:');
        console.log('Verifica tu conexión a internet y las credenciales de Supabase');
    }

    console.log('\n═'.repeat(60));
    console.log('✅ Verificación completada');
    console.log('═'.repeat(60));
})();
