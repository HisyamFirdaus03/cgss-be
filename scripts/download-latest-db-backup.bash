#!/bin/bash
# download latest db backup.bash

REMOTE_USER="root"
REMOTE_HOST="hostinger"
CONTAINER_NAME="dco4cc0wgko0ww0cgw8ws0so"
LOCAL_SAVE_DIR="/Users/haziq.jasni/Downloads"
LOCAL_PORT=3307
SCHEMAS=("cgss__main" "cgss_mig" "cgss_mycronsteel")
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Start SSH tunnel in background
echo "Starting SSH tunnel..."
ssh -f -N -L ${LOCAL_PORT}:127.0.0.1:3306 ${REMOTE_USER}@${REMOTE_HOST} \
  "docker exec -i ${CONTAINER_NAME} socat TCP-LISTEN:3306,fork TCP:127.0.0.1:3306" &
TUNNEL_PID=$!

# Give tunnel a moment to open
sleep 3

# Dump each schema
for DB in "${SCHEMAS[@]}"; do
  echo "Dumping ${DB}..."
  mysqldump --column-statistics=0 -h 127.0.0.1 -P ${LOCAL_PORT} -u DBuser -p ${DB} \
    > "${LOCAL_SAVE_DIR}/mariadb-dump-${DB}-${TIMESTAMP}.dmp"
done

# Kill tunnel
kill $TUNNEL_PID
echo "All dumps complete. Tunnel closed."