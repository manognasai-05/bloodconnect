# BloodConnect – Online Blood Donor Management System

BloodConnect is a comprehensive, production-grade **Full Stack MERN** (MongoDB, Express.js, React.js, Node.js) web platform developed for college training and final-year academic project presentation. It connects voluntary blood donors with patients, emergency care units, and clinical teams facing critical blood shortages.

---

## 1. Project Objective

The primary objective of BloodConnect is to streamline blood donor discovery and request coordination. Through geolocation filtering, ABO/Rh compatibility analysis, and real-time donor availability tracking, BloodConnect minimizes response times during surgical and traumatic medical emergencies.

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React icons, Canvas Confetti.
- **Backend**: Node.js, Express.js REST API with modular controllers, routes, and middleware.
- **Database**: MongoDB with Mongoose schemas, featuring a built-in persistent document store fallback pre-seeded with sample demonstration data so the project executes immediately out-of-the-box.
- **Security & Authentication**: JSON Web Tokens (JWT) and salted password hashing with bcryptjs.
- **Client Networking**: Axios with automatic Bearer token interceptors.
- **Digital Identification**: QRCode library generating authentic, scannable digital donor credentials.

---

## 3. User Roles & Capabilities

### A. Volunteer Donor
- User registration and JWT-authenticated sign in.
- Complete donor clinical profile (Blood Group, Age, Gender, City, Contact, Bio).
- Real-time **Availability Tracker** (Available, In Cooldown / Recently Donated, Unavailable).
- **56-Day Cooldown Calculator**: Automatic recovery interval tracker following clinical whole blood guidelines.
- View matching blood requests in their city or blood group.
- 1-click accept or decline request calls.
- Scannable **Digital QR Donor ID Badge** with verification hash and export options.
- Complete donation history log and digital certificates of appreciation.

### B. Blood Requester
- Register and login as a patient advocate or hospital coordinator.
- Search registered donors with live blood group, city, and availability filters.
- **Smart Donor Matching**: Highlights compatible ABO/Rh donors for specific patient blood types.
- Submit blood requests with urgency levels: **Emergency (<4h)**, **Urgent (<24h)**, or **Normal**.
- Track request lifecycle from *Pending* → *Accepted* → *Crossmatching* → *Fulfilled*.
- Privacy-protected donor contact requests with mandatory verification consent.

### C. System Administrator
- Role-guarded administrative console (`/admin-dashboard`).
- View total registered accounts, active requests, and collected blood units.
- **Blood Group Distribution Analytics**: Visual distribution across all 8 blood groups.
- User management directory (activate, suspend, or delete accounts).
- **Donor Verification Queue**: Inspect and grant verified badges to donors.
- **Database Re-Seed Tool**: 1-click restore to sample demonstration records.

---

## 4. Main Pages (14 Core Views)

1. **Home Page (`/`)**: Hero section, live platform statistics strip, 3-step workflow, blood group directory, and safety notice.
2. **About Us (`/#about`)**: Mission, clinical laboratory imagery, safety ethics, and 3-member college project team breakdown.
3. **Login Page (`/#login`)**: Secure sign-in with 1-click demo buttons for Admin, Donor, and Requester.
4. **Registration Page (`/#register`)**: Role selector (Donor or Requester) with medical profile inputs.
5. **Donor Dashboard (`/#donor-dashboard`)**: Real-time availability tracker, 56-day cooldown progress, matched request queue, and QR badge shortcut.
6. **Requester Dashboard (`/#requester-dashboard`)**: Active blood request tracker, new request button, and nearby local donors.
7. **Admin Dashboard (`/#admin-dashboard`)**: Comprehensive analytics, user account manager, and donor verification queue.
8. **Donor Profile & Medical Registry (`/#profile`)**: Edit profile, availability, and view official digital QR credential.
9. **Search Donors (`/#donors`)**: Filter by 8 blood groups, city, and availability, with smart recipient compatibility evaluation.
10. **Blood Request Form (`/#request-blood`)**: Post hospital blood requirements with urgency levels and live matched donor counter.
11. **Request Status Page (`/#requests`)**: Track request lifecycle with interactive 4-step progress timeline.
12. **Donation History Page (`/#history`)**: Historical transfusion records with celebratory certificate modal generator.
13. **User Profile Settings (`/#profile`)**: Account credentials, password change, and QR download.
14. **Contact & Helpline Page (`/#contact`)**: 24/7 National Emergency Blood Helpline, affiliated regional centers, and FAQ accordion.

