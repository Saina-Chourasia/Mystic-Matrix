# 🔮 Google OAuth 2.0 Single-Admin Setup Guide

This guide details the complete configuration for Google OAuth 2.0 authentication in **MYSTIC MATRIX**. The system enforces **Strict Single-Admin Access** for Madam Hex, guaranteeing that only the designated Google account can access private shop inventory, demand forecasting, stock adjustments, and sales telemetry.

---

## 🧙‍♀️ Single-Admin Security Architecture

```
┌────────────────────────┐         ┌────────────────────────┐         ┌────────────────────────┐
│  Visitor / Admin       │         │  MYSTIC MATRIX Server  │         │  Google OAuth 2.0      │
│  (Browser)             │         │  (Port 5001)           │         │  (accounts.google.com) │
└──────────┬─────────────┘         └──────────┬─────────────┘         └──────────┬─────────────┘
           │                                  │                                  │
           │  1. Click "Continue with Google" │                                  │
           ├─────────────────────────────────>│                                  │
           │                                  │  2. Redirect to Google Auth URL  │
           │<─────────────────────────────────┼──────────────────────────────────┤
           │                                  │                                  │
           │  3. Select Google Account & Consent                                 │
           ├────────────────────────────────────────────────────────────────────>│
           │                                                                     │
           │  4. Authorization Code Redirect to /api/auth/google/callback        │
           │<────────────────────────────────────────────────────────────────────┤
           │                                  │                                  │
           │  5. GET /api/auth/google/callback?code=...                          │
           ├─────────────────────────────────>│                                  │
           │                                  │  6. Exchange Code for Tokens     │
           │                                  ├─────────────────────────────────>│
           │                                  │<─────────────────────────────────┤
           │                                  │  7. Fetch User Profile Info      │
           │                                  ├─────────────────────────────────>│
           │                                  │<─────────────────────────────────┤
           │                                  │                                  │
           │                                  │  8. Single-Admin Email Check:    │
           │                                  │     userInfo.email === ADMIN_EMAIL?
           │                                  │                                  │
           │  [MATCH]: Set Signed Session     │     [NO MATCH]: Deny Access      │
           │  HTTP-only Cookie & Redirect     │     Redirect with Error          │
           │  to /?tab=overview               │     to /?tab=login&error=...     │
           │<─────────────────────────────────┤<─────────────────────────────────┤
```

- **Strict Server-Side Authorization**: Authentication alone does not grant access. The verified Google email must match `ADMIN_EMAIL` (case-insensitive).
- **Zero Client Trust**: Unauthorized accounts are blocked on the backend with HTTP 403 and the exact alert:  
  `"Access Denied! You are not authorized to enter Madam Hex's magical shop."`
- **Tamper-Proof Sessions**: Sessions are secured via HMAC-SHA256 signed HTTP-only cookies (`mystic_admin_session`) with constant-time signature verification (`crypto.timingSafeEqual`).
- **Protected APIs**: Private endpoints (`/api/products`, `/api/sales`, `/api/forecasts`, `/api/recommendations`, `/api/analytics`) reject unauthenticated requests with HTTP 401.

---

## 📋 Step-by-Step Google Cloud Configuration

### Step 1: Create a Google Cloud Project

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown in the top navigation bar and select **New Project**.
3. Set the **Project Name** to `Mystic-Matrix-Apothecary` (or your preferred name).
4. Click **Create** and ensure the new project is selected in the top bar.

---

### Step 2: Configure the OAuth Consent Screen

1. In the left-hand navigation menu, go to **APIs & Services** &rarr; **OAuth consent screen**.
2. Select **User Type**:
   - **External** (standard for testing with personal `@gmail.com` accounts).
   - Click **Create**.
3. Fill in the **App Information**:
   - **App Name**: `Mystic Matrix`
   - **User support email**: Select your Google email.
   - **App logo**: (Optional) Use a witch hat or potion bottle logo.
4. Fill in **Developer contact information**:
   - **Email addresses**: Enter your email.
5. Click **Save and Continue**.
6. Under **Scopes**:
   - Click **Add or Remove Scopes**.
   - Select:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - Click **Update** &rarr; **Save and Continue**.
