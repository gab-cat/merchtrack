# MerchTrack Repository

## Introduction
The **MerchTrack Repository** is a comprehensive solution designed for an e-commerce platform that streamlines order management, payment processing, reporting, order tracking, and merchandise fulfillment for organizations. This repository leverages modern technologies and best practices to ensure scalability, maintainability, and a seamless developer experience.

---

## Installation

### Prerequisites
Before setting up the project, ensure the following tools and versions are installed:

- **Bun**: Version `1.2.2` is strictly required
    - If you do not have `bun` installed yet, refer to the [official Bun installation guide](https://bun.sh/docs/installation)

### Setup Steps
1. **Install Bun**:
   ```sh
   # Using npm
   npm install -g bun

   # On Linux
   curl -fsSL https://bun.sh/install | bash

   # or on macOS
   brew tap oven-sh/bun
   brew install bun@1.2.2
   ```

2. **Install Dependencies**:
   Install project dependencies using Bun:
   ```sh
   bun install
   ```

3. **Environment Configuration**:
   Obtain the `.env` files for production from the system administrator. These files contain sensitive configuration details such as API keys and database credentials.

   Example `.env` file:
   ```.env
   DATABASE_URL="postgresql://user:password@localhost:5432/merchtrack"
   CLERK_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxx"
   ```

4. **Run the Development Server**:
   Start the development server to begin working on the project:
   ```sh
   bun run dev
   ```

## Further Reading
For more detailed information, please refer to the following sections in our wiki:

| Topic                | Description                                                                 | Link                                                                 |
|----------------------|-----------------------------------------------------------------------------|----------------------------------------------------------------------|
| Home/Milestones      | Overview and milestones of the project                                      | https://github.com/gab-cat/merchtrack/wiki                           |
| Conventions          | Coding conventions and best practices                                       | https://github.com/gab-cat/merchtrack/wiki/Conventions               |
| Folder Structure     | Detailed explanation of the project's folder structure                      | https://github.com/gab-cat/merchtrack/wiki/Folder-Structure          |
| Git Flow             | Guidelines for using Git in this project                                    | https://github.com/gab-cat/merchtrack/wiki/Git-Flow                  |
| Tech Stack           | Information about the technologies and tools used in the project            | https://github.com/gab-cat/merchtrack/wiki/Tech-Stack-&-Tools        |
| VSCode Extensions    | Recommended Visual Studio Code extensions for development                   | https://github.com/gab-cat/merchtrack/wiki/VS-Code-Extensions        |
