# Quick Start Guide - Local Development

This is a condensed version of the setup guide. For detailed instructions, see [LOCAL_DEVELOPMENT_SETUP.md](./LOCAL_DEVELOPMENT_SETUP.md).

## Prerequisites

- Node.js v18+ ✓ (already installed)
- pnpm ✓ (already installed)
- MariaDB (need to install)

## Quick Setup (5 Steps)

### 1. Install MariaDB

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install mariadb-server mariadb-client
sudo systemctl start mariadb
sudo mysql_secure_installation
```

**macOS:**
```bash
brew install mariadb
brew services start mariadb
mysql_secure_installation
```

### 2. Setup Database

Edit `setup-database.sql` and replace `'yourpassword'` with your desired password, then run:

```bash
# Run the setup script
sudo mysql -u root -p < setup-database.sql
```

### 3. Import Your Database Dump

```bash
# Replace /path/to/your/dump.dmp with your actual dump file path
mysql -u DBuser -p cgss__main < /path/to/your/dump.dmp
```

When prompted, enter the password you set in step 2.

### 4. Configure Environment

The `.env` file has been created for you. Update these values:

```bash
# Edit .env file
nano .env  # or use your favorite editor
```

**Required changes:**
- `DATABASE_PASSWORD` - Set to the password you chose in step 2
- `JWT_USER_ACCESS_SECRET` - Generate a random string
- `JWT_USER_REFRESH_SECRET` - Generate a random string
- `JWT_USER_PASSWORD_SECRET` - Generate a random string
- `JWT_USER_VERIFICATION_SECRET` - Generate a random string

**Generate random secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this command 4 times and copy each output to the respective JWT secret fields.

### 5. Install, Build, and Run

```bash
# Install dependencies
pnpm install

# Build the project
pnpm run build

# Start the development server with hot reload
pnpm run start
```

## Verify Setup

Open your browser:
- Application: http://localhost:4000
- API Explorer: http://localhost:4000/explorer
- Health Check: http://localhost:4000/api/health-check

## Development Workflow

1. Edit code in your IDE
2. Save file → Auto-reloads
3. Test changes immediately
4. No Docker rebuild needed! 🎉

## Common Issues

**Can't connect to database?**
```bash
# Test connection
mysql -u DBuser -p -h localhost

# Check if MariaDB is running
sudo systemctl status mariadb
```

**Port 4000 in use?**
```bash
# Change port in .env
CGSS_BE_PORT=4001
```

**Build errors?**
```bash
pnpm run clean
pnpm run build
```

## Need More Details?

See the comprehensive guide: [LOCAL_DEVELOPMENT_SETUP.md](./LOCAL_DEVELOPMENT_SETUP.md)
