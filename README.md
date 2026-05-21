# UPI Pay Log

A minimal Android app to log UPI payments. Scan QR, enter amount, pay — and 10 seconds later get a prefilled WhatsApp message to log it.

## Features

- Scan any UPI QR code
- Launch your preferred UPI app with payment pre-filled
- Auto-sends a WhatsApp message after payment for logging
- Transaction history stored locally (no backend, no accounts)
- Dark theme, minimal UI

## Install

1. Open the [Releases page](../../releases) on your phone's browser.
2. Tap the latest `upi-pay-log-vX.Y.Z.apk` to download.
3. When Android warns "unknown source", go to Settings and enable install permission for your browser.
4. Tap the downloaded APK to install.
5. Open the app and complete the one-time setup (pick UPI app + WhatsApp number).

## Building

All builds happen in GitHub Actions. Push a tag to trigger a build:

```sh
git tag v0.1.0
git push origin v0.1.0
```

The APK will appear in the Releases page.

## Limitations

- WhatsApp cannot auto-send — user must tap Send
- Item photos are stored locally only (not shared to WhatsApp)
- Debug-signed APK — Android shows "unknown developer" on install
- Transaction history is device-local; lost on reinstall
