import * as esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function build() {
  try {
    await esbuild.build({
      entryPoints: [path.resolve(__dirname, '../server/index.ts')],
      bundle: true,
      platform: 'node',
      target: 'node20',
      outfile: path.resolve(__dirname, '../dist/server/index.js'),
      format: 'esm',
      external: [
        'express',
        'pg',
        'drizzle-orm',
        'bcryptjs',
        'jsonwebtoken',
        'cookie-parser',
        'dotenv',
        'firebase-admin',
        'firebase',
        'zod',
        'lucide-react',
        'date-fns',
        'superjson',
        'mercadopago',
        'xlsx'
      ],
      banner: {
        js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
      },
    });
    console.log('Server build completed successfully!');
  } catch (error) {
    console.error('Server build failed:', error);
    process.exit(1);
  }
}

build();
