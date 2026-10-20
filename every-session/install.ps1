Write-Host "==> Harness2 + Context Mode Every-Session Installer (Windows)"
npm install -g context-mode
if (-not (Test-Path "$env:USERPROFILE\.harness2\runs\_global")) {
  New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.harness2\runs\_global"
}
Copy-Item -Path "harness2\improvement-harness.json" -Destination "$env:USERPROFILE\.harness2\improvement-harness.json" -Force
Write-Host "Copy configs from configs/ to your agent config locations"
Write-Host "Done! Run ctx-doctor inside your agent"
