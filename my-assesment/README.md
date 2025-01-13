# Project: URL Shortener

## Description
This project is a URL Shortener API built with Node.js and Sequelize ORM. It provides endpoints for creating short URLs, retrieving analytics, and managing user authentication via Google OAuth. The solution is containerized using Docker and supports deployment to cloud platforms.

---

## Features
- **URL Shortening**: Create short URLs for long links.
- **Analytics**: Track click statistics for short URLs.
- **Rate Limiting**: Prevent abuse with configurable limits.
- **Google OAuth**: User authentication and registration.
- **Documentation**: Swagger UI integration.
- **Dockerized Deployment**: Fully containerized solution.

---

## Prerequisites

- Node.js (v16 or later)
- MySQL (v8 or later)
- Docker & Docker Compose

---

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-repo/url-shortener.git
   cd url-shortener
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment Variables**
   Create a `.env` file in the root directory and configure the following variables:
   ```env
   PORT=3000
   DB_USER=root
   DB_PASSWORD=root
   DB_NAME=url_shortener
   DB_HOST=localhost
   DB_PORT=3306
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

4. **Database Migration**
   Ensure the database exists and run migrations:
   ```bash
   npm run migrate
   ```

---

## Run the Application

1. **Start the Server**
   ```bash
   npm start
   ```

2. **Access the Application**
   - API Documentation: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
   - Ping Route: [http://localhost:3000/ping](http://localhost:3000/ping)

---

## Dockerization

1. **Build Docker Image**
   ```bash
   docker-compose build
   ```

2. **Start Services**
   ```bash
   docker-compose up
   ```

3. **Access the Application in Docker**
   - Application: [http://localhost:3000](http://localhost:3000)
   - Swagger Docs: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## Project Structure
```
project-root/
├── config/
│   ├── db.config.js        # Database configuration
│   ├── redis.config.js     # Redis configuration
├── docs/
│   └── swagger.json        # API Documentation
├── src/
│   ├── models/             # Sequelize models
│   │   ├── index.js
│   │   └── dummyUrl.js
│   ├── routes/             # Express routes
│   │   └── route.js
│   ├── services/           # Service layer for business logic
│   │   └── url.service.js
│   ├── utils/              # Utility functions and middlewares
│   │   ├── logger.js
│   │   └── rateLimiter.js
│   └── app.js              # Express application setup
├── .env                    # Environment variables
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile              # Dockerfile for building image
├── package.json            # Project dependencies and scripts
├── server.js               # Entry point
└── README.md               # Project documentation
```

---

## API Endpoints

### Ping Route
- **GET /ping**
  - Response: `{ "reply": "pongg" }`

### URL Shortening
- **POST /api/url/create**
  - Request:
    ```json
    {
      "longUrl": "https://example.com",
      "customAlias": "example"
    }
    ```
  - Response:
    ```json
    {
      "shortUrl": "http://short.ly/example",
      "longUrl": "https://example.com",
      "customAlias": "example"
    }
    ```

### Analytics
- **GET /api/url/analytics/:shortUrl**
  - Response:
    ```json
    {
      "shortUrl": "http://short.ly/example",
      "clicks": 120
    }
    ```

### Google OAuth Login
- **POST /api/auth/google**
  - Request: `{ "token": "google_oauth_token" }`
  - Response:
    ```json
    {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "picture": "http://example.com/avatar.jpg"
    }
    ```

---

## Tests

Run tests with:
```bash
npm test
```

---

## Deployment

1. **Build and Push Docker Image**
   ```bash
   docker build -t your-dockerhub-username/url-shortener .
   docker push your-dockerhub-username/url-shortener
   ```

2. **Deploy to Cloud Platform (e.g., AWS, Heroku)**
   Follow platform-specific instructions to deploy Dockerized applications.

---

## License
This project is licensed under the MIT License.
