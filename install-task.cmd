@echo off
rem Creates daily task "NAS Photos" (03:00, SYSTEM) that runs scan.ps1 from this folder.
rem Run as Administrator.
schtasks /Create /F /TN "NAS Photos" /SC DAILY /ST 03:00 /RU SYSTEM /RL HIGHEST /TR "powershell -NoProfile -ExecutionPolicy Bypass -File %~dp0scan.ps1"
