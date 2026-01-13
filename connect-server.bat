@echo off
REM Connect to STEM Kiosk server using sshpass via WSL

set SERVER=172.16.74.22
set USER=stemcenter
set PASSWORD=pi@314159

REM Use WSL to run sshpass
wsl sshpass -p "%PASSWORD%" ssh -o StrictHostKeyChecking=no "%USER%@%SERVER%" %*
