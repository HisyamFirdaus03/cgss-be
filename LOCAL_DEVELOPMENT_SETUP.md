# Local Development Setup Guide (Without Docker)

This guide will help you set up and run the CGSS Backend application locally without Docker, enabling faster development cycles.

## Prerequisites

1. **Node.js** (v18 or higher) - Already installed ✓
2. **pnpm** - Already installed ✓
3. **MariaDB** (v10.5 or higher) - Need to install

## Step 1: Install MariaDB

### For Ubuntu/Debian:
```bash
sudo apt update
sudo apt install mariadb-server mariadb-client
sudo systemctl start mariadb
sudo systemctl enable mariadb
```

### For macOS (using Homebrew):
```bash
brew install mariadb
brew services start mariadb
```

### For Windows:
Download and install from: https://mariadb.org/download/

### Verify Installation:
```bash
mariadb --version
# or
mysql --version
```

## Step 2: Secure MariaDB Installation

Run the security script:
```bash
sudo mysql_secure_installation
```

Follow the prompts:
- Set root password (remember this!)
- Remove anonymous users: Y
- Disallow root login remotely: Y
- Remove test database: Y
- Reload privilege tables: Y

## Step 3: Create Database User and Databases

Login to MariaDB as root:
```bash
sudo mysql -u root -p
```

Then run these SQL commands:
```sql
-- Create a database user (replace 'yourpassword' with a secure password)
CREATE USER 'DBuser'@'localhost' IDENTIFIED BY 'yourpassword';
CREATE USER 'DBuser'@'%' IDENTIFIED BY 'yourpassword';

-- Create the required databases
CREATE DATABASE IF NOT EXISTS cgss__main;
CREATE DATABASE IF NOT EXISTS cgss_demo;
CREATE DATABASE IF NOT EXISTS cgss_mycronsteel;
CREATE DATABASE IF NOT EXISTS cgss_mig;
CREATE DATABASE IF NOT EXISTS cgss_demofresh;

-- Grant privileges
GRANT ALL PRIVILEGES ON cgss__main.* TO 'DBuser'@'localhost';
GRANT ALL PRIVILEGES ON cgss_demo.* TO 'DBuser'@'localhost';
GRANT ALL PRIVILEGES ON cgss_mycronsteel.* TO 'DBuser'@'localhost';
GRANT ALL PRIVILEGES ON cgss_mig.* TO 'DBuser'@'localhost';
GRANT ALL PRIVILEGES ON cgss_demofresh.* TO 'DBuser'@'localhost';

GRANT ALL PRIVILEGES ON cgss__main.* TO 'DBuser'@'%';
GRANT ALL PRIVILEGES ON cgss_demo.* TO 'DBuser'@'%';
GRANT ALL PRIVILEGES ON cgss_mycronsteel.* TO 'DBuser'@'%';
GRANT ALL PRIVILEGES ON cgss_mig.* TO 'DBuser'@'%';
GRANT ALL PRIVILEGES ON cgss_demofresh.* TO 'DBuser'@'%';

FLUSH PRIVILEGES;

-- Exit MariaDB
EXIT;
```

## Step 4: Import Your Database Dump

If you have a `.dmp` file, import it into the main database:

```bash
# If your file is a .dmp file (MySQL dump)
mysql -u DBuser -p cgss__main < /path/to/your/dump.dmp

# Or if it's a .sql file
mysql -u DBuser -p cgss__main < /path/to/your/dump.sql
```

**Note:** Replace `/path/to/your/dump.dmp` with the actual path to your dump file.

If you need to import to specific databases:
```bash
# For demo database
mysql -u DBuser -p cgss_demo < /path/to/your/dump.dmp

# For other databases
mysql -u DBuser -p cgss_mycronsteel < /path/to/your/dump.dmp
```

## Step 5: Create Environment File

