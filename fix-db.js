const { Client } = require('pg');
require('dotenv').config({ path: '../11- LeadFlowPro/.env' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to DB");
    
    await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
    
    // Add default to id
    await client.query(`ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;`);
    console.log("Set default for profiles.id to gen_random_uuid()::text");
    
    // Add default to other tables just in case
    await client.query(`ALTER TABLE admin_audit_logs ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;`).catch(()=>console.log("admin_audit_logs already set"));
    await client.query(`ALTER TABLE billing_records ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;`).catch(()=>console.log("billing_records already set"));
    
  } catch(e) {
    console.error("Error", e);
  } finally {
    await client.end();
  }
}

run();