---

## 5. Unique Features

1. **Smart Donor Matching**: Automatic ABO/Rh erythrocyte compatibility evaluation. Recognizes O- as universal red cell donor and AB+ as universal recipient.
2. **Emergency Blood Broadcast**: Requests marked "Emergency" highlight in high-visibility crimson, display in the global top banner, and trigger in-app notifications.
3. **Donor Availability & Cooldown Tracker**: Calculates days remaining from the donor's last donation date against the 56-day clinical interval.
4. **QR Code Donor Identification**: Generates authentic, scannable QR codes containing donor ID, blood group, verification status, and timestamp.
5. **In-App Notification Center**: Real-time notification bell with unread badges, timestamps, and direct request routing.
6. **Certificate of Appreciation Generator**: Generates verified donor certificates with confetti celebratory effects.

---

## 6. Pre-Seeded Demonstration Accounts

For ease of testing, grading, and presentation, the system is pre-seeded with sample demonstration accounts (passwords can also be filled with 1 click on the Login Page):

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@bloodconnect.org` | `Admin@123` | Full access to verification, user management & analytics |
| **Volunteer Donor** | `marcus.v@donor.org` | `Donor@123` | Dr. Marcus Vance, O- Universal Donor, New York |
| **Volunteer Donor** | `sarah.j@donor.org` | `Donor@123` | Sarah Jenkins, A+ Donor, Chicago |
| **Blood Requester** | `requester@bloodconnect.org` | `Requester@123` | Rachel Green, New York |

---

## 7. Local Installation & Execution Guide

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm or yarn

### Step-by-Step Setup

1. **Clone or navigate to the project directory**:
   ```bash
   cd bloodconnect
   ```

2. **Install all dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *Note: If `MONGODB_URI` is left blank, BloodConnect automatically activates its resilient local document store pre-populated with sample records.*

4. **Start the Full-Stack Application**:
   ```bash
   npm run dev
   ```
   The unified Express + Vite server will start on port `3000`:
   ```
   http://localhost:3000
   ```

5. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

---

## 8. REST API Documentation

### Authentication APIs
- `POST /api/auth/register`: Create user account & linked donor profile
- `POST /api/auth/login`: Authenticate email/password and return JWT
- `GET /api/auth/me`: Retrieve logged-in user and donor profile
- `PUT /api/auth/profile`: Update user name, phone, city, or password

### Donor APIs
- `GET /api/donors`: List donors (filter by `bloodGroup`, `city`, `availability`, `search`, `recipientBloodGroup`)
- `GET /api/donors/:id`: Get detailed donor profile
- `POST /api/donors/profile`: Create donor profile
- `PUT /api/donors/profile`: Update donor profile
- `PUT /api/donors/availability`: Toggle availability status

### Blood Request APIs
- `POST /api/requests`: Submit blood requirement request
- `GET /api/requests`: Get requests with filters (`status`, `urgency`, `city`, `myRequests`)
- `GET /api/requests/:id`: Get request by ID with matching donors preview
- `PUT /api/requests/:id/status`: Update request status (`Pending`, `Accepted`, `Fulfilled`, `Cancelled`)
- `POST /api/requests/:id/respond`: Donor accepts or declines request

### Admin APIs (Guarded by JWT + Admin Role)
- `GET /api/admin/dashboard`: Platform analytics and metrics
- `GET /api/admin/users`: List all users with donor metadata
- `PUT /api/admin/donors/:id/verify`: Toggle donor verified badge
- `PUT /api/admin/users/:id/status`: Suspend or activate user account
- `DELETE /api/admin/users/:id`: Delete user account

### History & Notifications
- `GET /api/donations`: Retrieve completed donation history records
- `POST /api/donations`: Log completed donation
- `GET /api/notifications`: Retrieve user notifications
- `PUT /api/notifications/:id/read`: Mark notification as read
- `PUT /api/notifications/read-all`: Mark all notifications as read

---

## 9. Important Clinical Safety Notice

> **Medical Disclaimer**: BloodConnect is an information discovery and request coordination platform developed for academic demonstration. It does not perform medical diagnosis, laboratory testing, or guarantee blood-group compatibility. All blood typing, crossmatching, donor clinical suitability screening, infectious disease testing, and collection procedures must be carried out by qualified medical professionals and certified blood banking facilities.
