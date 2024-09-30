# Eternal Quill

<!--![Eternal Quill Logo](./assets/images/logo.svg)-->

**Eternal Quill** is a dynamic web application built with React and Firebase, designed to connect writers and readers. It offers a platform for users to share, discover, and engage with literary works through features like user authentication, real-time content management, administrative dashboards, competitions, and more.

---
## Getting Started

To get a quick overview and start using **Eternal Quill**, follow the setup instructions above. Whether you're a developer looking to contribute or a user eager to explore literary works, **Eternal Quill** offers a seamless and engaging experience.

---
## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Setup](#setup)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Features

### User Features

- **User Authentication:**
  - Secure sign-up and login using Firebase Authentication.
  - Password reset and email verification.

- **User Profiles:**
  - Create and edit profiles with bio and profile picture.
  - Follow other users, view followers and following lists.

- **Posts and Content:**
  - Create, edit, and delete posts.
  - Rich text editor for writing literary works.
  - Real-time updates using Firestore.

- **Competitions:**
  - Participate in writing competitions.
  - View competition details and register for competitions.
  - View competition winners and submissions.

- **Notifications:**
  - Receive real-time notifications for various activities.
  - Manage notification preferences.

- **Responsive UI:**
  - Optimized for desktop and mobile devices.
  - Intuitive navigation and user-friendly design.

### Admin Features

- **Admin Dashboard:**
  - Centralized hub for managing the platform.

- **User Management:**
  - View, edit, and delete user accounts.
  - Assign roles to users.

- **Content Moderation:**
  - Review and manage user-generated content.
  - Remove inappropriate posts or comments.

- **Competitions Management:**
  - Create, edit, and delete competitions.
  - Manage competition submissions and winners.

- **Analytics:**
  - Monitor platform usage and user engagement.
  - View statistical data and reports.

- **Notifications Management:**
  - Send bulk notifications to users.
  - Manage notification templates.

- **Settings:**
  - Configure platform settings and preferences.
  - Manage site-wide configurations.

- **Security Logs:**
  - Monitor security-related events and activities.
  - Audit user actions and access.

---

## Technologies Used

