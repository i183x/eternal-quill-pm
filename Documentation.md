### **Phase 1: Project Initiation and Planning**

---

#### **1.1 Objective Definition**
- **Primary Objective:**  
  The primary goal is to build a robust community platform for readers and writers, with competitions serving as the unique selling proposition (USP) to attract users. The site should deliver a smooth and seamless user experience.

- **Target Audience:**  
  The platform targets students aged 16-23 and serious readers and writers. The focus is on engaging both casual readers and dedicated writers.

- **Success Criteria:**  
  The project's success will be measured by:
  - A visually appealing and intuitive UI.
  - Smooth competition participation processes.
  - Overall site performance, including fast loading times and seamless navigation.

---

#### **1.2 Scope Documentation**

- **Core Features:**
  1. **User Profiles:**  
     - Users can create and edit profiles with options to upload a profile picture, update bio, and manage personal information.
     - Features: Edit profile, change password, and sign out.

  2. **Competitions Section:**
     - **Public Competitions:**
       - Open to all users, with monthly paid competitions and regular free competitions.
       - Winners announced weekly, with top three write-ups archived.
     - **Private Competitions:**
       - Hosted by organizations, with optional participation fees.
       - Separate storage and management for each organization's competitions.
     - **Admin Controls:**  
       - Admin can create and manage competitions, set participation fees, and oversee entries.
       - Panelists can rate competition entries based on predefined criteria.

  3. **Social Features:**
     - **Follow System:**  
       - Users can follow other users to receive notifications about new write-ups.
     - **Infinite Scroll Feed:**  
       - Continuously loading content feed for a smooth browsing experience.

  4. **Content Creation:**
     - **Write-up Creation:**  
       - Rich text editor with essential features, ensuring it remains user-friendly and not overly complex.

  5. **Admin Console:**
     - Centralized dashboard for managing users, competitions, and content moderation.
     - Ability to create panelists and assign them to competitions for rating entries.

- **Competition Rules and Prizes:**
  - Private competitions may require entry fees as determined by the organizers.
  - Public competitions will have a monthly paid competition, managed by the admin.

- **User Roles:**
  - **Regular Users:** Can create profiles, participate in competitions, follow other users, and write posts.
  - **Admins:** Full control over competitions, user management, and content moderation.
  - **Panelists:** Limited role to rate competition entries based on predefined criteria.

- **Security & Privacy:**
  - Ensure users agree to the Terms & Conditions during sign-up.
  - Implement Firebase security rules to safeguard user data and competition integrity.

---

#### **1.3 Stakeholder Identification**

- **Key Stakeholders:**  
  - **You (Project Owner):** The sole decision-maker and primary stakeholder.

- **User Feedback Involvement:**
  - No need for beta testers or feedback loops during development; focus on delivering a polished final product.

---

#### **1.4 Project Planning**

- **Timeline:**  
  - No strict deadlines; the focus is on creating a high-quality user experience. We'll work in iterative phases, refining each aspect until it meets the desired standards.

- **Budget and Resources:**  
  - Backend is hosted on Firebase's free tier, so optimize database operations and avoid unnecessary API calls to stay within the limits.
  - The team consists of developers focusing on frontend, backend, and UI/UX, with a single project owner overseeing the entire process.

- **Technology Stack:**
  - **Frontend:**  
    - **React:** For building dynamic user interfaces with hooks and functional components.
    - **React Router:** For managing routing and navigation between pages.
    - **CSS:** Custom styles with a focus on responsive design to ensure compatibility across devices.

  - **Backend:**  
    - **Firebase:** For authentication, database management (Firestore), and hosting.
    - **Firebase Admin SDK:** For backend operations, including user management and competition handling.

  - **Programming Language:**  
    - **JavaScript (ES6+):** For both frontend and backend development.

- **Compliance and Legal Requirements:**  
  - No specific legal or compliance requirements, but ensure users agree to Terms & Conditions upon sign-up.

---

### **Phase 2: Design and Architecture**

---

#### **2.1 System Architecture Design**

In this phase, we'll focus on designing a scalable and efficient system architecture that leverages Firebase for backend management. The goal is to ensure that the architecture supports all the required features, is secure, and can handle the expected load.

**Tasks:**

1. **Define the System Architecture:**
   - **Frontend:** 
     - We’ll use React as the frontend framework with functional components and hooks.
     - React Router will handle navigation across different pages (e.g., Home, Profile, Competitions).
     - Tailwind CSS will be used for responsive design and ensuring a smooth, consistent user experience.

   - **Backend:**
     - **Firebase Authentication:** Manage user sign-up, login, and role assignments.
     - **Firestore Database:** 
       - Store user profiles, competition data (public and private), panelist ratings, and other relevant data.
       - Separate collections for public and private competitions.
     - **Firebase Functions:** 
       - Handle backend logic such as creating and managing competitions, user management, and content moderation.
     - **Firebase Hosting:** Deploy the frontend and ensure the application is accessible to users.

