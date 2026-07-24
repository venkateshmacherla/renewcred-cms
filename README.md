# RenewCred CMS

RenewCred CMS is a full-stack Content Management System built as part of a Frontend Engineering Assignment.

The project consists of an authenticated admin panel, an Express.js backend, and a public-facing Next.js application. Administrators can create and manage website pages from the CMS, while the public website retrieves published content dynamically through backend APIs.

The main goal was to avoid hardcoding website content and build a structure that can support different types of content as the application grows.

---

## Project Structure

The project is split into three applications:

```text
renewcred-cms/
├── admin-frontend/
├── public-frontend/
├── backend/
├── docker-compose.yml
└── README.md
```

### Admin Frontend

The admin application is used by authenticated administrators to manage website content.

It includes:

- Admin login and logout
- Protected admin routes
- Dashboard
- Page management
- Create, edit, and delete pages
- Draft and published page status
- Flexible content sections
- Responsive admin interface

### Public Frontend

The public application displays content created through the CMS.

Published pages are retrieved from the backend instead of being hardcoded into the frontend.

The application supports dynamic routes based on page slugs.

For example:

```text
/
 /services
 /loan-comparison
 /about-renewcred
 /developer-docs
```

Additional published CMS pages can also be rendered dynamically without creating a separate Next.js page for every slug.

### Backend

The backend provides REST APIs for authentication, page management, and public content delivery.

It is responsible for:

- Admin authentication
- JWT-based authorization
- Page CRUD operations
- Draft/published content handling
- Public content APIs
- MongoDB persistence

---

## Technology Choices

### Frontend

- Next.js
- React
- Redux Toolkit
- CSS

Next.js was used for both the admin and public applications.

Redux Toolkit is used for global authentication-related state in the admin application. Local component state is used for temporary UI state such as form values, loading states, errors, and editor interactions.

I intentionally did not move every piece of application state into Redux. State that only belongs to one component is kept local, while shared authentication state is handled globally.

### Backend

- Node.js
- Express.js
- JWT
- bcrypt

Express.js provides the REST API used by both frontend applications.

JWT is used for authenticated admin requests, and passwords are stored securely using hashing rather than plain text.

### Database

- MongoDB Atlas
- Mongoose

MongoDB was chosen because the CMS uses flexible page structures containing different types of content blocks.

This makes it possible to evolve the content model without requiring a separate database structure for every type of page.

### Infrastructure

- Docker
- Docker Compose

Each application has its own Docker container.

Docker Compose is used to run the complete project together.

---

## Architecture Overview

The application follows this general flow:

```text
                 MongoDB Atlas
                      ↑
                      │
                      │
Admin Frontend → Express API ← Public Frontend
    :3000           :5000          :3001
```

### Content flow

```text
Administrator
      ↓
Admin CMS
      ↓
Create / Edit / Publish Content
      ↓
Express API
      ↓
MongoDB
      ↓
Public API
      ↓
Public Next.js Application
```

The admin and public applications do not access the database directly.

All data access goes through the backend API.

---

## Content Architecture

Instead of limiting every page to fixed fields such as a title and description, I used a section-based content model.

A page can contain multiple ordered content sections.

Supported section types include:

- Heading
- Paragraph
- List
- Nested list
- Table
- Mathematical equation
- Code

For example, one page can contain:

```text
Page
├── Heading
├── Paragraph
├── Paragraph
├── List
├── Table
└── Equation
```

Another page can have a completely different structure:

```text
Page
├── Heading
├── Paragraph
├── Code
├── Heading
└── Nested List
```

This approach was chosen so the CMS can evolve without creating a new database model for every possible page layout.

The public frontend uses reusable rendering logic to display each supported content type.

New block types can be added later by extending the content model, admin editor, and public renderer.

---

## Dynamic Public Pages

Published content is retrieved through public APIs.

The public frontend supports dynamic slug-based routing.

For example, if an administrator creates:

```text
Title: Contact Us
Slug: contact-us
Status: Published
```

the page can be accessed as:

```text
/contact-us
```

A separate React page does not need to be manually created for every CMS page.

The public navigation also retrieves published pages dynamically.

The main application pages remain directly accessible in the navigation, while additional published pages are grouped under a `More` menu to prevent the navigation bar from becoming overcrowded.

---

## Authentication

The CMS is restricted to authenticated administrators.

The authentication flow is:

```text
Admin Login
    ↓
Backend validates credentials
    ↓
JWT generated
    ↓
Authenticated admin session
    ↓
Protected CMS functionality
```

Protected API requests require authentication.

The application also validates the current authenticated administrator before allowing access to protected CMS pages.

Logout clears the stored authentication session and returns the administrator to the login page.

---

## API Overview

The backend contains two main groups of page APIs.

### Admin APIs

Used by the CMS for authenticated content management.

Typical operations include:

```text
Login
Get current administrator
Create page
Get pages
Get page by ID
Update page
Delete page
```

These operations are protected where authentication is required.

### Public APIs

Used by the public-facing website.

Examples:

```text
GET /api/v1/public/pages
GET /api/v1/public/pages/:slug
```

Public APIs expose published content only.

Draft content remains available to administrators but is not intended to be displayed publicly.

