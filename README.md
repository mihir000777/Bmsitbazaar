# 🎓 BMSIT Bazaar

An exclusive, secure peer-to-peer student marketplace built specifically for the **BMS Institute of Technology and Management (BMSIT)** community. 

BMSIT Bazaar enables students to buy, sell, and request deliveries of study materials, electronics, and hosteling gear safely within the campus network.

---

## ✨ Features

### 🔒 Campus-Only Verification
* **Restricted Domain Login:** Restricts access exclusively to students holding institutional `@bmsit.in` email addresses.
* **Email Verification Link:** Utilizes Firebase email verification to ensure credentials are active before allowing buyers to browse or sellers to list.

### 🍱 Detailed & Serious Listings
* **3-Photo Constraint:** Sellers must upload exactly three product photos showing different angles to ensure listing quality.
* **1-Video Verification:** Requires a product verification video clip (up to 15MB) streamed via Cloudinary, giving buyers high trust and allowing admins to visually audit the product.
* **Product Age Field:** Captures how long the item has been in use.

### 💰 Tiered Platform Fee Model
* Contact details of the seller (Phone, Email, Direct WhatsApp chat link) are locked behind a platform fee.
* Fees are dynamically calculated based on the item price to keep it affordable for students:
  * Items under ₹100: **₹10**
  * Items from ₹100 to ₹500: **₹20**
  * Items from ₹500 to ₹1000: **₹30**
  * Items above ₹1000: **₹40**
* Payments are securely handled on the web via a **Razorpay** checkout integration.

### 🗓️ 5-Day Price Decay Warning
* Listings that remain unsold for more than 5 days trigger a **Price Decay Reminder** on the seller's dashboard.
* Banners prompt the seller to reduce their price to boost visibility, offering a quick-edit price drop prompt.

### 📊 Search Wishlist
* If a buyer searches for an item and receives 0 results, a debounced handler logs the search query to a `wishlist` collection. This allows sellers and moderators to know what products are currently in demand.

### 🚚 Geolocation Doorstep Delivery
* Features a doorstep delivery option (+₹20 delivery fee).
* Computes the Great-Circle distance (Haversine formula) between the buyer, the seller, and the BMSIT campus center (Latitude `13.13406`, Longitude `77.56844`).
* Delivery is enabled **only** if both coordinates are within a **5km radius** of the college.

---

## 🛠️ Technology Stack
* **Frontend:** React (hooks, context, router), TailwindCSS, Framer Motion, Lucide Icons.
* **Backend:** Firebase (Authentication, Firestore Database, Hosting).
* **Media Storage:** Cloudinary (for image & video uploads).
* **Payments:** Razorpay Checkout API.

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js** (v18+ recommended) installed.

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/mihir000777/Bmsitbazaar.git
cd Bmsitbazaar
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory (make sure it is ignored in `.gitignore`) and add your credentials:
```env
SKIP_PREFLIGHT_CHECK=true
PORT=3002

REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

REACT_APP_ADMIN_EMAIL=admin@bmsitbazaar.com
REACT_APP_ALLOWED_DOMAIN=bmsit.in
REACT_APP_CLOUDINARY_CLOUD=your_cloudinary_cloud_name
REACT_APP_CLOUDINARY_PRESET=your_cloudinary_upload_preset
REACT_APP_RAZORPAY_KEY=your_razorpay_key
```

### 4. Running the Dev Server
Start the development server:
```bash
npm start
```
The app will run locally on **[http://localhost:3002](http://localhost:3002)**.