Copy the example environment file:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```bash
# Application Port
CGSS_BE_PORT=4000

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=DBuser
DATABASE_PASSWORD=yourpassword
DATABASE_LB4_PATH=datasources.db

# Email Configuration (optional for development)
NODEMAILER_SERVICE=gmail
NODEMAILER_USERNAME=your-email@gmail.com
NODEMAILER_PASSWORD=your-app-password

# JWT Secrets (generate random strings for these)
JWT_USER_ACCESS_SECRET=your-secret-key-here
JWT_USER_ACCESS_EXPIRES_IN=86400
JWT_USER_ACCESS_SCOPE=User
JWT_USER_ACCESS_ISSUER=loopback4

JWT_USER_REFRESH_SECRET=your-refresh-secret-here
JWT_USER_REFRESH_EXPIRES_IN=432000
JWT_USER_REFRESH_SCOPE=User
JWT_USER_REFRESH_ISSUER=loopback4

JWT_USER_PASSWORD_SECRET=your-password-secret-here
JWT_USER_PASSWORD_EXPIRES_IN=3600
JWT_USER_PASSWORD_SCOPE=User
JWT_USER_PASSWORD_ISSUER=loopback4

JWT_USER_VERIFICATION_SECRET=your-verification-secret-here
JWT_USER_VERIFICATION_EXPIRES_IN=86400
JWT_USER_VERIFICATION_SCOPE=User
JWT_USER_VERIFICATION_ISSUER=loopback4
```

### Generate Random Secrets:
You can generate secure random secrets using:
```bash
# Generate a random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 6: Install Dependencies

```bash
pnpm install
```

If you encounter any issues with native modules (like bcrypt), rebuild them:
```bash
npm rebuild bcrypt --update-binary
```

## Step 7: Build the Project

```bash
pnpm run build
```

## Step 8: Run Database Migrations (if applicable)

If your project has migrations:
```bash
pnpm run migrate
```

## Step 9: Start the Development Server

Now you can start the application in development mode with hot-reload:

```bash
pnpm run start
```

This will:
1. Clean the dist folder
2. Build the project
3. Start the server with watch mode (auto-reloads on file changes)

The server will be available at: `http://localhost:4000`

## Alternative: Start Without Watch Mode

If you just want to run once without auto-reload:
```bash
pnpm run start:old
```

## Verify the Setup

1. Open your browser and navigate to: `http://localhost:4000`
2. Check API Explorer (if enabled): `http://localhost:4000/explorer`
3. Test the health check endpoint: `http://localhost:4000/api/health-check`

## Development Workflow

With this setup, your development workflow is much faster:

1. **Make code changes** in your editor
2. **Save the file** - The TypeScript compiler will automatically detect changes
3. **Server auto-restarts** - Changes are reflected immediately
4. **Test your changes** - No need to rebuild Docker images!

## Troubleshooting

### Database Connection Issues

If you can't connect to the database:

1. Check if MariaDB is running:
   ```bash
   sudo systemctl status mariadb
   # or
   brew services list
   ```

2. Verify credentials:
   ```bash
   mysql -u DBuser -p -h localhost
   ```

3. Check MariaDB logs:
   ```bash
   sudo tail -f /var/log/mysql/error.log
   ```

### Port Already in Use

If port 4000 is already in use:
```bash
# Find what's using the port
sudo lsof -i :4000
# or
sudo netstat -tulpn | grep 4000

# Change the port in your .env file
CGSS_BE_PORT=4001
```

### Build Errors

If you encounter TypeScript build errors:
```bash
# Clean and rebuild
pnpm run clean
pnpm run build
```

### Native Module Errors (bcrypt, etc.)

```bash
# Rebuild native modules
npm rebuild bcrypt --update-binary
npm rebuild loopback-connector-mysql --update-binary
```

## Scripts Reference

- `pnpm run start` - Build and run with watch mode (recommended for development)
- `pnpm run start:old` - Build and run once without watch mode
- `pnpm run build` - Build the TypeScript project
- `pnpm run clean` - Clean build artifacts
- `pnpm run rebuild` - Clean and rebuild
- `pnpm run test` - Run tests
- `pnpm run lint` - Check code style
- `pnpm run lint:fix` - Fix code style issues

## Running Only the Database with Docker (Optional)

If you prefer to keep the database in Docker but run the app locally:

```bash
# Start only the database
docker compose -f docker-compose-dev.yml up -d

# The database will be available on localhost:3306
# Update your .env to use:
DATABASE_HOST=localhost
DATABASE_PORT=3306
```

Then run the application locally as described above.

## Benefits of Local Development

1. **Instant feedback** - No Docker rebuild needed
2. **Faster iteration** - Changes reflect immediately
3. **Better debugging** - Direct access to Node.js debugger
4. **Resource efficient** - No Docker overhead
5. **IDE integration** - Better IntelliSense and debugging

## Need Help?

- Check the application logs for errors
- Review the `.env` configuration
- Verify database connectivity
- Ensure all dependencies are installed correctly
