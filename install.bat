@echo off
set NODE_ENV=production
call npm install
call npm install -g nodemon
call npm install -g node-windows
call npm link node-windows
echo ==================================================
echo IQXWeb.bat will run the server in a console window
echo node serviceInstall.js will install the service
echo ==================================================