- **Frontend:**
  - [React](https://reactjs.org/) - JavaScript library for building user interfaces.
  - [React Router](https://reactrouter.com/) - Declarative routing for React.
  - [CSS Modules](https://github.com/css-modules/css-modules) - Scoped CSS for components.

- **Backend:**
  - [Firebase Firestore](https://firebase.google.com/docs/firestore) - NoSQL real-time database.
  - [Firebase Authentication](https://firebase.google.com/docs/auth) - User authentication and management.
  - [Firebase Storage](https://firebase.google.com/docs/storage) - File storage for user-uploaded content.

- **Deployment:**
  - [Firebase Hosting](https://firebase.google.com/docs/hosting) - Deploying web applications.

- **Other Tools:**
  - [ESLint](https://eslint.org/) - Linting for JavaScript and JSX.
  - [Prettier](https://prettier.io/) - Code formatting.
  - [React Toastify](https://fkhadra.github.io/react-toastify/) - Notification system.

---

## Project Structure

```
src/
├── App.css
├── App.js
├── assets
│   └── images
│       ├── dark-background.png
│       ├── light-background.png
│       └── logo.svg
├── components
│   ├── Admin
│   │   ├── AdminDashboard
│   │   │   ├── AdminDashboard.css
│   │   │   └── AdminDashboard.js
│   │   ├── Analytics
│   │   │   ├── Analytics.css
│   │   │   └── Analytics.js
│   │   ├── CompetitionsAdmin
│   │   │   ├── Competitions.css
│   │   │   └── Competitions.js
│   │   ├── ContentModeration
│   │   │   ├── ContentModeration.css
│   │   │   └── ContentModeration.js
│   │   ├── NotificationsAdmin
│   │   │   ├── NotificationsAdmin.css
│   │   │   └── NotificationsAdmin.js
│   │   ├── SecurityLogs
│   │   │   ├── SecurityLogs.css
│   │   │   └── SecurityLogs.js
│   │   ├── Settings
│   │   │   ├── Settings.css
│   │   │   └── Settings.js
│   │   └── UserManagement
│   │       ├── UserManagement.css
│   │       └── UserManagement.js
│   ├── Auth
│   │   ├── Auth.css
│   │   ├── Auth.js
│   │   ├── DemoLogin.js
│   │   ├── LoginModal.css
│   │   └── LoginModal.js
│   ├── Competitions
│   │   ├── CompetitionDetailPage.css
│   │   ├── CompetitionDetailPage.js
│   │   ├── CompetitionPage.css
│   │   ├── CompetitionPage.js
│   │   └── RegistrationPage.css
│   │   └── RegistrationPage.js
│   ├── Feed
│   │   ├── Feed.css
│   │   └── Feed.js
│   ├── Judges
│   │   ├── Judges.css
│   │   └── Judges.js
│   ├── Notifications
│   │   ├── Notifications.css
│   │   └── Notifications.js
│   ├── Posts
│   │   ├── Post.css
│   │   └── Post.js
│   ├── Profile
│   │   ├── Modal.css
│   │   ├── Profile.css
│   │   └── Profile.js
│   ├── Terms
│   │   ├── Terms.css
│   │   └── Terms.js
│   ├── Users
│   │   ├── Users.css
│   │   └── Users.js
│   ├── Write
│   │   ├── Write.css
│   │   └── Write.js
│   ├── common
│   │   ├── Modals
│   │   ├── Navbar
│   │   │   ├── Navbar.css
│   │   │   └── Navbar.js
│   │   ├── NotFound
│   │   │   ├── NotFound.css
│   │   │   └── NotFound.js
│   │   └── PrivateRoute
│   │       └── PrivateRoute.js
│   ├── contexts
│   │   ├── ProfileContext.js
│   │   └── authContext.js
│   └── styles
│       └── hackerAdminDashboard.css
├── firebase.js
├── hooks
├── index.css
├── index.js
├── logo.svg
├── reportWebVitals.js
├── services
│   ├── imageCompressionService.js
│   ├── notificationsService.js
│   └── workerForImageCompressionService.js
├── setupTests.js
└── utils
```

### Explanation of Key Directories and Files

- **assets/**: Contains static assets like images and logos.
- **components/**: Houses all React components, organized by feature.
  - **Admin/**: Contains components related to admin functionalities such as dashboard, user management, analytics, etc.
  - **Auth/**: Handles user authentication components including login/signup forms and modals.
  - **Competitions/**: Manages competition-related components like competition pages and registration forms.
  - **Feed/**: Displays the main content feed for users.
  - **Judges/**: Manages judge-related functionalities.
  - **Notifications/**: Handles user notifications.
  - **Posts/**: Manages user posts.
  - **Profile/**: Handles user profile functionalities.
  - **Terms/**: Displays terms and conditions.
  - **Users/**: Manages user listings.
  - **Write/**: Enables users to create new posts or content.
  - **common/**: Contains reusable components like Navbar, NotFound, and PrivateRoute.
- **contexts/**: Contains React Contexts for global state management.
- **services/**: Contains utility services like image compression and notifications.
- **styles/**: Contains additional CSS styles.

---

## Setup

### Prerequisites

- **Node.js:** Ensure you have Node.js installed. [Download Node.js](https://nodejs.org/)
- **Firebase Account:** Set up a Firebase account and create a project. [Firebase](https://firebase.google.com/)

### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/i183x/eternal-quill-pm.git
   cd eternal-quill-pm
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

### Environment Variables

Create a `.env` file in the root directory of the project with your Firebase configuration. Ensure this file is **not** committed to version control for security reasons.

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
REACT_APP_DEMO_EMAIL=your-demo-account-email-id
REACT_APP_DEMO_PASSWORD=password
```

**Note:** Replace the placeholder values with your actual Firebase project configuration. You can find these in your Firebase project settings.

---

## Running the Application

To start the development server:

```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:3000`.

---

## Testing

If you have written tests for your application, you can run them using:

```bash
npm test
# or
yarn test
```

**Note:** Ensure that your testing configurations are correctly set up in `setupTests.js` and other relevant files.

---

## Deployment

The project is set up to be deployed using Firebase Hosting. Follow these steps to deploy your application:

1. **Build the Application:**

   ```bash
   npm run build
   # or
   yarn build
   ```

   This will create an optimized production build in the `build` directory.

2. **Install Firebase CLI:**

   If you haven't installed Firebase CLI yet, install it globally:

   ```bash
   npm install -g firebase-tools
   ```

3. **Login to Firebase:**

   ```bash
   firebase login
   ```

4. **Initialize Firebase in Your Project:**

   ```bash
   firebase init
   ```

   - Select **Hosting**.
   - Choose your Firebase project.
   - Set `build` as the public directory.
   - Configure as a single-page app by answering `Yes` to "Configure as a single-page app (rewrite all urls to /index.html)?"
   - Choose whether to set up automatic builds and deploys with GitHub.

5. **Deploy to Firebase Hosting:**

   ```bash
   firebase deploy --only hosting
   ```

   **Note:** If you have set up a CI/CD pipeline with a Firebase token, ensure that it's correctly configured. Replace the deployment command in your CI configuration accordingly.

---

## Contributing

Contributions are welcome! Please follow these steps to contribute to **Eternal Quill**:

1. **Fork the Repository:**

   Click the **Fork** button at the top-right corner of the repository to create a copy in your GitHub account.

2. **Clone Your Fork:**

   ```bash
   git clone https://github.com/your-username/eternal-quill-pm.git
   cd eternal-quill-pm
   ```

3. **Create a New Branch:**

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make Your Changes:**

   Implement your feature or bug fix.

5. **Commit Your Changes:**

   ```bash
   git commit -m "Add feature: your feature description"
   ```

6. **Push to Your Fork:**

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request:**

   Navigate to the original repository and click **New Pull Request**. Provide a clear description of your changes.

### Guidelines

- **Code Quality:**
  - Follow the existing code style and conventions.
  - Ensure your code passes all linters and tests.

- **Commit Messages:**
  - Write clear and concise commit messages.

- **Documentation:**
  - Document any new features or changes as necessary.

- **Testing:**
  - Ensure that your changes do not break existing functionalities.
  - Add tests for new features if applicable.

---

## License

This project is licensed under the [MIT License](LICENSE) currently.

---

## Contact

For any inquiries or feedback, please contact:

- **Your Name**
- **Email:** purwarkevin@gmail.com
- **GitHub:** [i183x](https://github.com/i183x)
- **LinkedIn:** [i183x](https://linkedin.com/in/i183x)

---

## Acknowledgements

- Inspired by various literary platforms aiming to bridge the gap between writers and readers.
- Powered by [Firebase](https://firebase.google.com/) for seamless backend integrations.

---
