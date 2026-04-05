# APK Deployment Guide

This guide explains how to deploy updated APK files to the Swopify website for app updates.

## Problem

When users try to update the app, they get "There was a problem while parsing the package" error. This happens when:
- The APK file is missing from the website
- The APK file is corrupted or outdated
- The APK wasn't properly signed

## Solution

### Step 1: Build the Flutter App

```powershell
cd swop2
flutter clean
flutter build apk --release
```

This creates the APK at: `swop2/build/app/outputs/apk/release/app-release.apk`

### Step 2: Copy APK to Website

Run the automated script from the `swopify-web` directory:

```powershell
cd swopify-web
.\scripts\copy-apk.ps1
```

Or manually copy:
```powershell
Copy-Item ..\swop2\build\app\outputs\apk\release\app-release.apk .\public\downloads\swopify-app.apk
```

### Step 3: Verify the APK

Check that the file exists and is valid:
```powershell
# Check file size (should be 20-50 MB typically)
Get-Item .\public\downloads\swopify-app.apk | Select-Object Name, Length, LastWriteTime
```

### Step 4: Update Version Number

Update the version in `swopify-web/app/api/app-version/route.ts`:

```typescript
return NextResponse.json({
  version: '1.0.3', // Update this
  downloadUrl: '/downloads/swopify-app.apk',
  // ...
})
```

Also update in `swop2/pubspec.yaml`:
```yaml
version: 1.0.3+3  # version+build_number
```

### Step 5: Deploy to Production

```powershell
# Commit changes
git add public/downloads/swopify-app.apk
git add app/api/app-version/route.ts
git commit -m "Update APK to version 1.0.3"
git push

# Deploy (if using Vercel)
vercel --prod
```

## Important Notes

### APK Signing

The APK must be properly signed. Check your `swop2/android/app/build.gradle`:

```gradle
signingConfigs {
    release {
        storeFile file("path/to/keystore.jks")
        storePassword "your-password"
        keyAlias "your-alias"
        keyPassword "your-password"
    }
}
```

### Version Management

The app checks for updates using the version number. Ensure:
1. `pubspec.yaml` version matches the API response
2. Build number increments with each release
3. Version format: `major.minor.patch+buildNumber` (e.g., `1.0.3+3`)

### File Size Considerations

- APK files are typically 20-50 MB
- Git has file size limits (100 MB on GitHub)
- Consider using Git LFS for large files
- Or host APK on external storage (S3, Firebase Storage)

## Troubleshooting

### "Parsing package" error

This usually means:
1. **Corrupted file**: Re-build and copy the APK
2. **Wrong architecture**: Ensure you're building for the correct Android architecture
3. **Unsigned APK**: Make sure the release build is properly signed
4. **Incomplete download**: Check file size matches the built APK

### APK not downloading

1. Check the file exists: `public/downloads/swopify-app.apk`
2. Verify the API endpoint: Visit `/api/app-version` in browser
3. Check browser console for errors
4. Ensure proper MIME type is set (should be automatic)

### Version mismatch

If the app shows wrong version:
1. Clear app cache
2. Verify `app-version` API returns correct version
3. Check `pubspec.yaml` version matches

## Automated Deployment (Recommended)

Create a GitHub Action to automate this:

```yaml
# .github/workflows/deploy-apk.yml
name: Deploy APK

on:
  push:
    paths:
      - 'swop2/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        
      - name: Build APK
        run: |
          cd swop2
          flutter build apk --release
          
      - name: Copy to web
        run: |
          cp swop2/build/app/outputs/apk/release/app-release.apk swopify-web/public/downloads/swopify-app.apk
          
      - name: Deploy
        run: |
          # Your deployment command here
```

## Quick Reference

```powershell
# Full deployment workflow
cd swop2
flutter build apk --release
cd ..\swopify-web
.\scripts\copy-apk.ps1
git add public/downloads/swopify-app.apk
git commit -m "Update APK"
git push
```
