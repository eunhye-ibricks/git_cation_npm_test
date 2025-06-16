#!/bin/sh
set -e
# set directory
SCRIPT=$0
APP_ROOT=$(cd "$(dirname "$0")"; pwd)
echo $APP_ROOT
cd "$APP_ROOT"

# set pm2
PM2=$APP_ROOT/node_modules/pm2/bin/pm2
PM2_HOME=$APP_ROOT/.pm2
export PM2_HOME

PM2_CONFIG=$APP_ROOT/ecosystem.config.json

# command
case $1 in
start)
  if [ -z "$2" ]; then
    echo 'usage : ./server start test | dev | prod'
    exit 100
  fi

case "$2" in
  test)
    export NODE_ENV=test
    ;;
  dev)
    export NODE_ENV=development
    ;;
  prod)
    export NODE_ENV=production
    ;;
  *)
    echo 'Invalid environment. Use "test" or "dev" or "prod".'
    exit 101
    ;;
esac
  echo "building application ..."
  npm run build

  echo "start server ... $NODE_ENV"
  "$PM2" start "$PM2_CONFIG" --env $NODE_ENV
  ;;
restart)
  echo "building application ..."
  npm run build
  
  echo 'restart server ...'
  "$PM2" restart "$PM2_CONFIG"
  ;;
stop)
  echo 'stop server ...'
  "$PM2" stop "$PM2_CONFIG"
  ;;
delete)
  echo 'remove server ...'
  "$PM2" delete "$PM2_CONFIG"
  ;;
info)
  echo 'describe all parameters ...'
  "$PM2" info "$PM2_CONFIG"
  ;;
logs | log)
  echo 'stream log file ...'
  "$PM2" log
  ;;
monit)
  echo 'monit ...'
  "$PM2" monit
  ;;
list)
  echo 'listing server ...'
  "$PM2" list
  ;;
*)
  echo ' usage: '$0' [command]'
  echo ''
  echo ' command:'
  echo '   start dev | prod    start a server'
  echo '   restart             restart a server'
  echo '   stop                stop a server'
  echo '   delete              remove a server'
  echo '   info                describe all parameters'
  echo '   logs                stream log file'
  echo '   list                list all servers'
  echo ''
  ;;
esac