# KithLy Environment Setup

## Frontend (.env)

`VITE_FIREBASE_API_KEY`: AIzaSyB99EfdtuD0Nf409ahdNV94br16paE0lzI

`VITE_FLUTTERWAVE_PUBLIC_KEY`: FLWPUBK_TEST-928852aa6e275d0de2c5829c6512fe83-X

## Backend Functions (Firebase Config)
Run these commands to set secrets in production:

`firebase functions:config:set flutterwave.hash="FLWSECK_TEST42672deaa627"`

`firebase functions:config:set twilio.sid="ACf0872380f668f679bdc505f3eee04336" twilio.token="cee0a46fe7ec77330ba7a72000d10157"`
