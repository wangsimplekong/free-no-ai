# Database Documentation

## Overview
This directory contains all database-related files including migrations, initialization scripts, and documentation.

## Directory Structure
```
db/
├── migrations/              # Database change scripts
│   └── YYYYMMDD_HHMMSS_description.sql
├── init/                   # Initialization scripts
│   └── 01_schemas.sql      # Database schema definitions
└── README.md              # This documentation
```

## Migration Naming Convention
- Format: `YYYYMMDD_HHMMSS_description.sql`
- Example: `20240327_143000_create_user_table.sql`

## Tables
### t_user
Main user table storing user information
- `f_id`: Primary key
- `f_username`: Unique username
- `f_email`: User's email address
- `f_password`: Hashed password
- `f_is_active`: Account status
- Standard fields: `f_create_time`, `f_update_time`, `f_operate_time`, `f_is_deleted`

## Development Guidelines
1. Always create new migrations for database changes
2. Never modify existing migration files
3. Always include both up and down migrations
4. Test migrations in development before applying to production