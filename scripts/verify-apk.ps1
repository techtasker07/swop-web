# Script to verify APK deployment setup

Write-Host "`n=== Swopify APK Deployment Verification ===" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check 1: APK exists in public folder
Write-Host "1. Checking APK file..." -ForegroundColor Yellow
$apkPath = ".\public\downloads\swopify-app.apk"
if (Test-Path $apkPath) {
    $fileInfo = Get-Item $apkPath
    $fileSizeMB = [math]::Round($fileInfo.Length / 1MB, 2)
    Write-Host "   [OK] APK found: $fileSizeMB MB" -ForegroundColor Green
    Write-Host "   Last modified: $($fileInfo.LastWriteTime)" -ForegroundColor Gray
    
    if ($fileSizeMB -lt 10) {
        Write-Host "   [WARNING] File seems too small (< 10 MB)" -ForegroundColor Yellow
        $allGood = $false
    }
} else {
    Write-Host "   [ERROR] APK not found at $apkPath" -ForegroundColor Red
    $allGood = $false
}

# Check 2: API route exists
Write-Host "`n2. Checking API route..." -ForegroundColor Yellow
$apiPath = ".\app\api\app-version\route.ts"
if (Test-Path $apiPath) {
    Write-Host "   [OK] API route exists" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] API route not found" -ForegroundColor Red
    $allGood = $false
}

# Check 3: Download page exists
Write-Host "`n3. Checking download page..." -ForegroundColor Yellow
$downloadPage = ".\app\download\page.tsx"
if (Test-Path $downloadPage) {
    Write-Host "   [OK] Download page exists" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] Download page not found" -ForegroundColor Red
    $allGood = $false
}

# Check 4: Source APK exists
Write-Host "`n4. Checking source APK..." -ForegroundColor Yellow
$sourcePath = "..\swop2\build\app\outputs\apk\release\app-release.apk"
if (Test-Path $sourcePath) {
    $sourceInfo = Get-Item $sourcePath
    $sourceSizeMB = [math]::Round($sourceInfo.Length / 1MB, 2)
    Write-Host "   [OK] Source APK found: $sourceSizeMB MB" -ForegroundColor Green
    Write-Host "   Last built: $($sourceInfo.LastWriteTime)" -ForegroundColor Gray
    
    # Compare with deployed APK
    if (Test-Path $apkPath) {
        $deployedInfo = Get-Item $apkPath
        if ($sourceInfo.LastWriteTime -gt $deployedInfo.LastWriteTime) {
            Write-Host "   [WARNING] Source APK is newer than deployed APK" -ForegroundColor Yellow
            Write-Host "   Run: .\scripts\copy-apk.ps1 to update" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "   [WARNING] Source APK not found (needs to be built)" -ForegroundColor Yellow
    Write-Host "   Run: cd swop2; flutter build apk --release" -ForegroundColor Gray
}

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "[OK] All checks passed! APK deployment is ready." -ForegroundColor Green
} else {
    Write-Host "[ERROR] Some issues found. Please review above." -ForegroundColor Red
}

Write-Host ""
