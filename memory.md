# BMSIT Bazaar - Project Memory

This file serves as the single source of truth for the project's current state, environment configuration, completed tasks, and next steps.

---

## 🛠️ Environment Configuration
- **Local Dev Server**: Running in the background on **[http://localhost:3002](http://localhost:3002)**.
- **Port Constraints**:
  - **Port 3000**: Occupied by `SteamDaddy`.
  - **Port 3001**: Occupied by `Docker` (`com.docker.backend`).
  - **Port 3002**: Configured for the React application in [.env](file:///c:/Users/admin/.gemini/antigravity/scratch/Bmsitbazaar/.env) via `PORT=3002` to avoid conflicts.

---

## 📁 Project Architecture & Components
- **React Frontend (`src/`)**:
  - **Pages**: [Home.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Bmsitbazaar/src/pages/Home.js), [Marketplace.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Bmsitbazaar/src/pages/Marketplace.js), [AdminDashboard.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Bmsitbazaar/src/pages/AdminDashboard.js), [PostAd.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Bmsitbazaar/src/pages/PostAd.js), [Messages.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Bmsitbazaar/src/pages/Messages.js), [ProductDetail.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Bmsitbazaar/src/pages/ProductDetail.js), [Auth.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Bmsitbazaar/src/pages/Auth.js), [MyAds.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Bmsitbazaar/src/pages/MyAds.js).
  - **Components**: [StitchNav.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Bmsitbazaar/src/components/StitchNav.js), [CyberBackground.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Bmsitbazaar/src/components/CyberBackground.js), buttons, cards, etc.
- **Static Wireframes / Stitch Screens (`stitch_html/`)**:
  - Contains 14 screens including [landing_page.html](file:///c:/Users/admin/.gemini/antigravity/scratch/Bmsitbazaar/stitch_html/landing_page.html), [electronics_category.html](file:///c:/Users/admin/.gemini/antigravity/scratch/Bmsitbazaar/stitch_html/electronics_category.html), [marketplace.html](file:///c:/Users/admin/.gemini/antigravity/scratch/Bmsitbazaar/stitch_html/marketplace.html), [post_ad.html](file:///c:/Users/admin/.gemini/antigravity/scratch/Bmsitbazaar/stitch_html/post_ad.html), etc.

---

## ✅ Completed Tasks
- [x] Investigate why `npm start` failed and localhost was not loading (Port 3000/3001 conflicts).
- [x] Configure `.env` to run on `PORT=3002` to resolve conflicts.
- [x] Enforce exactly 3 photos upload validation in [PostAd.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Bmsitbazaar/src/pages/PostAd.js).
- [x] Add "Product Age" selection field in [PostAd.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Bmsitbazaar/src/pages/PostAd.js).
- [x] Integrate Cloudinary video upload for 1 verification video in [PostAd.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Bmsitbazaar/src/pages/PostAd.js).
- [x] Implement dynamic tiered platform unlock fees (Free, ₹20, ₹30, ₹40) based on listing price in [ProductDetail.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Bmsitbazaar/src/pages/ProductDetail.js).
- [x] Render product age and verification video streaming in [AdminDashboard.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Bmsitbazaar/src/pages/AdminDashboard.js) for moderators.
- [x] Display product age and verification video player in [ProductDetail.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Bmsitbazaar/src/pages/ProductDetail.js).
- [x] Implement client-side 5-day price decay warnings and price editing in [MyAds.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Bmsitbazaar/src/pages/MyAds.js).
- [x] Implement search query logging to Firestore `wishlist` collection when zero results are found in [Marketplace.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Bmsitbazaar/src/pages/Marketplace.js).
- [x] Calculate Haversine distance between buyer, seller, and BMSIT college in [ProductDetail.js](file:///c:/Users/admin/.gemini/antigravity/scratch/Bmsitbazaar/src/pages/ProductDetail.js).
- [x] Toggle doorstep delivery option dynamically based on the 5km radius check.
- [x] Dynamically add the delivery fee (₹20) to Razorpay payment total when checkbox is checked.
- [x] Update UI pricing elements and apply custom theme accent styling to the delivery checkbox.

---

## 📋 What Has to Be Done (Next Steps)
- [ ] Verify Razorpay credential routing in production build.
- [ ] Deploy updated project to Firebase Hosting.
