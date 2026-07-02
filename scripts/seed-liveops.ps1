# Seed liveops/current in Firestore (requires Firebase CLI + logged-in project).
# Usage: .\scripts\seed-liveops.ps1
#
# Manual alternative: Firebase Console → Firestore → liveops → current → import
# scripts/seed-liveops-current.json

$ErrorActionPreference = "Stop"
$seedFile = Join-Path $PSScriptRoot "seed-liveops-current.json"

if (-not (Test-Path $seedFile)) {
  Write-Error "Missing $seedFile"
}

Write-Host "Import liveops/current from $seedFile"
Write-Host "If firebase firestore:import is unavailable, paste JSON into Firebase Console manually."
Write-Host ""
Write-Host "Document path: liveops/current"
Get-Content $seedFile | Write-Host
