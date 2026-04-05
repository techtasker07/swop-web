# Version Update Guide - Automatic Update Prompts

This guide explains how the automatic update system works and how to release new versions.

## How It Works

### Version Comparison
The app automatically checks for updates by comparing version codes (build numbers):
- Current app version: Stored in `pubspec.yaml` as `version: X.Y.Z+BUILD`
- Latest version: Fetched from API at `https://swopify.com/api/app-version`
- If API version code > current version code → Update prompt shows
- If versions match → No prompt

### Update Check Timing
- Checks on app startup (dashboard load)
- Checks every 24 hours (configurable)
- Can be manually triggered from settings
- Critical updates bypass the 24-hour limit

### User Experience
1. **Non-Critical Updates**:
   - User sees update dialog with "Update Now", "Later", or "Don't show again" options
   - "Later" = Will show again after 24 hours
   - "Don't show again" = Won't show for this version (stored locally)

2. **Critical Updates**:
   - Dialog cannot be dismissed
   - Only "Update Now" button available
   - Forces user to update before continuing

## Releasing a New Version

### Step 1: Update Version Numbers

Update `swop2/pubspec.yaml`:
```yaml
version: 1.0.3+3  # Format: MAJOR.MINOR.PATCH+BUILD_NUMBER
```

Rules:
- Increment BUILD_NUMBER for every release (3, 4, 5, etc.)
- Update MAJOR.MINOR.PATCH following semantic versioning
- BUILD_NUMBER must always increase

### Step 2: Update API Endpoint

Edit `swopify-web/app/api/app-version/route.ts`:
```typescript
const versionNumber = '1.0.3'  // Must match pubspec.yaml
const versionCode = 3           // Must match pubspec.yaml build number
const releaseNotes = 'Bug fixes and performance improvements'
const isCriticalUpdate = false  // Set true for mandatory updates
```

### Step 3: Build the APK

```powershell
cd swop2
flutter clean
flutter build apk --release
```

### Step 4: Copy APK to Website

```powershell
cd ..\swopify-web
.\scripts\copy-apk.ps1
```

### Step 5: Verify Setup

```powershell
.\scripts\verify-apk.ps1
```

Should show:
- [OK] APK found
- [OK] API route exists
- [OK] Download page exists
- [OK] Source APK found

### Step 6: Test Locally

```powershell
# Start dev server
npm run dev

# Test API endpoint
# Visit: http://localhost:3000/api/app-version
# Should return JSON with correct version_code
```

### Step 7: Deploy

```powershell
git add public/downloads/swopify-app.apk
git add app/api/app-version/route.ts
git add swop2/pubspec.yaml
git commit -m "Release version 1.0.3"
git push
```

## Version Comparison Logic

The app uses build numbers (version codes) for comparison:

```dart
// Current app
version: 1.0.2+2  // Build number = 2

// API returns
version_code: 3   // Build number = 3

// Result: 3 > 2 → Update available ✓
```

### Example Scenarios

| Current Version | API Version | Result |
|----------------|-------------|---------|
| 1.0.0+1 | 1.0.0+1 | No update |
| 1.0.0+1 | 1.0.1+2 | Update available |
| 1.0.2+5 | 1.0.1+4 | No update (5 > 4) |
| 1.0.0+1 | 2.0.0+10 | Update available |

## Testing Update Prompts

### Test Update Available

1. Set API version code higher than app:
   ```typescript
   // In app/api/app-version/route.ts
   const versionCode = 999  // Much higher than current
   ```

2. Build and install app with lower version:
   ```yaml
   # In pubspec.yaml
   version: 1.0.0+1
   ```

3. Open app → Should see update dialog

### Test No Update

1. Set API version code same as app:
   ```typescript
   const versionCode = 2
   ```

2. App version:
   ```yaml
   version: 1.0.2+2
   ```

3. Open app → No update dialog

### Test Critical Update

1. Set critical flag:
   ```typescript
   const isCriticalUpdate = true
   ```

2. Open app → Dialog cannot be dismissed

## Troubleshooting

### Update prompt not showing

1. **Check version codes**:
   ```powershell
   # Check API
   curl https://swopify.com/api/app-version
   
   # Check app (in Flutter)
   flutter run --release
   # Look for debug logs: "Current app version: ..."
   ```

2. **Check 24-hour limit**:
   - Clear app data to reset timer
   - Or wait 24 hours
   - Or set critical update

3. **Check dismissed versions**:
   - User may have clicked "Don't show again"
   - Clear app data to reset
   - Or release new version with higher build number

### Update prompt showing when it shouldn't

1. **Verify version codes match**:
   - API version_code should equal app build number
   - Check both files carefully

2. **Clear app cache**:
   ```
   Settings → Apps → Swopify → Clear Data
   ```

### Download fails

1. **Check download URL**:
   ```typescript
   download_url: 'https://swopify.com/downloads/swopify-app.apk'
   ```
   Must be full URL, not relative path

2. **Verify APK exists**:
   ```powershell
   Test-Path swopify-web\public\downloads\swopify-app.apk
   ```

3. **Check file size**:
   - Should be 20-50 MB typically
   - If too small, APK may be corrupted

## Best Practices

### Version Numbering

- **Patch updates** (1.0.0 → 1.0.1): Bug fixes, minor changes
- **Minor updates** (1.0.0 → 1.1.0): New features, non-breaking
- **Major updates** (1.0.0 → 2.0.0): Breaking changes, major redesign

### Build Numbers

- Always increment by 1
- Never reuse a build number
- Keep sequential: 1, 2, 3, 4, 5...

### Critical Updates

Use sparingly for:
- Security vulnerabilities
- Data corruption fixes
- API breaking changes
- Critical bug fixes

Don't use for:
- New features
- UI improvements
- Performance enhancements

### Release Notes

Be clear and concise:
```typescript
// Good
const releaseNotes = 'Fixed login issue and improved performance'

// Bad
const releaseNotes = 'Various improvements and bug fixes'
```

### Testing

Always test before deploying:
1. Build APK
2. Install on test device
3. Verify app works
4. Update API version
5. Verify update prompt shows
6. Test update process
7. Deploy to production

## Quick Reference

```powershell
# Full release workflow
cd swop2

# 1. Update version in pubspec.yaml
# version: 1.0.3+3

# 2. Build APK
flutter clean
flutter build apk --release

# 3. Copy to website
cd ..\swopify-web
.\scripts\copy-apk.ps1

# 4. Update API version
# Edit: app/api/app-version/route.ts
# versionNumber = '1.0.3'
# versionCode = 3

# 5. Verify
.\scripts\verify-apk.ps1

# 6. Deploy
git add -A
git commit -m "Release v1.0.3"
git push
```

## API Response Format

```json
{
  "version_number": "1.0.3",
  "version_code": 3,
  "download_url": "https://swopify.com/downloads/swopify-app.apk",
  "release_notes": "Bug fixes and improvements",
  "is_critical_update": false,
  "file_size": "45.23 MB",
  "last_modified": "2026-04-05T10:30:00.000Z",
  "available": true
}
```

## Support

If issues persist:
1. Check APK_DEPLOYMENT_GUIDE.md
2. Run verify-apk.ps1 for diagnostics
3. Check app logs for version info
4. Verify API endpoint returns correct data
