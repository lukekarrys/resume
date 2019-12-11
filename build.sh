#!/usr/bin/env bash

./node_modules/.bin/rimraf build
node resume.js
NODE_ENV=production ./node_modules/.bin/resume serve --theme stackoverflow --dir build/ --silent --port 9000 & PID=$!
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
kill -INT $PID

node build.js
./node_modules/.bin/cpr build/index.html build/404.html
./node_modules/.bin/cpr assets build
echo "/*   /404.html   404" > build/_redirects
