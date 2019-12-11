#!/usr/bin/env bash

NODE_ENV=production npm start -- --silent --port 9000 & PID=$!
echo "Server is $PID"

sleep 2

echo "Requesting localhost site to save html to build"
curl -s http://localhost:9000 > /dev/null

if test -f "build/index.html"; then
  echo "Built file exists"
else
  echo "Built file DOES NOT exist"
fi

echo "Kill $PID"
kill -9 $PID
kill -INT $PID
