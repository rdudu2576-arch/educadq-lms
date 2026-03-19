import { Pool } from 'pg';
import 'dotenv/config';

async function checkDatabaseConnectivity() {
  console.log('--- Iniciando Validação de Conectividade do Banco de Dados ---');
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL não encontrada no ambiente.');
    process.exit(1);
  }

  console.log('Tentando conexão com as otimizações de rede...');
  
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000, // 10s timeout para failover IPv6 -> IPv4
    idleTimeoutMillis: 30000,
    max: 5,
  });

  try {
    const start = Date.now();
    const client = await pool.connect();
    const duration = Date.now() - start;
    
    console.log(`✅ Conexão estabelecida com sucesso em ${duration}ms!`);
    
    const res = await client.query('SELECT current_database(), now();');
    console.log(`Banco: ${res.rows[0].current_database}`);
    console.log(`Hora do servidor DB: ${res.rows[0].now}`);
    
    client.release();
  } catch (err: any) {
    console.error('❌ Erro de conexão detectado:', err.message);
    
    if (err.code === 'ENETUNREACH') {
      console.warn('⚠️ Erro ENETUNREACH detectado (Provável falha de rota IPv6).');
      console.log('DICA: Certifique-se de que o DATABASE_URL está usando o hostname correto do Supabase.');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function validateEnv() {
  console.log('\n--- Verificando Variáveis de Ambiente Críticas ---');
  const criticalVars = ['DATABASE_URL', 'JWT_SECRET', 'NODE_ENV'];
  
  criticalVars.forEach(v => {
    if (process.env[v]) {
      console.log(`✅ ${v} está configurada.`);
    } else {
      console.warn(`⚠️ ${v} NÃO está configurada.`);
    }
  });
}

async function main() {
  await validateEnv();
  await checkDatabaseConnectivity();
  console.log('\n--- Script de Correção e Validação Concluído com Sucesso ---');
}

main().catch(err => {
  console.error('Erro fatal no script:', err);
  process.exit(1);
});
