# MerchTrack Repository

## Introduction
The **MerchTrack Repository** is a comprehensive solution designed for an e-commerce platform that streamlines order management, payment processing, reporting, order tracking, and merchandise fulfillment for organizations. This repository leverages modern technologies and best practices to ensure scalability, maintainability, and a seamless developer experience.

---

## Installation

### Prerequisites
Before setting up the project, ensure the following tools and versions are installed:

- **Node.js**: Version `22.12.0` is strictly required. It is recommended to use `nvm` (Node Version Manager) for managing Node.js versions.
    - If you do not have `nvm` installed yet. Refer to this guide [Node Version Manager Installation](https://www.freecodecamp.org/news/node-version-manager-nvm-install-guide/)
- **Package Manager**: Use `pnpm` for faster and more efficient dependency management.

### Setup Steps
1. **Install Node.js**:
   Use `nvm` to install and switch to the required Node.js version:
   ```sh
   nvm install 22.12.0
   nvm use 22.12.0
   ```

2. **Install Dependencies**:
   Install project dependencies using `pnpm`:
   ```sh
   npm install -g pnpm
   pnpm install
   ```

3. **Environment Configuration**:
   Obtain the `.env` files for production from the system administrator. These files contain sensitive configuration details such as API keys and database credentials.

   Example `.env` file:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/merchtrack"
   CLERK_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxx"
   ```

4. **Run the Development Server**:
   Start the development server to begin working on the project:
   ```sh
   pnpm run dev
   ```

### VS Code Extensions
To enhance productivity and ensure code quality, install the following VS Code extensions:

#### Required Extensions:
- **ESLint**: For linting and enforcing code style.
- **Prisma**: For Prisma ORM support and schema management.
- **Tailwind Intellisense**: For Tailwind CSS autocompletion and suggestions.

#### Nice-to-Have Extensions:
- **CodeScene**: For code quality and team performance insights.
- **SonarQube**: For static code analysis and bug detection.
- **Headwind**: For automatic Tailwind CSS class sorting.

---

## Tech Stack & Tools

### Core Technologies
- **Frontend Framework**: Next.js
  > React-based framework for building full-stack web applications with server-side rendering and API routes.
- **ORM**: Prisma
  > Type-safe database client with automatic migrations and intuitive data modeling.
- **Containerization**: Docker
  > Platform for developing, shipping, and running applications in isolated environments.
- **Database**: Postgres
  > Advanced open-source relational database with robust feature set and reliability.
- **Authentication**: Clerk
  > Complete user management and authentication solution with pre-built components.
- **Styling**: Tailwind CSS
  > Utility-first CSS framework for rapid UI development with minimal custom CSS.
- **UI Components**: Shadcn
  > High-quality, accessible React components built with Radix UI and Tailwind CSS.
- **State Management**: Zustand
  > Minimalist state management solution with a simple and flexible API.
- **Validation**: Zod
  > TypeScript-first schema validation with static type inference.
- **Data Fetching**: Tanstack Query
  > Powerful data synchronization library for managing, caching, and updating server state.

### Static Code Analysis
- **Datadog**
  > Comprehensive monitoring and analytics platform that includes code profiling and performance analysis.
- **DeepScan**
  > JavaScript-specific static analysis tool for detecting runtime errors and quality issues.
- **CodeRabbit AI**
  > AI-powered code review assistant that provides automated code suggestions and improvements.
- **CodeQL**
  > Semantic code analysis engine that treats code as data for finding security vulnerabilities.
- **DeepSource**
  > Automated code review tool that identifies bug risks, anti-patterns, and security issues.
- **CodeScene**
  > Behavioral code analysis platform that detects technical debt and social patterns in codebases.

### Monitoring and Error Tracking
- **Sentry**
  > Real-time error tracking and performance monitoring platform for applications.
- **Datadog**
  > Full-stack observability platform for metrics, traces, and logs monitoring.

### Infrastructure
- **AWS Lightsail VM Instance**
  > Simplified virtual private server hosting solution from AWS.
- **AWS Lightsail Database**
  > Managed PostgreSQL database service optimized for Lightsail.
- **Cloudflare**
  > CDN, DDoS protection, and DNS management service.

### System Applications
- **Nginx Proxy Manager**
  > Web interface for managing Nginx proxy hosts with SSL.
- **Dozzle**
  > Real-time log viewer for Docker containers with a clean web interface.
- **Watchtower**
  > Automated Docker container base image updates.

---

## Folder Structure
The repository follows a structured and modular approach to organize code:

- **.dockerignore**: Specifies files and directories to be ignored by Docker during the build process.
- **.env**: Contains environment variables for the project.
- **.gitignore**: Specifies files and directories to be ignored by Git.
- **.husky/**: Configuration for Git hooks using Husky.
- **.next/**: Contains the build output generated by Next.js.
- **prisma/**: Includes Prisma schema files and database migrations.
- **public/**: Stores static assets such as images and fonts served by Next.js.
- **src/**: The main source code directory.
  - **actions/**: Contains server actions and business logic handlers.
  - **components/**: Houses reusable React components.
  - **lib/**: Utility functions and shared libraries.
  - **hooks/**: Custom React hooks for reusable logic.
  - **pages/**: Next.js pages and routing configurations.
  - **styles/**: Global and modular CSS styles.
  - **types/**: TypeScript type definitions and interfaces.

---

## Git Flow
The project follows a structured Git workflow to ensure collaboration and code quality:

- **Branching Strategy**: Use a feature-driven approach. Create a new branch for each feature or bug fix.
  - Example: `feature/login`, `fix/order-tracking`.
- **Pull Requests**: All changes must be submitted via pull requests. Direct pushes to the `main` branch are prohibited.
  - Pull requests are reviewed, tested, and analyzed using tools like SonarQube and CodeScene.
  - Merging is only allowed after successful tests and approvals.
- **Commit Messages**: Follow the conventional commit format:
  - **Format**: `<type>(<scope>): <subject>`
  - **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
  - **Example**: `feat(auth): add login functionality`

---

## Conventions
To maintain consistency and code quality, adhere to the following conventions:

### Code Style
- **Functions**:
  - Use `function()` for top-level functions.
    ```javascript
    function fetchUserData(userId) {
      // Function logic
    }
    ```
  - Use arrow functions for anonymous functions or callbacks.
    ```javascript
    const userData = users.map((user) => user.name);
    ```
- **Naming**:
  - Use `camelCase` for variables and functions.
    ```javascript
    const userProfile = getUserProfile();
    ```
  - Use `PascalCase` for components and types.
    ```typescript
    interface UserProfile {
      name: string;
      age: number;
    }
    ```
  - Use `UPPER_SNAKE_CASE` for constants.
    ```javascript
    const API_KEY = "xxxxxxxxxxxxxxxx";
    ```
  - Use `Sentence case` for enums and type names.
    ```typescript
    enum OrderStatus {
      Pending = "Pending",
      Shipped = "Shipped",
      Delivered = "Delivered",
    }
    ```
- **Types**:
  - Avoid using `any`. Always define specific types.
    ```typescript
    function addNumbers(a: number, b: number): number {
      return a + b;
    }
    ```

### Component Design
- **Reusability**: If an HTML structure or function is reused more than twice, abstract it into a component or utility function.
  - Example: A reusable `Button` component:
    ```javascript
    function Button({ children, onClick }) {
      return (
        <button onClick={onClick} className="bg-blue-500 text-white p-2 rounded">
          {children}
        </button>
      );
    }
    ```
- **Dynamic Island Approach**:
  - Maximize the use of server components for performance.
    ```javascript
    export default async function UserProfile({ userId }) {
      const user = await fetchUserData(userId);
      return <div>{user.name}</div>;
    }
  - Use client components only for interactive parts of the UI.
    ```javascript
    "use client";
    export default function Counter() {
      const [count, setCount] = useState(0);
      return (
        <div>
          <p>{count}</p>
          <button onClick={() => setCount(count + 1)}>Increment</button>
        </div>
      );
    }
    ```
- **Suspense**: Wrap data-fetching components in `Suspense` and provide fallback placeholders for a better user experience.
  ```javascript
  <Suspense fallback={<div>Loading...</div>}>
    <UserProfile userId={1} />
  </Suspense>
  ```

### Validation and Data Handling
- **Validation**: Always use `Zod` for schema validation.
  ```javascript
  import { z } from "zod";

  const userSchema = z.object({
    name: z.string(),
    age: z.number().positive(),
  });

  const user = userSchema.parse({ name: "John", age: 25 });
  ```
- **Mutations**: Use `useMutation` from Tanstack Query or server actions for mutation requests.
  ```javascript
  const mutation = useMutation({
    mutationFn: (newUser) => axios.post("/api/users", newUser),
  });
  ```

### Error Handling
- Always handle errors gracefully. Use try-catch blocks for asynchronous operations and provide meaningful error messages.
  ```javascript
  try {
    const data = await fetchData();
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }
  ```

### Documentation
- Add inline comments and JSDoc annotations to explain complex logic.
  ```javascript
  /**
   * Fetches user data from the API.
   * @param {number} userId - The ID of the user.
   * @returns {Promise<User>} - The user data.
   */
  async function fetchUserData(userId) {
    // Function logic
  }
  ```
- Maintain a comprehensive README and update it as the project evolves.

### Code Quality
- Ensure code is clean, readable, and well-commented.
- Regularly run linting and formatting tools to maintain consistency.

---

## Documentation
For detailed information on the technologies used, refer to the official documentation:

- **Next.js**: [Next.js Documentation](https://nextjs.org/docs)
- **Prisma**: [Prisma Documentation](https://www.prisma.io/docs/)
- **Docker**: [Docker Documentation](https://docs.docker.com/)
- **Postgres**: [Postgres Documentation](https://www.postgresql.org/docs/)
- **Clerk**: [Clerk Documentation](https://docs.clerk.dev/)
- **Tailwind CSS**: [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- **Shadcn**: [Shadcn Documentation](https://shadcn.dev/docs)
- **Zustand**: [Zustand Documentation](https://docs.pmnd.rs/zustand)
- **Zod**: [Zod Documentation](https://zod.dev/)
- **Tanstack Query**: [Tanstack Query Documentation](https://tanstack.com/query/v4/docs/overview)

## Product Launch Milestones

### Phase 1: Foundation (Date: 3rd week of January)
> Setting up the essential infrastructure and development environment. This phase focuses on establishing a solid technical foundation for the application, ensuring scalability and maintainability from the start.

- [x] Core infrastructure setup
  - AWS Lightsail VM and Database configuration
  - Docker containerization
  - CI/CD pipeline implementation
- [ ] Basic authentication system
- [ ] Database schema design and implementation
- [ ] Basic UI components library
- [x] Development environment setup guide

### Phase 2: Core Features (Date: _______)
> Implementing the fundamental features necessary for basic e-commerce operations. This phase delivers the minimum viable product (MVP) functionality that allows users to manage orders and process payments.

- [ ] Order management system
  - Basic CRUD operations
  - Order status tracking
  - Basic search and filtering
- [ ] User roles and permissions
- [ ] Basic reporting functionality
- [ ] Order integration (test mode)
- [ ] Initial API documentation

### Phase 3: Enhanced Features (Date: _______)
> Building upon the core functionality with advanced features and automation. This phase focuses on improving user experience and operational efficiency through sophisticated management tools.

- [ ] Advanced order management
  - Bulk operations
  - Advanced search and filtering
  - Order history tracking
- [ ] Analytics dashboard
- [ ] Inventory management system
- [ ] Email notification system
- [ ] Payment system (production mode)

### Phase 4: Optimization (Date: _______)
> Fine-tuning the application's performance, security, and reliability. This phase ensures the platform can handle production workloads efficiently and securely.

- [ ] Performance optimization
- [ ] Security hardening
- [ ] Advanced analytics
- [ ] Automated testing suite
- [ ] Documentation completion

### Phase 5: Launch Preparation (Date: _______)
> Conducting comprehensive testing and preparation for production deployment. This phase focuses on ensuring everything is production-ready and meets quality standards.

- [ ] User acceptance testing
- [ ] Load testing and optimization
- [ ] Security audit
- [ ] Backup and recovery procedures
- [ ] Production environment setup
- [ ] Launch checklist completion

### Phase 6: Post-Launch (Date: _______)
> Establishing ongoing monitoring and maintenance procedures. This phase focuses on collecting user feedback and ensuring stable operation while planning future improvements.

- [ ] Monitoring setup
- [ ] Customer feedback collection
- [ ] Bug tracking and resolution
- [ ] Performance monitoring
- [ ] Initial feature enhancement planning

---

