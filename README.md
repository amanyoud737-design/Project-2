# SlideGenius Clean (Render-ready)

## Run locally
1) Install Node.js 18+  
2) In project folder:
   - `npm install`
   - Create `.env` (optional) with:
     - `ADMIN_PASSWORD=YourStrongPassword`
     - `SESSION_SECRET=some-long-random-string`
     - `PAYPAL_CLIENT_ID=your-paypal-sandbox-client-id`
     - `CURRENCY=USD`
   - `npm start`
3) Open: http://localhost:3000

## Deploy on Render
- Root Directory: `.`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/health`
- Add Env Vars:
  - ADMIN_PASSWORD
  - SESSION_SECRET
  - PAYPAL_CLIENT_ID
  - CURRENCY