#!/usr/bin/env bash
set -euo pipefail

# Deploy webapp to Telegram Mini App
# Usage:
#   ./deploy/deploy-webapp.sh              # build + upload + restart
#   ./deploy/deploy-webapp.sh --build-only # only build, no upload
#   ./deploy/deploy-webapp.sh --upload-only # only upload + restart (skip build)

REMOTE_HOST="${REMOTE_HOST:-43.160.212.233}"
REMOTE_USER="${REMOTE_USER:-root}"
REMOTE_PASS="${REMOTE_PASS:-agentassitant2026@}"
REMOTE_WEBAPP_ROOT="${REMOTE_WEBAPP_ROOT:-/opt/telegram-ai-webapp}"
REMOTE_COMPOSE_FILE="${REMOTE_COMPOSE_FILE:-/opt/telegram-ai-character/deploy/app.compose.yaml}"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEBAPP_TAR="/tmp/telegram-ai-webapp-latest.tar.gz"

MODE="${1:-}"

# Step 1: Build locally to verify
if [ "${MODE}" != "--upload-only" ]; then
  echo "[1/4] Building webapp (local verify)..."
  cd "${PROJECT_ROOT}"
  npm run build
  echo "  Build complete -> dist/"
else
  echo "[1/4] Skipping build (--upload-only)"
fi

if [ "${MODE}" = "--build-only" ]; then
  echo "Build-only mode. Done."
  exit 0
fi

# Step 2: Package full source (remote does npm run build inside Docker)
echo "[2/4] Packaging full source..."
tar -czf "${WEBAPP_TAR}" \
  -C "${PROJECT_ROOT}" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.DS_Store' \
  --exclude='dist' \
  .

echo "  Package ready: ${WEBAPP_TAR} ($(du -h "${WEBAPP_TAR}" | cut -f1))"

# Step 3: Upload
echo "[3/4] Uploading to ${REMOTE_HOST}..."
expect -c "
  log_user 0
  set timeout 300
  spawn scp -o StrictHostKeyChecking=no ${WEBAPP_TAR} ${REMOTE_USER}@${REMOTE_HOST}:/tmp/telegram-ai-webapp-latest.tar.gz
  expect \"password:\"
  send -- \"${REMOTE_PASS}\\r\"
  expect eof
  catch wait result
  exit [lindex \$result 3]
"

# Step 4: Extract & Restart
echo "[4/4] Extracting and restarting webapp container..."

LOCAL_REMOTE_SCRIPT="/tmp/remote_webapp_deploy_exec.sh"
cat > "${LOCAL_REMOTE_SCRIPT}" <<'REMOTE_SCRIPT'
#!/usr/bin/env bash
set -euo pipefail
TS=$(date +%Y%m%d%H%M%S)

REMOTE_WEBAPP_ROOT="${REMOTE_WEBAPP_ROOT:-/opt/telegram-ai-webapp}"
REMOTE_COMPOSE_FILE="${REMOTE_COMPOSE_FILE:-/opt/telegram-ai-character/deploy/app.compose.yaml}"

# Backup current
if test -d "${REMOTE_WEBAPP_ROOT}/current"; then
  cp -a "${REMOTE_WEBAPP_ROOT}/current" "${REMOTE_WEBAPP_ROOT}/current.bak.${TS}" || true
fi

# Extract full source (Dockerfile runs npm run build inside container)
mkdir -p "${REMOTE_WEBAPP_ROOT}/current"
rm -rf "${REMOTE_WEBAPP_ROOT}/current"/*
tar -xzf /tmp/telegram-ai-webapp-latest.tar.gz -C "${REMOTE_WEBAPP_ROOT}/current"

# Restart webapp container (rebuilds from source)
docker compose -f "${REMOTE_COMPOSE_FILE}" up -d --build webapp

echo "Webapp deployed successfully."
REMOTE_SCRIPT

# Upload the remote script
expect -c "
  log_user 0
  set timeout 300
  spawn scp -o StrictHostKeyChecking=no ${LOCAL_REMOTE_SCRIPT} ${REMOTE_USER}@${REMOTE_HOST}:/tmp/remote_webapp_deploy_exec.sh
  expect \"password:\"
  send -- \"${REMOTE_PASS}\\r\"
  expect eof
  catch wait result
  exit [lindex \$result 3]
"

# Execute the remote script
expect -c "
  log_user 1
  set timeout 600
  spawn ssh -tt -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} bash /tmp/remote_webapp_deploy_exec.sh
  expect \"password:\"
  send -- \"${REMOTE_PASS}\\r\"
  expect eof
  catch wait result
  exit [lindex \$result 3]
"

echo ""
echo "DONE: webapp deployed to Telegram Mini App."
echo "  Remote: ${REMOTE_HOST}"
echo "  Path:   ${REMOTE_WEBAPP_ROOT}/current"
