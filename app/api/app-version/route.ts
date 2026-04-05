import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const apkPath = path.join(process.cwd(), 'public', 'downloads', 'swopify-app.apk')
    
    // Check if APK exists
    if (!fs.existsSync(apkPath)) {
      return NextResponse.json(
        { error: 'APK not found' },
        { status: 404 }
      )
    }

    // Get file stats
    const stats = fs.statSync(apkPath)
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2)

    // Version info - UPDATE THESE WHEN RELEASING NEW VERSION
    const versionNumber = '1.0.2'  // Must match pubspec.yaml version
    const versionCode = 2           // Must match pubspec.yaml build number
    const releaseNotes = 'Updated release of Swopify mobile application'
    const isCriticalUpdate = false  // Set to true for mandatory updates

    return NextResponse.json({
      version_number: versionNumber,
      version_code: versionCode,
      download_url: 'https://swopify.com/downloads/swopify-app.apk', // Full URL for mobile app
      release_notes: releaseNotes,
      is_critical_update: isCriticalUpdate,
      file_size: `${fileSizeMB} MB`,
      last_modified: stats.mtime.toISOString(),
      available: true,
      // Legacy fields for web compatibility
      version: versionNumber,
      downloadUrl: '/downloads/swopify-app.apk',
      fileSize: `${fileSizeMB} MB`,
      lastModified: stats.mtime.toISOString()
    })
  } catch (error) {
    console.error('Error checking APK:', error)
    return NextResponse.json(
      { error: 'Failed to check APK availability' },
      { status: 500 }
    )
  }
}
