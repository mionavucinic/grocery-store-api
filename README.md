Grocery Store API

You need Node.js 18 or newer.

To run the project:

    npm install
    npm run demo

The API starts on http://localhost:3000 with an in-memory database that already contains the organization tree and test users, so there is no need to install MongoDB. The first start downloads MongoDB in the background and may take a minute.

You can log in as any seeded user with the password password123, for example manager.novibeograd@grocery.rs or employee.bezanija@grocery.rs. Example requests are in requests.http.

If you have MongoDB running on localhost:27017, you can use it instead. Copy .env.example to .env and run:

    npm install
    npm run seed
    npm run dev

To run the tests:

    npm test