# 🔄 Auto-Migration System

## Overview

SmartHealth now includes an automatic database migration system that:
- ✅ Creates the database if it doesn't exist
- ✅ Creates all tables automatically on server start
- ✅ Adds new columns when schema is updated
- ✅ Preserves existing data
- ✅ Inserts sample doctors if database is empty

## How It Works

### On Server Start

1. **Database Creation**: Checks if database exists, creates it if not
2. **Connection Test**: Verifies database connection
3. **Schema Sync**: Reads `database/schema.sql` and creates/updates tables
4. **Column Updates**: Adds any missing columns to existing tables
5. **Sample Data**: Inserts sample doctors if tables are empty

### No Manual Setup Required

You no longer need to run `npm run db:setup` manually. Just start the server:

```bash
npm start
```

The system will automatically:
- Create the database
- Create all tables
- Add sample doctors
- Keep everything in sync

## Adding New Tables

1. Add your table definition to `database/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS my_new_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

2. Restart the server - the table will be created automatically!

## Adding New Columns

### Method 1: Update schema.sql (Recommended)

1. Add the column to your table in `database/schema.sql`
2. Restart the server

**Note**: This won't automatically add columns to existing tables. Use Method 2 for that.

### Method 2: Use Migration System

1. Open `backend/config/migrations.js`
2. Add your column to the `tableUpdates` object:

```javascript
const tableUpdates = {
  users: {
    'new_column': 'VARCHAR(100) DEFAULT NULL',
    'another_column': 'INT DEFAULT 0'
  },
  doctors: {
    'availability_hours': 'JSON DEFAULT NULL'
  }
};
```

3. Restart the server - columns will be added automatically!

## Checking Migration Status

### Via API

```bash
# Check database status
curl http://localhost:5000/api/doctors/db-status
```

Response:
```json
{
  "success": true,
  "database": "smarthealth",
  "tables": {
    "users": {
      "exists": true,
      "columns": 11
    },
    "doctors": {
      "exists": true,
      "columns": 12
    },
    "cases": {
      "exists": true,
      "columns": 11
    }
    // ... more tables
  }
}
```

### Via Logs

Check server startup logs:

```
✅ Database 'smarthealth' ready
✅ Database connected successfully
🔄 Running database migrations...
✅ Database schema synchronized
✅ Database migrations completed successfully
```

## Example: Adding a New Feature

Let's say you want to add a "profile_picture" field to doctors:

### Step 1: Update Schema

Edit `database/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    specialization VARCHAR(100),
    fee DECIMAL(10, 2) NOT NULL,
    profile_picture VARCHAR(255) DEFAULT NULL,  -- NEW COLUMN
    status ENUM('online', 'offline', 'busy') DEFAULT 'offline',
    -- ... rest of columns
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Step 2: Add to Migration System

Edit `backend/config/migrations.js`:

```javascript
const tableUpdates = {
  doctors: {
    'profile_picture': 'VARCHAR(255) DEFAULT NULL'
  }
};
```

### Step 3: Restart Server

```bash
npm start
```

Output:
```
✅ Added column doctors.profile_picture
✅ Database migrations completed successfully
```

Done! The column is now available in your database.

## Safety Features

### Non-Destructive

- ✅ Never drops tables
- ✅ Never deletes columns
- ✅ Never modifies existing data
- ✅ Only adds missing tables/columns

### Error Handling

- Ignores "already exists" errors
- Continues on non-critical errors
- Logs all operations
- Server starts even if migrations have warnings

### Rollback

If you need to rollback:

```sql
-- Remove a column
ALTER TABLE doctors DROP COLUMN profile_picture;

-- Drop a table
DROP TABLE IF EXISTS my_new_table;
```

## Manual Migration (If Needed)

If you prefer manual control:

```bash
# Run setup script
npm run db:setup

# Or use MySQL directly
mysql -u root -p smarthealth < database/schema.sql
```

## Troubleshooting

### Tables Not Created

**Check logs for errors:**
```bash
npm start
```

**Verify database connection:**
```bash
mysql -u root -p -e "SHOW DATABASES;"
```

**Check .env file:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=smarthealth
```

### Column Not Added

**Check if column already exists:**
```sql
DESCRIBE doctors;
```

**Check migration logs:**
```
✅ Added column doctors.profile_picture
```

**Manually add if needed:**
```sql
ALTER TABLE doctors ADD COLUMN profile_picture VARCHAR(255) DEFAULT NULL;
```

### Permission Errors

**Grant privileges:**
```sql
GRANT ALL PRIVILEGES ON smarthealth.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

## Best Practices

### 1. Always Use CREATE TABLE IF NOT EXISTS

```sql
CREATE TABLE IF NOT EXISTS my_table (
    -- columns
);
```

### 2. Use Default Values

```sql
new_column VARCHAR(100) DEFAULT NULL
new_count INT DEFAULT 0
```

### 3. Test Migrations Locally First

```bash
# Test on local database
npm start

# Check status
curl http://localhost:5000/api/doctors/db-status
```

### 4. Backup Before Major Changes

```bash
# Backup database
mysqldump -u root -p smarthealth > backup.sql

# Restore if needed
mysql -u root -p smarthealth < backup.sql
```

### 5. Document Schema Changes

Update this file when adding new tables/columns.

## Migration History

### v1.0.0 - Initial Schema
- Created all base tables
- Added sample doctors
- Set up relationships

### Future Updates
- Document new tables/columns here
- Include migration date
- Note any breaking changes

## Configuration

### Disable Auto-Migration (Not Recommended)

If you want to disable auto-migration:

Edit `backend/server.js`:

```javascript
// Comment out this line:
// const migrationSuccess = await runMigrations();
```

### Custom Migration Path

Edit `backend/config/migrations.js`:

```javascript
const schemaPath = path.join(__dirname, '../../database/custom-schema.sql');
```

## Summary

✅ **Zero Configuration**: Just start the server
✅ **Auto-Sync**: Tables always match schema.sql
✅ **Safe**: Never destroys data
✅ **Flexible**: Easy to add new tables/columns
✅ **Monitored**: Check status via API

**No more manual database setup!** 🎉
