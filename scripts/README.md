# Deployment Scripts

This folder contains scripts to help with APK deployment and verification.

## Available Scripts

### copy-apk.ps1
Copies the latest built APK from the Flutter project to the website's public folder.

```powershell
.\scripts\copy-apk.ps1
```

**What it does:**
- Copies `swop2/build/app/outputs/apk/release/app-release.apk` to `public/downloads/swopify-app.apk`
- Creates the downloads directory if it doesn't exist
- Shows file size and modification date

### verify-apk.ps1
Verifies that the APK deployment setup is correct.

```powershell
.\scripts\verify-apk.ps1
```

**What it checks:**
- APK exists in public folder
- API route exists
- Download page exists
- Source APK exists and compares timestamps
- File sizes are reasonable

## Typical Workflow

1. Build the Flutter app:
   ```powershell
   cd swop2
   flutter build apk --release
   cd ..\swopify-web
   ```

2. Copy the APK:
   ```powershell
   .\scripts\copy-apk.ps1
   ```

3. Verify everything:
   ```powershell
   .\scripts\verify-apk.ps1
   ```

4. Commit and deploy:
   ```powershell
   git add public/downloads/swopify-app.apk
   git commit -m "Update APK to version X.X.X"
   git push
   ```

## Troubleshooting

If `copy-apk.ps1` fails:
- Make sure you've built the Flutter app first
- Check that the path to swop2 is correct (should be `../swop2`)

If `verify-apk.ps1` shows warnings:
- Follow the suggested commands in the output
- Check the APK_DEPLOYMENT_GUIDE.md for detailed instructions
