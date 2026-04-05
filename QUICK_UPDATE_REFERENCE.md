# Quick Update Reference Card

## When Does Update Prompt Show?

✅ **Shows when:**
- API version_code > App build number
- User hasn't dismissed this version
- 24 hours passed since last check (or critical update)

❌ **Doesn't show when:**
- API version_code = App build number (versions match)
- User clicked "Don't show again" for this version
- Less than 24 hours since last check (unless critical)

## Quick Release Checklist

```
□ Update pubspec.yaml version (e.g., 1.0.3+3)
□ Build APK: flutter build apk --release
□ Copy APK: .\scripts\copy-apk.ps1
□ Update API version_code in route.ts
□ Verify: .\scripts\verify-apk.ps1
□ Test locally
□ Deploy to production
```

## Version Numbers Explained

```yaml
version: 1.0.2+2
         │ │ │ │
         │ │ │ └─ Build number (MUST INCREMENT)
         │ │ └─── Patch (bug fixes)
         │ └───── Minor (new features)
         └─────── Major (breaking changes)
```

## Common Commands

```powershell
# Build APK
cd swop2
flutter build apk --release

# Copy to website
cd ..\swopify-web
.\scripts\copy-apk.ps1

# Verify setup
.\scripts\verify-apk.ps1

# Check API
curl https://swopify.com/api/app-version
```

## Files to Update

1. **swop2/pubspec.yaml** - App version
2. **swopify-web/app/api/app-version/route.ts** - API version

## Testing

| Test | API Code | App Code | Result |
|------|----------|----------|--------|
| Update available | 3 | 2 | Shows prompt ✓ |
| Up to date | 2 | 2 | No prompt ✓ |
| Critical update | 3 + critical=true | 2 | Cannot dismiss ✓ |

## Troubleshooting

**Prompt not showing?**
→ Check version codes, wait 24h, or clear app data

**Prompt showing when shouldn't?**
→ Verify version codes match exactly

**Download fails?**
→ Check APK exists and URL is correct

## Support Files

- **VERSION_UPDATE_GUIDE.md** - Detailed guide
- **APK_DEPLOYMENT_GUIDE.md** - Deployment instructions
- **AUTO_UPDATE_IMPLEMENTATION_SUMMARY.md** - Technical details
