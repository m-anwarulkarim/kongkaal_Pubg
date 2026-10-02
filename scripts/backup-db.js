import pg from 'pg'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config()

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ DIRECT_URL or DATABASE_URL missing from .env')
  process.exit(1)
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

async function backupDatabase() {
  console.log('🔍 Connecting to PostgreSQL / Supabase Database...')
  const startTime = Date.now()

  try {
    await client.connect()
    console.log('✅ Connection successful! Database is ACTIVE.')
  } catch (err) {
    console.error('❌ DB Connection Failed:', err)
    process.exit(1)
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.resolve(process.cwd(), 'backup')
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  const sqlFilePath = path.join(backupDir, `full_database_backup_${timestamp}.sql`)
  const jsonFilePath = path.join(backupDir, `full_database_backup_${timestamp}.json`)

  let sqlOutput = `-- ==========================================\n`
  sqlOutput += `-- COMPLETE DATABASE BACKUP (ALL SCHEMAS & DATA)\n`
  sqlOutput += `-- Included Schemas: public, auth, storage\n`
  sqlOutput += `-- Timestamp: ${new Date().toISOString()}\n`
  sqlOutput += `-- ==========================================\n\n`

  const fullDataJson = {
    exported_at: new Date().toISOString(),
    schemas: {}
  }

  try {
    // Fetch all user & system schemas we care about (public, auth, storage)
    const schemasToBackup = ['public', 'auth', 'storage']

    for (const schemaName of schemasToBackup) {
      console.log(`\n📂 Scanning schema: '${schemaName}'...`)
      
      const tablesRes = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = $1 AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `, [schemaName])

      const tables = tablesRes.rows.map(r => r.table_name)
      if (tables.length === 0) {
        console.log(`   (No tables in ${schemaName})`)
        continue
      }

      fullDataJson.schemas[schemaName] = {}

      for (const tableName of tables) {
        console.log(`📦 Backing up ${schemaName}.${tableName}...`)
        
        // Get columns
        const columnsRes = await client.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_schema = $1 AND table_name = $2
          ORDER BY ordinal_position;
        `, [schemaName, tableName])

        const columns = columnsRes.rows

        // Get rows
        let rows = []
        try {
          const dataRes = await client.query(`SELECT * FROM "${schemaName}"."${tableName}";`)
          rows = dataRes.rows
        } catch (err) {
          console.warn(`  ⚠️ Could not select from ${schemaName}.${tableName}: ${err.message}`)
          continue
        }

        console.log(`  └─ Total rows in '${schemaName}.${tableName}': ${rows.length}`)

        fullDataJson.schemas[schemaName][tableName] = {
          columns: columns,
          rowCount: rows.length,
          rows: rows
        }

        // Generate SQL dump
        sqlOutput += `-- ==========================================\n`
        sqlOutput += `-- Table: ${schemaName}.${tableName}\n`
        sqlOutput += `-- Row Count: ${rows.length}\n`
        sqlOutput += `-- ==========================================\n`

        if (rows.length > 0) {
          const colNames = columns.map(c => `"${c.column_name}"`).join(', ')
          
          for (const row of rows) {
            const values = columns.map(c => {
              const val = row[c.column_name]
              if (val === null || val === undefined) {
                return 'NULL'
              }
              if (typeof val === 'number' || typeof val === 'boolean') {
                return val
              }
              if (val instanceof Date) {
                return `'${val.toISOString()}'`
              }
              if (typeof val === 'object') {
                return `'${JSON.stringify(val).replace(/'/g, "''")}'`
              }
              return `'${String(val).replace(/'/g, "''")}'`
            }).join(', ')

            sqlOutput += `INSERT INTO "${schemaName}"."${tableName}" (${colNames}) VALUES (${values}) ON CONFLICT DO NOTHING;\n`
          }
        } else {
          sqlOutput += `-- (No rows in this table)\n`
        }
        sqlOutput += `\n`
      }
    }

    // Write files
    fs.writeFileSync(sqlFilePath, sqlOutput, 'utf8')
    fs.writeFileSync(jsonFilePath, JSON.stringify(fullDataJson, null, 2), 'utf8')

    const endTime = Date.now()
    console.log('\n==========================================')
    console.log(`🎉 FULL DATABASE BACKUP SUCCESSFUL in ${(endTime - startTime) / 1000}s!`)
    console.log(`📄 SQL Backup: ${sqlFilePath}`)
    console.log(`📄 JSON Backup: ${jsonFilePath}`)
    console.log('==========================================\n')

  } catch (err) {
    console.error('❌ Backup Error:', err)
  } finally {
    await client.end()
  }
}

backupDatabase()
