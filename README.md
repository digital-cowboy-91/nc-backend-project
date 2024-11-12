# Backend for NC News

[Live App](https://ncnews.colaia.dev/api)

This project is a backend application built with ExpressJS and PostgreSQL, providing a RESTful API for managing articles, comments, and user interactions such as voting and filtering.

The application is deployed and hosted on a **DigitalOcean Droplet**, making it accessible online and ensuring that I have hands-on experience with cloud-based deployments.

## Features

- Serve article data via RESTful API
- CRUD operations for articles and comments
- Filter articles by topics and article sorting
- Pagination for article and comment lists

## Technologies Used

- **ExpressJS**: Web framework for Node.js
- **PostgreSQL**: Relational database to store articles and comments
- **Jest**: Testing framework for unit and integration tests (TDD approach)
- **Supertest**: HTTP assertion library used for testing API endpoints
- **Husky**: Git hook tool that ensures code quality by running pre-commit or pre-push hooks to enforce linting, testing, and other checks before changes are pushed to the repository

## Setup

### Prerequisites

- Node.js (v22.6.0 or above)
- PostgreSQL database running locally or remotely

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/digital-cowboy-91/nc-backend-project.git
   cd nc-frontend-project
   npm i
   ```
2. Create `.env.development`, 'env.test' (and 'env.production') file with following environmental variables:
   ```env
   PG_DATABASE=nc_news # or nc_news_test, or link to remote PG
   ```
3. See the database
   ```
   npm run seed
   ```
4. Serve application
   ```bash
   npm run start
   ```
5. Run test
   ```bash
   npm run test
   ```

## See also

1. [Frontend for NC News](https://github.com/digital-cowboy-91/nc-frontend-project)

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
