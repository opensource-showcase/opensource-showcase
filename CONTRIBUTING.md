# Contributing to opensource-showcase

Thank you for your interest in contributing to opensource-showcase. This document provides guidelines and instructions for contributing to the project.

## Development Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Git
- GitHub account

### Local Development

1. Fork and clone the repository:

```bash
git clone https://github.com/<your-username>/opensource-showcase.git
cd opensource-showcase
```

> The upstream repository is at https://github.com/opensource-showcase/opensource-showcase

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

4. Run in development mode:

```bash
npm run dev
```

### Available Scripts

| Command                 | Description                            |
| ----------------------- | -------------------------------------- |
| `npm run build`         | Compile TypeScript to JavaScript       |
| `npm run build:watch`   | Watch mode for development             |
| `npm run dev`           | Run CLI in development with hot reload |
| `npm start`             | Run the built CLI                      |
| `npm test`              | Run test suite                         |
| `npm run test:coverage` | Run tests with coverage report         |
| `npm run lint`          | Check code style                       |
| `npm run lint:fix`      | Fix code style issues                  |
| `npm run type-check`    | Verify TypeScript types                |

## Code Standards

### TypeScript

- Use TypeScript for all source files
- Define explicit types for function parameters and return values
- Avoid `any` types unless absolutely necessary
- Use interfaces for complex types

### Code Style

- Follow ESLint configuration
- Use Prettier for formatting
- Run `npm run lint:fix` before committing
- Maximum line length: 100 characters

### Naming Conventions

- Use `camelCase` for variables and functions
- Use `PascalCase` for classes and interfaces
- Use `UPPER_SNAKE_CASE` for constants
- Prefix private methods with underscore: `_privateMethod()`

## GitHub OAuth Client ID

The file `src/auth/github-auth.ts` contains a public OAuth App Client ID:

```ts
const CLIENT_ID: string = 'Ov23li4P4stPDon9vAt1';
```

**This is intentional and not a security vulnerability.**

Per [GitHub's OAuth Device Flow specification](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow), the Client ID for an OAuth App is a public identifier — similar to an app's username. It is:

- ✅ Safe to commit to source code
- ✅ Safe to distribute in published npm packages
- ✅ Designed to be embedded in CLI tools

The OAuth Device Flow does **not** use a Client Secret. Users authorize via a browser verification code, so there is no credential to protect here.

> **Do not replace** this value unless you are forking the project to create your own OAuth App registration.

## Project Structure

```
src/
├── auth/           # Authentication logic
├── commands/       # CLI command implementations
├── filter/         # Contribution filtering
├── github/         # GitHub API integration
├── repo/           # Repository management
│   ├── site/       # HTML generation
│   └── templates/  # README templates
├── types/          # TypeScript definitions
├── ui/             # Terminal UI components
└── utils/          # Shared utilities
```

## Pull Request Process

### Before Submitting

1. Ensure all tests pass: `npm test`
2. Verify type checking: `npm run type-check`
3. Run linter: `npm run lint:fix`
4. Build successfully: `npm run build`
5. Test the CLI locally

### PR Guidelines

1. Create a feature branch from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes with clear, focused commits

3. Write or update tests for your changes

4. Update documentation if needed

5. Push your branch and create a pull request

6. Fill out the PR template completely

### PR Title Format

Use conventional commits format:

```
<type>(<scope>): <description>

Examples:
feat(filter): add language-based filtering
fix(auth): resolve token refresh issue
docs(readme): update installation instructions
refactor(ui): simplify selection interface
test(github): add API integration tests
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Build process or tooling changes

### Code Review

- All PRs require at least one review
- Address review feedback promptly
- Keep PRs focused and reasonably sized
- Be open to suggestions and discussion

## Testing

### Writing Tests

- Place tests in `test/` directory
- Use descriptive test names
- Cover edge cases and error conditions
- Mock external dependencies (GitHub API, file system)

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test path/to/test-file.test.ts
```

## Documentation

### Code Documentation

- Add JSDoc comments for public functions
- Document complex logic with inline comments
- Keep comments up-to-date with code changes

### README Updates

Update README.md when adding:

- New commands or options
- Configuration options
- Features or behavior changes

## Issue Reporting

### Bug Reports

Include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, CLI version)
- Error messages or logs

### Feature Requests

Include:

- Use case and motivation
- Proposed solution or API
- Alternative approaches considered
- Potential impact on existing functionality

## Release Process

### Publishing a New Version

1. Ensure all tests pass and code is ready:

   ```bash
   npm run type-check
   npm run lint
   npm test
   npm run build
   ```

2. Update version in `package.json`:

   ```bash
   npm version patch  # or minor, or major
   ```

3. Create release commit:

   ```bash
   git commit -am "chore: release v0.x.x"
   ```

4. Tag the release:

   ```bash
   git tag v0.x.x
   ```

5. Push changes and tags:

   ```bash
   git push origin main --tags
   ```

6. Publish to npm:

   ```bash
   npm publish --access public
   ```

7. Verify the published package:
   ```bash
   npx opensource-showcase@latest --version
   ```

### First-Time Publishing Setup

If publishing for the first time:

1. Login to npm:

   ```bash
   npm login
   ```

2. Verify authentication:

   ```bash
   npm whoami
   ```

3. Test the package locally:

   ```bash
   npm pack
   npm install -g ./opensource-showcase-*.tgz
   opensource-showcase --help
   npm uninstall -g opensource-showcase
   ```

4. Publish with public access:
   ```bash
   npm publish --access public
   ```

## Getting Help

- Check existing issues and discussions
- Ask questions in GitHub Discussions
- Review documentation and examples
- Join community channels if available

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