---

## Environment Variables

Real environment files are not committed to the repository.

Create the required `.env` files using the provided `.env.example` templates.

Example backend configuration:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secure_jwt_secret

ADMIN_NAME=RenewCred Admin
ADMIN_EMAIL=admin@renewcred.com
ADMIN_PASSWORD=your_admin_password
```

Frontend API configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Do not commit real passwords, JWT secrets, or database credentials.

---

## Running the Project with Docker

### Prerequisites

Install:

- Docker Desktop
- Git

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Move into the project:

```bash
cd renewcred-cms
```

Configure the required environment variables before starting the application.

Build the Docker images:

```bash
docker compose build
```

Start the containers:

```bash
docker compose up -d
```

Check that all containers are running:

```bash
docker compose ps
```

The applications will be available at:

```text
Admin CMS:
http://localhost:3000

Public Website:
http://localhost:3001

Backend API:
http://localhost:5000
```

To stop the application:

```bash
docker compose down
```

---

## Running Without Docker

The applications can also be run separately during development.

### Backend

```bash
cd backend
npm install
npm run dev
```

### Admin Frontend

Open another terminal:

```bash
cd admin-frontend
npm install
npm run dev
```

### Public Frontend

Open another terminal:

```bash
cd public-frontend
npm install
npm run dev
```

Make sure the required environment variables are configured before starting each application.

---

## Sample Admin Credentials

For evaluation, use the configured sample administrator account.

```text
Email: admin@renewcred.com
Password: adminRenewCred123
```

The evaluator password should match the value configured in the backend environment.

For security, production credentials should never be committed directly to the repository.

---

## Example Evaluation Flow

A simple way to evaluate the CMS is:

1. Open the Admin CMS.
2. Log in using the provided administrator credentials.
3. Open the Pages section.
4. Create a new page.
5. Add one or more content sections.
6. Set the page status to Published.
7. Save the page.
8. Open the public website.
9. Navigate to the newly published page.
10. Edit the page again from the CMS and verify that the updated content is reflected on the public website.

This demonstrates the complete flow:

```text
Admin CMS
   ↓
Backend API
   ↓
MongoDB
   ↓
Public API
   ↓
Public Website
```

---

## Responsive Design

The admin interface was designed to work across different screen sizes.

The layout, content tables, forms, and navigation adapt for smaller screens where required.

The public application also uses responsive layouts so dynamically rendered content remains readable across desktop and mobile screen sizes.

---

## Assumptions

A few assumptions were made while implementing the assignment:

1. The CMS currently supports a single administrator role, but the authentication structure can be extended to support multiple users and roles later.

2. Pages use unique slugs for public routing.

3. Only published pages should be available through the public content APIs.

4. Draft pages remain available for administrators but should not appear on the public website.

5. The current content block types represent a practical subset of rich content rather than attempting to build a complete document editor.

6. Loan and financial information included in the sample content is demonstration data and should not be considered real financial advice or current lender offers.

7. MongoDB Atlas is used as the database, so a valid database connection must be configured through environment variables.

---

## Architectural Decisions

### Separate Admin and Public Applications

I kept the admin CMS and public website as separate Next.js applications.

This keeps administrative functionality isolated from the user-facing application and allows both applications to evolve independently.

### API-Driven Content

The public frontend retrieves content through backend APIs instead of importing static content.

This ensures changes made through the CMS can be reflected on the public website without modifying frontend source code for each content update.

### Block-Based Content Model

A flexible section/block model was used instead of creating fixed schemas for every page type.

This allows different pages to contain different combinations of structured content and makes it easier to introduce additional content types later.

### Redux Only Where Appropriate

Redux Toolkit is used for shared application state where global access is useful, particularly authentication.

Temporary component-specific state remains local to avoid unnecessary global state complexity.

### Separate Public and Protected APIs

Administrative content management and public content retrieval are treated separately.

This provides a clear boundary between authenticated CMS functionality and content that can safely be consumed by the public website.

### Dockerized Applications

The backend, admin frontend, and public frontend are containerized separately and managed through Docker Compose.

This provides a consistent way to build and run the complete application.

---

## Possible Future Improvements

Given more time, I would consider adding:

- Role-based access control
- Media/image management
- Drag-and-drop content block ordering
- Rich-text editing
- Page preview before publishing
- Content version history
- Scheduled publishing
- SEO controls for each page
- Automated API and end-to-end tests
- Pagination and search for larger content collections

The current architecture was designed so these features can be added without requiring a complete rewrite of the CMS.

---

## Submission

### GitHub Repository

```text
https://github.com/venkateshmacherla/renewcred-cms
```

### Applications

```text
Admin CMS: http://localhost:3000
Public Website: http://localhost:3001
Backend API: http://localhost:5000
```

### Admin Login

```text
Email: admin@renewcred.com
Password: adminRenewCred123
```

---

## Final Note

The main focus of this implementation was to build the CMS as a reusable content system rather than a collection of hardcoded pages.

Administrators can manage structured content through the CMS, the backend stores and exposes that content through APIs, and the public application renders published content dynamically.

This keeps content management separate from presentation and provides a foundation that can be extended as the application grows.
