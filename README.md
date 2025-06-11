# Payslip System

This project was built to fulfill a technical test assignment from Dealls! for the Backend Engineer position.

A backend application for a company's payslip system, built with NestJS, PostgreSQL, and TypeScript. This project provides functionalities for payroll management, attendance tracking, overtime, and reimbursements with role-based access control for admins and employees.

-----

## Table of Contents

- [About The Project](https://www.google.com/search?q=%23about-the-project)
- [Paper Documentation](https://www.google.com/search?q=%23additional-documentation)
- [Key Features](https://www.google.com/search?q=%23key-features)
- [Software Architecture](https://www.google.com/search?q=%23software-architecture)
- [Technology Stack](https://www.google.com/search?q=%23technology-stack)
- [Getting Started](https://www.google.com/search?q=%23getting-started)
    - [Prerequisites](https://www.google.com/search?q=%23prerequisites)
    - [Installation](https://www.google.com/search?q=%23installation)
    - [Environment Configuration](https://www.google.com/search?q=%23environment-configuration)
    - [Running the Application](https://www.google.com/search?q=%23running-the-application)
    - [Running Tests](https://www.google.com/search?q=%23running-tests)
- [API Usage](https://www.google.com/search?q=%23api-usage)

## About The Project

This project is a REST API designed to manage a company's payroll cycle. The system allows an administrator to define payroll periods and process salaries, while employees can log their activities such as daily attendance, overtime, and reimbursement claims. Salary calculations are performed automatically based on predefined business rules, including prorated salary and overtime pay.

## Paper Documentation

For more in-depth documentation, please refer to the following document:

- [Project Payslip - Detailed Documentation](https://docs.google.com/document/d/1KwiFej2qfr68BZ5EacSNC9qslAjXt7Tx9B2akl0Vq_I/edit?usp=sharing)


## Key Features

- **Role-Based Management**: Clear separation of roles between **Admin** and **Employee**.
- **Secure Authentication**: Utilizes **JWT (JSON Web Token)** to secure endpoints.
- **Payroll Management**: Admins can create payroll periods and execute the salary calculation process.
- **Employee Activities**: Employees can submit daily attendance, overtime requests, and reimbursement claims.
- **Automated Salary Calculation**: Salaries are calculated based on attendance (prorated) and supplemented with overtime pay and reimbursements.
- **Payslips & Reports**: Employees can view their own payslips, and admins can view a summary of the payroll run.
- **API Documentation**: Auto-generated, interactive API documentation using **Swagger (OpenAPI)**.
- **Automated Testing**: Comes with Unit, Integration, and E2E tests to ensure code quality.

## Software Architecture

This application is built with a **Modular Monolith** architecture, following the **Layered Architecture** pattern common in the NestJS ecosystem.

1.  **Presentation Layer (Controllers)**: Responsible for handling HTTP requests & responses, validating incoming data (DTOs), and handling authorization (Guards).
2.  **Business Logic Layer (Services)**: The core of the application, containing all business rules, complex calculations (like `runPayroll`), and primary logic.
3.  **Data Access Layer (Repositories)**: Responsible for all communication with the database via **TypeORM**, abstracting away database queries.

The **Dependency Injection (DI)** pattern is used extensively to connect these layers, making the code loosely coupled and highly testable.

## Technology Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: Passport.js (JWT Strategy)
- **Testing**: Jest, Supertest
- **Documentation**: Swagger
- **Others**: `class-validator`, `date-fns`, `bcrypt`, `crypto-js`

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following software installed:

- [Node.js](https://nodejs.org/) (v18 or later)
- [Yarn](https://yarnpkg.com/) (or npm)
- [PostgreSQL](https://www.postgresql.org/)
- [Git](https://git-scm.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/payslip-project.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd payslip-project
    ```
3.  **Install all dependencies:**
    ```bash
    yarn install
    ```

### Environment Configuration

1.  **Create the `.env` file:**
    Copy the example environment file to a new file named `.env`.
    ```bash
    cp .env.example .env
    ```
2.  **Fill in the environment variables:**
    Open the `.env` file and adjust the values to match your local configuration, especially the database connection details.
    ```env
    # --- Application ---
    APP_PORT=3000

    # --- Database ---
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=postgres
    DB_PASSWORD=your_db_password
    DB_DATABASE=payslip_db

    # --- JWT ---
    JWT_SECRET=YourSuperSecretKeyForJWT
    JWT_EXPIRATION_TIME=3600s

    # --- Crypto ---
    CRYPTO_SECRET_KEY=Key123
    ```

### Running the Application

- **Development mode (with hot-reload):**
  ```bash
  yarn start:dev
  ```
- **Production mode:**
  ```bash
  yarn build
  yarn start:prod
  ```

### Running Tests

- **Run all unit & integration tests:**
  ```bash
  yarn test
  ```
- **Run tests in watch mode:**
  ```bash
  yarn test:watch
  ```
- **Run End-to-End (E2E) tests:**
  Ensure your test database is configured.
  ```bash
  yarn test:e2e
  ```

## API Usage

Once the application is running, interactive API documentation is available via Swagger.

- **Swagger UI URL**: [http://localhost:3000/api-docs](https://www.google.com/search?q=http://localhost:3000/api-docs)

You can explore all endpoints, view data schemas, and authenticate directly from the Swagger page. To use the protected endpoints, click the `Authorize` button and enter the JWT token obtained from the `POST /auth/login` endpoint.