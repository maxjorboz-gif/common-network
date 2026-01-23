// @ts-nocheck
import { createClient } from 'npm:@base44/sdk@0.8.6';

const base44 = createClient(
    Deno.env.get("BASE44_API_URL") ?? "",
    Deno.env.get("BASE44_SERVICE_ROLE_KEY") ?? ""
);

console.log("INICIO: Borrado Masivo de Datos (Admin Service Role)...");

const entities = ['Comercio', 'SolicitudComercio', 'Producto', 'Orden', 'Lead', 'Conversacion'];

for (const entityName of entities) {
    try {
        console.log(`Borrando datos de la tabla: ${entityName}...`);
        // Listamos todos (cuidado con paginación si hay miles, pero para dev sirve)
        const items = await base44.asServiceRole.entities[entityName].list();

        if (items.length === 0) {
            console.log(`  - La tabla ${entityName} ya estaba vacía.`);
            continue;
        }

        let count = 0;
        for (const item of items) {
            await base44.asServiceRole.entities[entityName].delete(item.id);
            count++;
        }
        console.log(`  - Eliminados ${count} registros de ${entityName}.`);

    } catch (e) {
        console.error(`  - Error limpiando ${entityName}: ${e.message}`);
        // Puede fallar si la tabla no existe aún, seguimos.
    }
}

console.log("FIN: Base de datos limpia. Estructuras conservadas, datos eliminados.");
