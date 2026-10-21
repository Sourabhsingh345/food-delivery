# Food Delivery API

## Requirements

- Node.js 18 or newer
- MongoDB (local or hosted)

## Run locally

1. From this folder, copy `.env.example` to `.env`.
2. Set `MONGODB_URI` to a MongoDB connection string you can access.
3. Install dependencies with `npm install`.
4. Load or update the 15-item sample menu with `npm run seed`. This upserts the sample dishes without deleting other menu entries.
5. Start the API with `npm start`.

The API listens on port `5000` by default. Set `PORT` to change it. `CORS_ORIGINS` is a comma-separated list of allowed browser origins; configure it for the deployed frontend. When unset, the API allows cross-origin requests for local development.

## Routes

- `GET /health` — API and MongoDB readiness
- `GET /foods` — menu items
- `POST /register` and `POST /login` — account registration and login
- `GET /cart`, `POST /cart/add`, `DELETE /cart/:id` — cart operations
- `POST /order`, `GET /orders`, `GET /order/:id` — orders
- `PUT /order/:id/status` — update an order's delivery status
- `DELETE /orders` — clear order history

JSON errors use `{ "success": false, "message": "..." }`. The API validates request fields and returns an appropriate HTTP status for invalid input, missing records, and server failures.