2. **Design Firestore Collections:**
   - **Users Collection:**
     - Store user information, including profile details, authentication info, and role (user, admin, panelist).
     - Structure: `users/{userId}` with fields for username, bio, profile picture URL, role, and more.

   - **Public Competitions Collection:**
     - Store details about public competitions, including entries, winners, and archive status.
     - Structure: `public_competitions/{competitionId}` with fields for competition name, start and end dates, entries (subcollection), and archived winners.

   - **Private Competitions Collection:**
     - Store details about private competitions, separated by organization.
     - Structure: `private_competitions/{organizationId}/{competitionId}` with similar fields to public competitions, including a unique access URL.

   - **Panelist Ratings Collection:**
     - Store ratings given by panelists for competition entries.
     - Structure: `ratings/{competitionId}/{entryId}` with fields for panelistId, criteria ratings, and average score.

   - **Admin Controls:**
     - Structure separate collections or documents to manage admin settings and configurations.

3. **Firebase Security Rules:**
   - Implement security rules to:
     - Restrict access to user data based on roles.
     - Ensure that only authorized users (admins) can create or delete competitions.
     - Protect competition data, ensuring that private competitions are only accessible to authorized participants.

4. **Design Data Flow:**
   - Map out how data will flow between the frontend and backend:
     - **User Actions:** Sign-up, login, create profile, follow other users, submit entries to competitions.
     - **Admin Actions:** Create competitions, manage users, moderate content.
     - **Panelist Actions:** Rate competition entries based on specific criteria.

5. **Plan for Scalability:**
   - Design the architecture to handle a growing number of users and competitions.
   - Use Firebase’s real-time capabilities to ensure that data is updated and available across the platform without performance issues.

---

### **Phase 2: Updated Database Design and UI/UX Details**

---

#### **2.2 Updated Database Design**

Based on your feedback, I’ve updated the database schema to include the additional fields for users, competitions, and features for writing and feed sections.

**1. Users Collection Schema:**
   - `userId (string)`: Unique identifier for each user.
   - `username (string)`: User’s chosen display name.
   - `email (string)`: User’s email address.
   - `phoneNumber (string)`: User’s phone number.
   - `bio (string)`: Short biography of the user.
   - `profilePictureURL (string)`: URL of the user’s profile picture.
   - `role (string)`: Role of the user (user, admin, panelist).
   - `following (array)`: List of userIds that this user is following.

**2. Public Competitions Collection Schema:**
   - `competitionId (string)`: Unique identifier for each competition.
   - `name (string)`: Name of the competition.
   - `description (string)`: Detailed description of what is expected in the write-up.
   - `rules (string)`: Rules for participation in the competition.
   - `startDate (timestamp)`: Start date and time of the competition.
   - `endDate (timestamp)`: End date and time of the competition.
   - `entries (subcollection)`: Stores individual entries for the competition.
   - `archivedWinners (array)`: List of top three entries after the competition ends.

**3. Private Competitions Collection Schema:**
   - Same as the public competitions schema, but with an additional field:
   - `organizationId (string)`: Identifier for the organization hosting the private competition.
   - `accessURL (string)`: Unique URL for accessing the private competition.

**4. Panelist Ratings Collection Schema:**
   - `ratingId (string)`: Unique identifier for each rating entry.
   - `panelistId (string)`: Identifier for the panelist providing the rating.
   - `competitionId (string)`: Identifier for the competition being rated.
   - `entryId (string)`: Identifier for the competition entry being rated.
   - `criteria (object)`: Object containing ratings for each criterion (e.g., creativity, content quality).

**5. Posts Collection Schema (Write Section):**
   - `postId (string)`: Unique identifier for each post.
   - `userId (string)`: Identifier for the user who created the post.
   - `title (string)`: Title of the post.
   - `content (string)`: Text content of the post (up to 20,000 characters).
   - `createdAt (timestamp)`: Timestamp when the post was created.
   - `likes (array)`: List of userIds who liked the post.
   - `comments (subcollection)`: Stores comments, with each comment having `commentId`, `userId` (of the commenter), and `content`.

---

#### **2.3 UI/UX Design - Additional Details**

Given the emphasis on writing and user engagement, I’ve refined the UI/UX design to cater to these needs:

**1. Write Section:**
   - **Create Post:**
     - Users will have a clean, simple interface to write and format their posts.
     - **Title Input:** A dedicated field for the post title.
     - **Text Editor:** A text-only editor with basic formatting (bold, italics, headings) to ensure readability and retention of the format after posting.
     - **Character Limit:** The editor should display a character count to help users stay within the 20,000 character limit.
     - **Save Draft Option:** Allow users to save drafts if they aren’t ready to publish immediately.

**2. Feed Section:**
   - **Posts Display:**
     - The feed will prioritize posts from followed users, showing content from the last week.
     - **Infinite Scroll:** After exhausting the followed users' posts, the feed will continue loading the most recent posts indefinitely.
     - **Post Interactions:**
       - **Like Button:** Allows users to like/unlike posts, with the like count updated in real-time.
       - **Comments:** Users can comment anonymously (displaying "Anonymous" on the frontend) while storing their userId in the backend.
       - **Share Button:** Generates a shareable link to the post, viewable without login.

**3. Users Section:**
   - **Display Recent Logins:**
     - Show usernames and profile pictures of the last 50 logged-in users.
   - **Profile Navigation:**
     - Clicking on a username will lead to the user's profile page.
     - **Follow/Unfollow:** Allow users to follow or unfollow others directly from the profile.
     - **Read Posts:** Display the user’s recent posts on their profile, allowing others to engage with the content.

---