7. Under **Test Users** (*Crucial for External mode in "Testing" status*):
   - Click **+ Add Users**.
   - Enter your authorized Google email address (the exact email you will set as `ADMIN_EMAIL`).
   - Click **Save and Continue**.

---

### Step 3: Create OAuth 2.0 Web Client Credentials

1. Go to **APIs & Services** &rarr; **Credentials**.
2. Click **+ Create Credentials** at the top &rarr; select **OAuth client ID**.
3. In the form, configure:
   - **Application type**: `Web application`
   - **Name**: `Mystic Matrix Web Client`
4. Under **Authorized JavaScript origins**:
   - Click **+ Add URI**.
   - Enter: `http://localhost:5001`
   - *(When deployed to production, add your public domain, e.g., `https://mysticmatrix.yourdomain.com`)*
5. Under **Authorized redirect URIs**:
   - Click **+ Add URI**.
   - Enter: `http://localhost:5001/api/auth/google/callback`
   - *(When deployed to production, add `https://mysticmatrix.yourdomain.com/api/auth/google/callback`)*
6. Click **Create**.
7. A dialog will pop up showing:
   - **Client ID** (e.g., `1234567890-abcdefg123456.apps.googleusercontent.com`)
   - **Client Secret** (e.g., `GOCSPX-xxxxxxxxxxxxxxxxx`)
8. Copy both values.

---

## ⚙️ Environment Variables Configuration

Open or create the `.env` file in the root of the project:

```bash
# Server & Port
PORT=5001
NODE_ENV=production

# Single Authorized Admin Email
ADMIN_EMAIL=madam.hex@gmail.com

# Session Encryption Secret (Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SESSION_SECRET=mystic_hex_secret_key_super_secure_salt_9999

# Google OAuth 2.0 Credentials (From Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
```

> [!TIP]
> To authorize your own personal Google account, replace `ADMIN_EMAIL=madam.hex@gmail.com` with your exact Google email (e.g., `ADMIN_EMAIL=yourname@gmail.com`).

---

## 🧪 Testing and Verification

### 1. Test Admin Login Page
Navigate to `http://localhost:5001/?tab=login`. You will see:
- Heading: **"Welcome Back, Madam Hex!"**
- Subtitle: *"Your enchanted inventory is waiting for you."*
- Button: **"Continue with Google"** with the official Google logo.
- Supporting text: *"Secure access to your private magical shop."*
- Day/Night pixel-art landscape background and theme toggle.

### 2. Live Google Authentication Flow
1. Click **Continue with Google**.
2. Sign in with the Google account configured in `ADMIN_EMAIL`.
3. Google redirects back to `http://localhost:5001/api/auth/google/callback`.
4. The server validates your identity, sets the signed session cookie, and directs you to Madam Hex's private Overview dashboard.
5. In the sidebar, you will see your name, profile avatar, email, and the personalized greeting:  
   **"Good Morning, Madam Hex!"** (or afternoon/evening depending on the hour).

### 3. Verification of Access Denial
1. Sign out by clicking **Sign Out** in the sidebar.
2. Sign in with any Google account **different** from `ADMIN_EMAIL` (or use the built-in **Test Unauthorized User** button on the login screen).
3. The server immediately blocks access with:
   > ⛔ **Access Denied! You are not authorized to enter Madam Hex's magical shop.**
4. No private inventory, forecast, or sales data is leaked.

### 4. Running the Automated Test Suite
To verify the entire authentication pipeline from the command line:

```bash
node scripts/test_auth_dashboard.js
```

All 8 tests should output green checkmarks:
- ✔ Health check & config telemetry
- ✔ Unauthenticated requests rejected with HTTP 401
- ✔ Unauthorized Google accounts blocked with HTTP 403
- ✔ Authorized admin (`ADMIN_EMAIL`) authenticated with HTTP 200
- ✔ Session verification (`/api/auth/me`)
- ✔ Protected inventory & Holt-Winters forecasting APIs accessible
- ✔ Session revocation upon logout
- ✔ Immediate re-blocking after logout

