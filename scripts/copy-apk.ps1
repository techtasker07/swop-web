# Script to copy the latest APK from Flutter build to web public folder

$sourcePath = "..\swop2\build\app\outputs\apk\release\app-release.apk"
$destPath = ".\public\downloads\swopify-app.apk"

Write-Host "Copying APK from Flutter build to web public folder..." -ForegroundColor Cyan

if (Test-Path $sourcePath) {
    # Create downloads directory if it doesn't exist
    $destDir = Split-Path -Parent $destPath
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        Write-Host "Created downloads directory" -ForegroundColor Green
    }

    # Copy the APK
    Copy-Item -Path $sourcePath -Destination $destPath -Force
    
    # Get file info
    $fileInfo = Get-Item $destPath
    $fileSizeMB = [math]::Round($fileInfo.Length / 1MB, 2)
    
    Write-Host "[OK] APK copied successfully!" -ForegroundColor Green
    Write-Host "  Size: $fileSizeMB MB" -ForegroundColor Gray
    Write-Host "  Modified: $($fileInfo.LastWriteTime)" -ForegroundColor Gray
    Write-Host "  Location: $destPath" -ForegroundColor Gray
} else {
    Write-Host "[ERROR] APK not found at $sourcePath" -ForegroundColor Red
    Write-Host "  Please build the Flutter app first:" -ForegroundColor Yellow
    Write-Host "  cd swop2" -ForegroundColor Yellow
    Write-Host "  flutter build apk --release" -ForegroundColor Yellow
    exit 1
}
