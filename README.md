Here’s a concise README for your project:

---

# Eternal Quill

**Eternal Quill** is a web application built using React and Firebase, designed for writers and readers to connect and share literary works. The project includes features such as user authentication, real-time database interaction, and storage management.

## Features

- **User Authentication:** Secure login and signup using Firebase Authentication.
- **Real-Time Database:** Manage and store user-generated content with Firestore.
- **Responsive UI:** Designed to work seamlessly across devices.
- **Firebase Hosting:** Deployed on Firebase for fast and reliable access.

## Setup

### Prerequisites

- Node.js (v22.3.0 recommended)
- Firebase CLI installed globally

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/i183x/eternal-quill-pm.git
   cd eternal-quill-pm
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Firebase configuration:
   ```env
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

4. Start the development server:
   ```bash
   npm start
   ```

### Deployment

The project is deployed using Firebase Hosting. To deploy, run:

```bash
npm run build
firebase deploy --only hosting --token="${{ secrets.FIREBASE_TOKEN_CI_AUTH }}"
```

## License

This project is licensed under the MIT License.

---

This README gives a quick overview of your project, with instructions on how to set it up and deploy it. Let me know if you need any further adjustments!
