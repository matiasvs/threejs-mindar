import { Compiler } from 'mind-ar/dist/mindar-image.prod.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function compileTarget() {
    console.log('🎯 Compilando imagen objetivo...');

    const inputPath = path.join(__dirname, '../assets/target-image.png');
    const outputPath = path.join(__dirname, '../public/targets.mind');

    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
        console.error('❌ Error: No se encontró la imagen objetivo en assets/target-image.png');
        console.log('📝 Por favor, coloca tu imagen objetivo en: assets/target-image.png');
        process.exit(1);
    }

    try {
        const compiler = new Compiler();
        const dataList = await compiler.compileImageTargets(
            [inputPath],
            (progress) => {
                console.log(`Progreso: ${Math.round(progress * 100)}%`);
            }
        );

        const exportedBuffer = await compiler.exportData();

        // Ensure public directory exists
        const publicDir = path.join(__dirname, '../public');
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }

        // Write compiled file
        fs.writeFileSync(outputPath, Buffer.from(exportedBuffer));

        console.log('✅ Compilación exitosa!');
        console.log(`📁 Archivo guardado en: ${outputPath}`);
    } catch (error) {
        console.error('❌ Error durante la compilación:', error);
        process.exit(1);
    }
}

compileTarget();
