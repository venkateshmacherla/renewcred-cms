# RenewCred CMS

RenewCred CMS is a full-stack content management system built for the Frontend Engineering Assignment.

The project has three main parts:

- An Admin CMS for managing website content
- An Express.js API for authentication and content management
- A public Next.js website that loads published content dynamically

The main idea behind the project was to keep website content out of the frontend code. An admin can create, edit, publish, or delete pages from the CMS, and the public website retrieves the latest published content through the backend APIs.

---

## Tech Stack

### Frontend

- Next.js
- React
- Redux Toolkit
- CSS

### Backend

- Node.js
- Express.js
- JWT
- bcrypt

### Database

- MongoDB Atlas
- Mongoose

### Infrastructure

- Docker
- Docker Compose

---

## Project Structure

```text
renewcred-cms/
├── admin-frontend/
├── public-frontend/
├── backend/
├── docker-compose.yml
└── README.md
```

### `admin-frontend`

The admin application is used to manage website content.

It includes:

- Admin login and logout
- Protected admin routes
- Dashboard
- Page management
- Create, edit, and delete pages
- Draft and published status
- Multiple content block types
- Responsive layout

### `public-frontend`

The public Next.js application displays content created from the CMS.

It does not depend on hardcoded page content. Published pages are fetched from the backend and rendered dynamically using their slug.

For example:

```text
/
/services
/loan-comparison
/about-renewcred
/developer-docs
```

If a new page is created and published from the CMS, it can also be accessed dynamically without creating a separate Next.js route for that page.

### `backend`

The Express.js backend handles:

- Admin authentication
- JWT authorization
- Page CRUD operations
- Draft and published content
- Public content APIs
- MongoDB database operations

---

## Architecture

The project is separated into three applications:

```text
                 MongoDB Atlas
                      ↑
                      │
Admin Frontend → Express API ← Public Frontend
    :3000           :5000          :3001
```

The admin and public applications never connect directly to MongoDB. All data is handled through the Express API.

The content flow is:

```text
Admin CMS
   ↓
Express API
   ↓
MongoDB
   ↓
Public API
   ↓
Public Website
```

This keeps content management, backend logic, and public presentation separated.

---

## Content Management

Instead of using only fixed fields such as title and description, pages are built using reusable content sections.

Currently supported section types are:

- Heading
- Paragraph
- List
- Nested list
- Table
- Mathematical equation
- Code

A page can contain any combination of these sections.

For example:

```text
Page
├── Heading
├── Paragraph
├── List
├── Table
└── Equation
```

Another page could contain:

```text
Page
├── Heading
├── Paragraph
├── Code
└── Nested List
```

I chose this block-based structure because different pages may need different types of content.

It also makes the CMS easier to extend later. A new block type can be added without creating a completely different page model.

---

## Dynamic Public Pages

The public frontend retrieves published pages from the backend.

Public endpoints include:

```text
GET /api/v1/public/pages
GET /api/v1/public/pages/:slug
```

For example, if an admin creates:

```text
Title: Contact Us
Slug: contact-us
Status: Published
```

the public page becomes available at:

```text
/contact-us
```

There is no need to create a separate frontend page manually for every CMS page.

Published pages are also used to build the public navigation dynamically.

The main pages stay visible in the navbar, while additional pages are placed under the `More` menu so the navigation does not become overcrowded.

---

## Authentication

The admin CMS is protected by authentication.

The basic flow is:

```text
Admin Login
    ↓
Backend validates credentials
    ↓
JWT is generated
    ↓
Admin accesses protected CMS pages
```

Protected backend routes require authentication.

Logout clears the admin session and redirects the user back to the login page.

---

## State Management

Redux Toolkit is used where shared application state is useful, mainly for authentication-related state.

I kept temporary UI state inside individual components where possible. This includes things such as form values, validation messages, loading states, and editor interactions.

I chose this approach instead of putting all application state into Redux because component-specific state does not need to be globally available.

---

## Environment Variables

Real environment files are not committed to the repository.

Use the provided `.env.example` files as templates.

### Backend

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret

