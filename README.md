# Northcoders Backend App (News API)

This application has been build using Test Driven Development methodology and its purpose is to allow users to interact with the database using API.

## Serving

### Prod

1. To try the API, use following link [https://nc-backend-project-2swj.onrender.com](https://nc-backend-project-2swj.onrender.com)
1. Repo is deployed to [Render](https://render.com) and data is served from [Supabase](https://supabase.com)

### Local

**Requirements:** Node v22.6.0 and Postgres 16.3

1. Clone the repo `git clone https://github.com/digital-cowboy-91/nc-backend-project.git`
1. Install dependencies `npm i`
1. In root of project create `.env.development` and `.env.test` files with `PGDATABASE` variable => see `setup.sql` to use correct DB name for each `.env.*` file
1. Setup DBs `num run setup-dbs`
1. Seed your dev DB `npm run seed` (test DB is seeded automatically)
1. Serve the App `npm run start` or run the test `npm t`

**Note:** If you need to change the port of the application, update `listener.js`

## Interaction

Open a browser or use any API platform/library to access `/api` endpoint. This endpoint serves API documentation (as JSON).

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
