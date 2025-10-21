@echo off
if not exist node_modules (
    echo Installing dependencies...
    npm install --no-audit --no-fund
)
echo Starting server...
start cmd /k "node server.js"
timeout 2 > nul
echo Opening browser...
start http://localhost:3000