ADMIN_NAME=RenewCred Admin
ADMIN_EMAIL=admin@renewcred.com
ADMIN_PASSWORD=your_admin_password
```

### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Do not commit real database credentials, JWT secrets, or private passwords.

---

## Running with Docker

### Prerequisites

Make sure these are installed:

- Git
- Docker Desktop

Clone the repository:

```bash
git clone https://github.com/venkateshmacherla/renewcred-cms.git
```

Open the project:

```bash
cd renewcred-cms
```

Configure the required environment variables using the `.env.example` files.

Build the Docker images:

```bash
docker compose build
```

Start the application:

```bash
docker compose up -d
```

Check the containers:

```bash
docker compose ps
```

The applications will run at:

```text
Admin CMS:      http://localhost:3000
Public Website: http://localhost:3001
Backend API:    http://localhost:5000
```

To stop all containers:

```bash
docker compose down
```

You can also build and start everything with:

```bash
docker compose up -d --build
```

---

## Running Locally Without Docker

Each application can also be started separately during development.

### Backend

```bash
cd backend
npm install
npm run dev
```

### Admin Frontend

```bash
cd admin-frontend
npm install
npm run dev
```

### Public Frontend

```bash
cd public-frontend
npm install
npm run dev
```

Make sure the required environment variables are configured before starting the applications.

---

## Sample Admin Credentials

The following account can be used to evaluate the CMS:

```text
Email: admin@renewcred.com
Password: adminRenewCred123
```

These credentials are intended only for local assignment evaluation.

Production credentials should be managed securely through environment variables and should never be committed to the repository.

---

## How to Test the CMS

A simple evaluation flow is:

1. Open `http://localhost:3000`.
2. Log in with the sample admin credentials.
3. Open the Pages section.
4. Create a new page.
5. Add content sections such as headings, paragraphs, lists, tables, code, or other supported blocks.
6. Set the page status to `Published`.
7. Save the page.
8. Open `http://localhost:3001`.
9. Open the newly created public page.
10. Edit the content from the CMS and verify the updated content on the public website.

This demonstrates the complete content flow:

```text
Admin CMS → API → MongoDB → Public API → Public Website
```

---

## Responsive Design

The admin panel is responsive and can be used across desktop, tablet, and smaller screen sizes.

Forms, navigation, page management screens, and content layouts adjust based on the available screen width.

The public frontend is also responsive so CMS-generated content remains readable across different devices.

---

## Assumptions

I made a few assumptions while building the project:

1. The current CMS has one administrator role. The authentication structure can be extended with more users and roles later.

2. Every page has a unique slug that is used for public routing.

3. Only published pages are exposed through the public content APIs.

4. Draft pages remain available in the admin CMS but are not shown publicly.

5. The implemented content blocks are a practical set for this assignment rather than a complete rich-text editor.

6. Loan rates and financial information used in sample content are only demonstration data.

7. MongoDB Atlas is used for persistence, so a valid MongoDB connection string is required to run the backend.

---

## Key Technical Decisions

### Separate Admin and Public Frontends

I kept the CMS and public website as separate Next.js applications.

The admin application focuses on authentication and content management, while the public application focuses only on displaying published content.

This separation also makes it easier to maintain or deploy them independently later.

### API-Driven Content

The public website gets its content through backend APIs instead of importing static page data.

Because of this, an admin can update published content without changing the frontend source code.

### Block-Based Page Structure

Pages are stored as a collection of ordered content sections instead of using one fixed structure for every page.

This works better for mixed content such as documentation, tables, lists, equations, and normal text.

### Redux Where Needed

Redux Toolkit is used for shared state such as authentication.

Component-specific state stays local when it does not need to be shared across the application.

### Public and Protected APIs

Admin operations and public content retrieval are kept separate.

CMS operations require authentication, while public endpoints expose only content that should be available to website visitors.

### Docker

The backend, admin frontend, and public frontend run in separate Docker containers.

Docker Compose connects and manages the applications together so the complete project can be started consistently.

---

## Future Improvements

If I continued developing the CMS, some useful additions would be:

- Role-based admin access
- Image and media management
- Drag-and-drop block ordering
- Rich-text editing
- Page preview before publishing
- Content version history
- Scheduled publishing
- SEO fields for individual pages
- Automated API and end-to-end tests
- Search and pagination for larger page collections

---

## Submission Details

### GitHub Repository

```text
https://github.com/venkateshmacherla/renewcred-cms
```

### Local Applications

```text
Admin CMS:      http://localhost:3000
Public Website: http://localhost:3001
Backend API:    http://localhost:5000
```

### Admin Login

```text
Email: admin@renewcred.com
Password: adminRenewCred123
```

---

## Summary

The main goal of this project was to make website content manageable from the CMS instead of keeping it hardcoded in the frontend.

Admins can create, edit, publish, and delete pages, while the public application retrieves and renders the published content through APIs.

I used a block-based content structure so the CMS can support different types of content now and can be extended with additional block types later.
