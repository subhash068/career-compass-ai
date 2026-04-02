# 🎭 Playwright Complete Tutorial: From Scratch to Advanced

## Table of Contents
1. [Introduction](#introduction)
2. [Definitions & Key Terms](#-definitions--key-terms)
3. [Installation & Setup](#installation--setup)
4. [Basic Concepts](#basic-concepts)
5. [Writing Your First Test](#writing-your-first-test)
6. [Locators & Selectors](#locators--selectors)
7. [Assertions](#assertions)
8. [Page Object Model (POM)](#page-object-model-pom)
9. [Fixtures & Hooks](#fixtures--hooks)
10. [Authentication Testing](#authentication-testing)
11. [API Testing](#api-testing)
12. [Network Interception](#network-interception)
13. [Browser Contexts & Isolation](#browser-contexts--isolation)
14. [Parallel Execution](#parallel-execution)
15. [Visual Testing](#visual-testing)
16. [Mobile Testing](#mobile-testing)
17. [CI/CD Integration](#cicd-integration)
18. [Advanced Features](#advanced-features)
19. [Best Practices](#best-practices)
20. [Troubleshooting](#troubleshooting)

---

## Introduction

### What is Playwright?
Playwright is a powerful, open-source automation framework developed by Microsoft for end-to-end testing of modern web applications. It supports multiple browsers (Chromium, Firefox, WebKit) and provides reliable automation for complex scenarios.

### Key Features:
- ✅ Cross-browser support (Chromium, Firefox, WebKit)
- ✅ Auto-wait functionality (automatic waiting for elements)
- ✅ Native support for modern web features
- ✅ Powerful locator strategies
- ✅ Built-in reporters & trace viewer
- ✅ Network interception & mocking
- ✅ Mobile device emulation
- ✅ Parallel test execution
- ✅ First-class TypeScript support

---

## 📖 Definitions & Key Terms

### Core Concepts

| Term | Definition |
|------|------------|
| **Playwright** | An open-source automation framework developed by Microsoft for end-to-end testing of modern web applications. It supports multiple browsers and provides APIs for automating user interactions. |
| **End-to-End (E2E) Testing** | A testing methodology that validates the entire application flow from start to finish, simulating real user behavior to ensure all components work together correctly. |
| **Test** | A single unit of testing logic that verifies a specific behavior or feature of the application. In Playwright, defined using the `test()` function. |
| **Test Suite** | A collection of related tests grouped together, typically using `test.describe()` to organize tests by feature or module. |
| **Test Runner** | The tool that executes tests and reports results. Playwright's test runner is `@playwright/test`. |

### Configuration Terms

| Term | Definition |
|------|------------|
| **playwright.config.ts** | The configuration file that defines test settings, including test directory, reporters, browser projects, timeouts, and more. |
| **Test Directory (testDir)** | The folder where Playwright looks for test files. Specified in the configuration file. |
| **Projects** | Configurations that define different test environments (browsers, devices, viewport sizes) that tests should run against. |
| **Reporter** | A component that formats and outputs test results. Playwright supports HTML, JSON, JUnit, and custom reporters. |
| **Web Server (webServer)** | Configuration to automatically start a local development server before running tests. |

### Browser & Context Terms

| Term | Definition |
|------|------------|
| **Browser** | The application used to automate web page interactions. Playwright supports Chromium, Firefox, and WebKit. |
| **Browser Instance** | A running instance of a browser (e.g., Chrome, Firefox). Created using `browser.newContext()` or `browser.newPage()`. |
| **Browser Context** | An isolated browser session with its own cookies, local storage, and browsing history. Multiple contexts can run in parallel within the same browser instance. |
| **Page** | A single tab or page within a browser context. Used to navigate URLs and interact with page elements. |
| **Viewport** | The visible area of a web page, defined by width and height dimensions. Affects how responsive designs render. |
| **User Agent** | A string that identifies the browser and version to the web server. Can be customized for testing. |

### Locator & Selector Terms

| Term | Definition |
|------|------------|
| **Locator** | A method to find and target elements on a web page. Playwright provides various locator strategies like `getByRole`, `getByText`, `getByLabel`, etc. |
| **Selector** | A string that identifies an element using CSS, XPath, or other methods. Used with `page.locator()`. |
| **CSS Selector** | A pattern that matches elements based on their CSS properties (ID, class, attributes, etc.). |
| **XPath** | A language for selecting nodes in XML/HTML documents. Can navigate through element hierarchies. |
| **Role Selector** | A locator strategy that targets elements by their ARIA role (e.g., button, link, checkbox). Recommended for accessibility. |
| **Test ID (data-testid)** | A custom attribute added to elements specifically for testing purposes. Recommended for stable element targeting. |

### Assertion Terms

| Term | Definition |
|------|------------|
| **Assertion** | A statement that verifies an expected condition. If the condition fails, the test fails. |
| **Auto-Retrying Assertion** | An assertion that automatically waits for the condition to be met before failing. Uses `expect()` with Playwright matchers. |
| **Non-Retrying Assertion** | A one-time check that doesn't wait or retry. Uses the standard `expect()` from testing libraries. |
| **Soft Assertion** | An assertion that doesn't stop test execution on failure. Allows continuing to check other conditions. |
| **Matcher** | A function that defines what to assert (e.g., `toBeVisible()`, `toHaveText()`, `toHaveURL()`). |

### Page Object Model Terms

| Term | Definition |
|------|------------|
| **Page Object Model (POM)** | A design pattern that creates an object repository for web page elements, abstracting page details from tests for better maintainability. |
| **Page Object** | A class that represents a web page, containing element locators and methods to interact with that page. |
| **Base Page** | A parent class that provides common functionality (navigation, waiting, utilities) shared across all page objects. |
| **Locator Property** | A class property that stores a `Locator` object, typically defined using `page.getByRole()`, `page.locator()`, etc. |

### Fixture & Hook Terms

| Term | Definition |
|------|------------|
| **Fixture** | A reusable piece of test data or functionality that can be injected into tests. Defined using `test.extend()`. |
| **Built-in Fixture** | Pre-defined fixtures provided by Playwright (e.g., `page`, `browser`, `context`, `request`). |
| **Custom Fixture** | User-defined fixtures that add custom functionality like authentication, API clients, etc. |
| **Hook** | A function that runs at specific points in the test lifecycle (before/after tests or suites). |
| **test.beforeAll()** | A hook that runs once before all tests in a describe block. Used for expensive setup. |
| **test.afterAll()** | A hook that runs once after all tests in a describe block. Used for cleanup. |
| **test.beforeEach()** | A hook that runs before each test. Used to reset state or prepare test data. |
| **test.afterEach()** | A hook that runs after each test. Used for cleanup after each test. |

### Authentication Terms

| Term | Definition |
|------|------------|
| **Cookie-Based Authentication** | A method where the server stores authentication info in a cookie after login, sent with subsequent requests. |
| **Token-Based Authentication** | A method using tokens (JWT, Bearer tokens) in request headers to authenticate users. |
| **OAuth** | An open standard for access delegation, commonly used for third-party login (Google, Facebook, etc.). |
| **MFA (Multi-Factor Authentication)** | An authentication method requiring two or more verification factors. |
| **Session Cookie** | A cookie that maintains user login state, typically deleted when the browser closes. |
| **Storage State** | A snapshot of browser storage (cookies, localStorage, sessionStorage) that can be saved and restored. |

### API Testing Terms

| Term | Definition |
|------|------------|
| **API (Application Programming Interface)** | A set of protocols that allow different software applications to communicate with each other. |
| **Request Fixture** | Playwright's built-in fixture for making HTTP requests, accessible via `request` parameter. |
| **API Context** | An isolated HTTP client with its own cookies and headers, created using `request.newContext()`. |
| **HTTP Methods** | Standard request types: GET (retrieve), POST (create), PUT (update), DELETE (remove), PATCH (partial update). |
| **Status Code** | A number returned by the server indicating the result of the request (200=OK, 404=Not Found, 500=Server Error). |
| **Request Header** | Additional information sent with HTTP requests (Content-Type, Authorization, etc.). |
| **Response Body** | The data returned by the server in response to a request, typically in JSON format. |

### Network Terms

| Term | Definition |
|------|------------|
| **Network Interception** | The ability to capture, modify, or block network requests before they reach the server. |
| **Route** | A handler that intercepts network requests matching a pattern, defined using `page.route()`. |
| **Mocking** | Creating fake responses for network requests to simulate specific conditions or test scenarios. |
| **Request Fulfillment** | Returning a custom response to a matched network request using `route.fulfill()`. |
| **Request Abort** | Cancelling a network request before it completes using `route.abort()`. |
| **Network Idle** | A state when no network requests are active for a specified duration. |

### Execution Terms

| Term | Definition |
|------|------------|
| **Parallel Execution** | Running multiple tests simultaneously to reduce total execution time. |
| **Worker** | A separate process that runs a subset of tests in parallel. |
| **Fully Parallel** | A mode where all test files run in parallel (vs. serial within each file). |
| **Retries** | The number of times Playwright automatically re-runs a failed test. |
| **Timeout** | The maximum time Playwright waits for an action or assertion to complete. |
| **Trace Viewer** | A UI tool for analyzing test execution, including screenshots, network logs, and console output. |

### Mobile Testing Terms

| Term | Definition |
|------|------------|
| **Device Emulation** | Simulating a mobile device's viewport, user agent, and touch capabilities in a desktop browser. |
| **Touch Event** | User interactions on touch-enabled devices (tap, swipe, pinch). |
| **Viewport** | The visible area of a page; mobile devices typically have smaller viewports (e.g., 375x812 for iPhone). |
| **Device Scale Factor** | The ratio between physical pixels and CSS pixels (e.g., 2x or 3x for retina displays). |
| **User Agent** | Identifies the browser and device to web servers; used to serve device-specific content. |

### CI/CD Terms

| Term | Definition |
|------|------------|
| **CI (Continuous Integration)** | A practice of automatically running tests whenever code changes are pushed to the repository. |
| **CD (Continuous Deployment)** | Automatically deploying code to production after passing tests. |
| **GitHub Actions** | A CI/CD platform that automates workflows, including running Playwright tests. |
| **Artifact** | Files generated by tests (reports, screenshots, videos) that can be stored and downloaded. |
| **Docker** | A platform for packaging applications in containers, ensuring consistent test environments. |

### Visual Testing Terms

| Term | Definition |
|------|------------|
| **Screenshot Comparison** | Comparing screenshots against baseline images to detect visual regressions. |
| **Baseline** | The reference screenshot used for comparison in visual regression testing. |
| **Visual Regression** | Unintended visual changes in the UI that occur when code is modified. |
| **Pixel Diff** | The difference between two images, measured in pixels, used to determine visual changes. |
| **Percy** | A visual testing platform that integrates with Playwright for automated visual comparisons. |

### Advanced Terms

| Term | Definition |
|------|------------|
| **Soft Assert** | An assertion that records failures but doesn't stop test execution. |
| **Test Parameterization** | Running the same test with different input values using loops or data providers. |
| **Environment Variable** | A variable that can be accessed in tests to configure behavior based on the environment (dev, staging, prod). |
| **Custom Reporter** | A user-defined reporter that formats test output in a specific way. |
| **Test Filtering** | Selecting which tests to run based on patterns, tags, or grep expressions. |
| **Grep** | A pattern-matching tool used to filter tests by name or description. |

### Common Playwright APIs

| Method | Definition |
|--------|------------|
| `page.goto(url)` | Navigates to a specific URL. |
| `page.click(selector)` | Clicks on an element matching the selector. |
| `page.fill(selector, text)` | Types text into an input field. |
| `page.locator(selector)` | Creates a locator for elements matching the selector. |
| `page.waitForSelector(selector)` | Waits for an element to appear before proceeding. |
| `page.waitForLoadState(state)` | Waits for a specific load state (domcontentloaded, networkidle, load). |
| `expect(locator).toBeVisible()` | Asserts that an element is visible. |
| `expect(page).toHaveURL(url)` | Asserts that the page URL matches. |
| `context.addCookies(cookies)` | Adds cookies to the browser context. |
| `page.setExtraHTTPHeaders(headers)` | Sets custom headers for all requests. |

---


## Installation & Setup

### Step 1: Initialize a New Project

```
bash
# Create a new directory
mkdir playwright-tutorial
cd playwright-tutorial

# Initialize npm project
npm init -y
```

### Step 2: Install Playwright

```
bash
# Install Playwright and its dependencies
npm install -D @playwright/test

# Install browser binaries
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit

# Or install all browsers at once
npx playwright install --with-deps
```

### Step 3: Create Project Structure

```
bash
mkdir tests
mkdir pages
mkdir utils
mkdir fixtures
```

---

## Basic Concepts

### Playwright Configuration File

Create `playwright.config.ts`:

```
typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory - where your tests live
  testDir: './tests',
  
  // Test files pattern
  testMatch: '**/*.spec.ts',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail CI if test.only is left in code
  forbidOnly: !!process.env.CI,
  
  // Retry failed tests on CI
  retries: process.env.CI ? 2 : 0,
  
  // Limit workers on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter options
  reporter: [
    ['html'], // HTML report
    ['list'], // Console output
    ['json', { outputFile: 'test-results.json' }] // JSON report
  ],
  
  // Global settings
  use: {
    // Base URL for all tests
    baseURL: 'http://localhost:3000',
    
    // Collect trace on first retry
    trace: 'on-first-retry',
    
    // Capture screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Timeout for each action
    actionTimeout: 10000,
    
    // Default timeout for all operations
    timeout: 30000,
  },
  
  // Configure projects (browsers)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile emulation
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  
  // Local dev server
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Writing Your First Test

### Basic Test Structure

Create `tests/basic.spec.ts`:

```
typescript
import { test, expect } from '@playwright/test';

test.describe('Basic Tests', () => {
  
  test('should open a page and check title', async ({ page }) => {
    // Navigate to a URL
    await page.goto('https://example.com');
    
    // Check the page title
    await expect(page).toHaveTitle(/Example Domain/);
    
    // Check for specific text
    await expect(page.locator('h1')).toContainText('Example Domain');
  });
  
  test('should fill a form', async ({ page }) => {
    await page.goto('https://example.com');
    
    // Type into input
    await page.fill('input#username', 'testuser');
    await page.fill('input#password', 'testpass');
    
    // Click button
    await page.click('button[type="submit"]');
    
    // Assert navigation or result
    await expect(page).toHaveURL(/dashboard/);
  });
  
});
```

### Running Tests

```
bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/basic.spec.ts

# Run tests with specific project
npx playwright test --project=chromium

# Run tests in headed mode
npx playwright test --headed

# Run tests with debug mode
npx playwright test --debug

# Run tests matching a pattern
npx playwright test -g "should fill"

# Generate HTML report
npx playwright show-report
```

---

## Locators & Selectors

Playwright provides powerful locator strategies. Here's a comprehensive guide:

### 1. CSS Selectors

```
typescript
// Basic CSS
await page.click('#submit-button');
await page.click('.btn-primary');
await page.click('div.container');

// Attribute selectors
await page.click('input[type="text"]');
await page.click('a[href="/dashboard"]');
await page.click('button[data-testid="submit"]');

// Combining selectors
await page.click('div.card button.primary');
await page.click('form.login input[type="email"]');
```

### 2. Text Selectors

```
typescript
// By visible text
await page.getByText('Submit').click();
await page.getByText('Welcome back').first().click();

// By regex
await page.getByText(/submit/i).click();
await page.getByText(/Welcome, \w+/).first().click();
```

### 3. Role Selectors (Recommended - Accessibility)

```
typescript
// By role
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByRole('link', { name: 'Dashboard' }).click();
await page.getByRole('checkbox', { name: 'Remember me' }).check();
await page.getByRole('textbox', { name: 'Email' }).fill('test@example.com');
await page.getByRole('combobox', { name: 'Country' }).selectOption('US');
await page.getByRole('slider').fill('50');
await page.getByRole('heading', { name: 'Welcome' }).click();
await page.getByRole('dialog').isVisible();
await page.getByRole('option', { name: 'Option 1' }).click();
```

### 4. Label & Form Field Selectors

```typescript
// By label text
await page.getByLabel('Username').fill('testuser');
await page.getByLabel('Password').fill('password123');
await page.getByLabel('Remember me').check();

// By placeholder
await page.getByPlaceholder('Enter your email').fill('test@example.com');

// By test ID (requires data-testid attribute)
await page.getByTestId('submit-button').click();
await page.getByTestId('modal-close').click();
```

### 5. Locator Filtering

```
typescript
// Filter by text
await page.locator('.item').filter({ hasText: 'Product 1' }).click();

// Filter by child element
await page.locator('.list-item').filter({ has: page.locator('.badge') }).click();

// Chain locators
await page.locator('form').locator('input').first().fill('test');
await page.locator('ul li').nth(2).click();
```

### 6. XPath Selectors

```
typescript
// Use XPath when needed
await page.locator('xpath=//button[@id="submit"]').click();
await page.locator('xpath=//div[@class="card"]//span').first().click();
```

### 7. Parent & Sibling Selectors

```
typescript
// Get parent
await page.locator('input').locator('xpath=..').click();

// Get following sibling
await page.locator('label').locator('xpath=following-sibling::input').fill('test');

// Get previous sibling
await page.locator('div').locator('xpath=preceding-sibling::span').textContent();
```

---

## Assertions

Playwright provides two types of assertions:

### 1. Auto-Retrying Assertions (Recommended)

```
typescript
import { expect } from '@playwright/test';

// Basic assertions
await expect(page).toHaveTitle('Expected Title');
await expect(page).toHaveTitle(/Expected/);
await expect(page).toHaveURL(/dashboard/);
await expect(page).toHaveURL('https://example.com/dashboard');

// Element assertions
await expect(page.locator('h1')).toHaveText('Welcome');
await expect(page.locator('h1')).toContainText('Welcome');
await expect(page.locator('.error')).toBeHidden();
await expect(page.locator('.loading')).toBeVisible();
await expect(page.locator('button')).toBeEnabled();
await expect(page.locator('button')).toBeDisabled();
await expect(page.locator('input')).toBeChecked();
await expect(page.locator('input')).not.toBeChecked();
await expect(page.locator('input')).toHaveValue('test value');
await expect(page.locator('.count')).toHaveCount(5);
await expect(page.locator('.item')).toHaveCount(3);

// Custom timeout for assertion
await expect(page.locator('.dynamic')).toHaveText('Loaded', { timeout: 10000 });
```

### 2. Non-Retrying Assertions

```
typescript
// For expect that don't need retry
expect(page.url()).toContain('/dashboard');
expect(await page.title()).toBe('Title');

// Soft assertions (don't fail immediately)
await expect.soft(page.locator('h1')).toHaveText('Wrong Title');
// Test continues even if this fails
await page.click('button');
```

### 3. Negations

```
typescript
await expect(page.locator('.error')).not.toBeVisible();
await expect(page.locator('input')).not.toBeChecked();
await expect(page).not.toHaveURL('/error');
```

---

## Page Object Model (POM)

POM is essential for maintainable tests. Here's a complete implementation:

### 1. Create Base Page

Create `pages/BasePage.ts`:

```
typescript
import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  protected page: Page;
  protected baseURL: string;

  constructor(page: Page) {
    this.page = page;
    this.baseURL = 'http://localhost:3000';
  }

  async navigate(path: string = '') {
    await this.page.goto(`${this.baseURL}${path}`);
  }

  async click(locator: Locator) {
    await locator.click();
  }

  async fill(locator: Locator, value: string) {
    await locator.fill(value);
  }

  async getText(locator: Locator): Promise<string> {
    return await locator.textContent() || '';
  }

  async waitForVisible(locator: Locator, timeout = 10000) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }
}
```

### 2. Create Login Page

Create `pages/LoginPage.ts`:

```
typescript
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByLabel('Username');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign In' });
    this.errorMessage = page.locator('.error-message');
    this.rememberMeCheckbox = page.getByLabel('Remember me');
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot Password?' });
  }

  async login(username: string, password: string, rememberMe = false) {
    await this.navigate('/login');
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    
    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }
    
    await this.submitButton.click();
  }

  async loginWithInvalidCredentials(username: string, password: string) {
    await this.login(username, password);
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText('Invalid credentials');
  }

  async navigateToForgotPassword() {
    await this.forgotPasswordLink.click();
    await expect(this.page).toHaveURL(/forgot-password/);
  }
}
```

### 3. Create Dashboard Page

Create `pages/DashboardPage.ts`:

```
typescript
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly welcomeMessage: Locator;
  readonly userProfile: Locator;
  readonly logoutButton: Locator;
  readonly sidebar: Locator;
  readonly navItems: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeMessage = page.locator('.welcome-message');
    this.userProfile = page.locator('.user-profile');
    this.logoutButton = page.getByRole('button', { name: 'Logout' });
    this.sidebar = page.locator('.sidebar');
    this.navItems = page.locator('.nav-item');
  }

  async verifyLoggedIn(username: string) {
    await expect(this.welcomeMessage).toContainText(`Welcome, ${username}`);
  }

  async logout() {
    await this.logoutButton.click();
    await expect(this.page).toHaveURL(/login/);
  }

  async navigateToSection(sectionName: string) {
    await this.navItems.filter({ hasText: sectionName }).click();
  }
}
```

### 4. Use POM in Tests

Create `tests/login.spec.ts`:

```
typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Login Tests', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('should login successfully with valid credentials', async () => {
    await loginPage.login('testuser', 'password123');
    await dashboardPage.verifyLoggedIn('testuser');
  });

  test('should show error with invalid credentials', async () => {
    await loginPage.loginWithInvalidCredentials('invalid', 'wrongpass');
  });

  test('should remember me functionality', async () => {
    await loginPage.login('testuser', 'password123', true);
    // Verify cookie is set
    const cookies = await loginPage.page.context().cookies();
    expect(cookies.find(c => c.name === 'remember_token')).toBeDefined();
  });

  test('should navigate to forgot password', async () => {
    await loginPage.navigateToForgotPassword();
    await expect(loginPage.page.locator('h1')).toContainText('Reset Password');
  });
});
```

---

## Fixtures & Hooks

### Custom Fixtures

Create `fixtures/test-fixtures.ts`:

```
typescript
import { test as base, Page, BrowserContext } from '@playwright/test';

// Define custom fixture types
interface MyFixtures {
  authenticatedPage: Page;
  apiClient: APIClient;
}

interface APIClient {
  get: (url: string) => Promise<any>;
  post: (url: string, data: any) => Promise<any>;
}

// Create custom test with fixtures
export const test = base.extend<MyFixtures>({
  // Fixture: Authenticated page (auto-login)
  authenticatedPage: async ({ page }, use) => {
    // Perform login before each test
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    
    await use(page);
  },

  // Fixture: API Client
  apiClient: async ({}, use) => {
    const client: APIClient = {
      get: async (url: string) => {
        const response = await fetch(url);
        return response.json();
      },
      post: async (url: string, data: any) => {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        return response.json();
      },
    };
    await use(client);
  },
});
```

### Using Custom Fixtures

Create `tests/with-fixtures.spec.ts`:

```
typescript
import { test, expect } from './fixtures/test-fixtures';

test('test with authenticated page', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('http://localhost:3000/profile');
  await expect(authenticatedPage.locator('.user-name')).toContainText('testuser');
});

test('test with API client', async ({ apiClient }) => {
  const users = await apiClient.get('http://localhost:3000/api/users');
  expect(users).toHaveLength(5);
});
```

### Built-in Fixtures

```
typescript
import { test, expect, Page, Browser, BrowserContext, Request, Response } from '@playwright/test';

test('use built-in fixtures', async ({ 
  page,           // Current page
  browser,        // Browser instance
  context,        // Browser context
  request,        // API request fixture
}) => {
  // All fixtures are automatically available
});
```

### Hooks

```
typescript
import { test, expect } from '@playwright/test';

test.describe('Hooks Example', () => {
  
  // Runs once before all tests
  test.beforeAll(async ({ browser }) => {
    console.log('Setup: Create browser instances, connect to DB, etc.');
  });
  
  // Runs once after all tests
  test.afterAll(async () => {
    console.log('Teardown: Clean up resources');
  });
  
  // Runs before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    console.log('Reset state before each test');
  });
  
  // Runs after each test
  test.afterEach(async ({ page }) => {
    console.log('Clean up after test');
  });
  
  test('test 1', async ({ page }) => {
    // Test code
  });
  
  test('test 2', async ({ page }) => {
    // Test code
  });
});
```

---

## Authentication Testing

### 1. Cookie-Based Authentication

```
typescript
import { test, expect } from '@playwright/test';

test.describe('Cookie Authentication', () => {
  
  test('should login and maintain session', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // Fill login form
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForURL(/dashboard/);
    
    // Get session cookie
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name === 'session_token');
    expect(sessionCookie).toBeDefined();
    
    // Navigate to another page - session should persist
    await page.goto('http://localhost:3000/profile');
    await expect(page.locator('.user-name')).toContainText('testuser');
  });
  
  test('should restore authenticated session', async ({ context }) => {
    // Set cookie directly (simulating restored session)
    await context.addCookies([{
      name: 'session_token',
      value: 'existing-session-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    }]);
    
    const page = await context.newPage();
    await page.goto('http://localhost:3000/dashboard');
    
    // Should be already logged in
    await expect(page.locator('.welcome')).toBeVisible();
  });
});
```

### 2. Token-Based Authentication (API)

```
typescript
import { test, expect } from '@playwright/test';

test.describe('Token Authentication', () => {
  
  test('should login via API and store token', async ({ request }) => {
    // Login via API
    const response = await request.post('http://localhost:3000/api/login', {
      data: {
        username: 'testuser',
        password: 'password123',
      },
    });
    
    expect(response.ok()).toBeTruthy();
    const { token } = await response.json();
    
    // Use token in subsequent requests
    const protectedResponse = await request.get('http://localhost:3000/api/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    expect(protectedResponse.ok()).toBeTruthy();
  });
  
  test('should authenticate page with token header', async ({ page, request }) => {
    // Get token
    const loginResponse = await request.post('http://localhost:3000/api/login', {
      data: { username: 'testuser', password: 'password123' },
    });
    const { token } = await loginResponse.json();
    
    // Set authorization header for all requests
    await page.setExtraHTTPHeaders({
      Authorization: `Bearer ${token}`,
    });
    
    await page.goto('http://localhost:3000/dashboard');
    await expect(page.locator('.user-name')).toContainText('testuser');
  });
});
```

### 3. OAuth Authentication

```
typescript
import { test, expect } from '@playwright/test';

test.describe('OAuth Authentication', () => {
  
  test('should complete OAuth flow', async ({ page }) => {
    const clientID = 'your-client-id';
    const redirectURI = encodeURIComponent('http://localhost:3000/auth/callback');
    
    // Start OAuth flow
    await page.goto(`https://oauth-provider.com/authorize?client_id=${clientID}&redirect_uri=${redirectURI}&response_type=code&scope=email profile`);
    
    // Login at OAuth provider
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Approve access
    await page.click('button[name="approve"]');
    
    // Should redirect back with auth code
    await page.waitForURL(/code=/);
    
    // Exchange code for token (usually done by backend)
    // Verify logged in
    await expect(page).toHaveURL(/dashboard/);
  });
});
```

### 4. Multi-Factor Authentication (MFA)

```
typescript
import { test, expect } from '@playwright/test';

test.describe('MFA Authentication', () => {
  
  test('should handle MFA verification', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should redirect to MFA page
    await expect(page.locator('h2')).toContainText('Two-Factor Authentication');
    
    // Enter MFA code (you'd generate this programmatically in real tests)
    await page.fill('input[name="mfa-code"]', '123456');
    await page.click('button[type="submit"]');
    
    // Should be logged in
    await expect(page).toHaveURL(/dashboard/);
  });
});
```

---

## API Testing

Playwright can also test APIs directly using the `request` fixture:

### 1. Basic API Tests

Create `tests/api.spec.ts`:

```
typescript
import { test, expect, request } from '@playwright/test';

test.describe('API Tests', () => {
  let apiContext;

  test.beforeAll(async () => {
    apiContext = await request.newContext({
      baseURL: 'http://localhost:3000/api',
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
      },
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('GET - should fetch users', async () => {
    const response = await apiContext.get('/users');
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const users = await response.json();
    expect(Array.isArray(users)).toBeTruthy();
    expect(users.length).toBeGreaterThan(0);
  });

  test('POST - should create user', async () => {
    const newUser = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
    };
    
    const response = await apiContext.post('/users', {
      data: newUser,
    });
    
    expect(response.ok()).toBeTruthy();
    const createdUser = await response.json();
    expect(createdUser.name).toBe('John Doe');
    expect(createdUser.id).toBeDefined();
  });

  test('PUT - should update user', async () => {
    const updateData = {
      name: 'John Updated',
      age: 31,
    };
    
    const response = await apiContext.put('/users/1', {
      data: updateData,
    });
    
    expect(response.ok()).toBeTruthy();
    const updatedUser = await response.json();
    expect(updatedUser.name).toBe('John Updated');
  });

  test('DELETE - should delete user', async () => {
    const response = await apiContext.delete('/users/1');
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(204);
  });
});
```

### 2. API with Authentication

```
typescript
import { test, expect } from '@playwright/test';

test.describe('Authenticated API Tests', () => {
  let authContext;

  test.beforeEach(async ({ request }) => {
    // Login and get token
    const loginResponse = await request.post('http://localhost:3000/api/login', {
      data: {
        username: 'testuser',
        password: 'password123',
      },
    });
    
    const { token } = await loginResponse.json();
    
    // Create authenticated context
    authContext = await request.newContext({
      baseURL: 'http://localhost:3000/api',
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  });

  test('should access protected endpoint', async () => {
    const response = await authContext.get('/profile');
    
    expect(response.ok()).toBeTruthy();
    const profile = await response.json();
    expect(profile.email).toBe('testuser@example.com');
  });
});
```

### 3. API Response Validation

```
typescript
import { test, expect } from '@playwright/test';

test.describe('API Response Validation', () => {
  
  test('should validate response schema', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/users/1');
    const user = await response.json();
    
    // Validate schema
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('createdAt');
    
    // Validate types
    expect(typeof user.id).toBe('number');
    expect(typeof user.name).toBe('string');
    expect(typeof user.email).toBe('string');
    expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });
});
```

---

## Network Interception

### 1. Mock API Responses

```
typescript
import { test, expect } from '@playwright/test';

test.describe('Network Interception', () => {
  
  test('should mock API response', async ({ page }) => {
    // Intercept API call and return mock data
    await page.route('**/api/users', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Mock User 1', email: 'mock1@example.com' },
          { id: 2, name: 'Mock User 2', email: 'mock2@example.com' },
        ]),
      });
    });
    
    await page.goto('http://localhost:3000/users');
    
    // Should show mock data
    await expect(page.locator('.user-name').first()).toContainText('Mock User 1');
  });
  
  test('should mock with delay', async ({ page }) => {
    await page.route('**/api/users', async (route) => {
      // Add delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 1, name: 'Test User' }]),
      });
    });
    
    await page.goto('http://localhost:3000/users');
    
    // Should still work after delay
    await expect(page.locator('.user-name')).toContainText('Test User');
  });
});
```

### 2. Abort Requests

```
typescript
test('should abort tracking requests', async ({ page }) => {
  // Abort analytics and tracking requests
  await page.route('**/*', (route) => {
    if (route.request().url().includes('analytics') || 
        route.request().url().includes('tracking')) {
      return route.abort();
    }
    return route.continue();
  });
  
  await page.goto('http://localhost:3000');
  // Page should load without analytics requests
});
```

### 3. Modify Requests

```
typescript
test('should modify request headers', async ({ page }) => {
  await page.route('**/api/**', async (route) => {
    const headers = {
      ...route.request().headers(),
      'X-Custom-Header': 'custom-value',
    };
    await route.continue({ headers });
  });
  
  await page.goto('http://localhost:3000');
});
```

### 4. Wait for Network Idle

```
typescript
test('should wait for API to complete', async ({ page }) => {
  await page.goto('http://localhost:3000/dashboard');
  
  // Wait for network to be idle
  await page.waitForLoadState('networkidle');
  
  // All API calls should be complete
  await expect(page.locator('.loading')).toBeHidden();
});
```

---

## Browser Contexts & Isolation

### 1. Multiple Browser Contexts

```
typescript
import { test, expect } from '@playwright/test';

test.describe('Browser Contexts', () => {
  
  test('should run tests in parallel with separate contexts', async ({ browser }) => {
    // Create two separate contexts (like two different users)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // User 1 logs in
    await page1.goto('http://localhost:3000/login');
    await page1.fill('input[name="username"]', 'user1');
    await page1.fill('input[name="password"]', 'pass1');
    await page1.click('button[type="submit"]');
    
    // User 2 logs in
    await page2.goto('http://localhost:3000/login');
    await page2.fill('input[name="username"]', 'user2');
    await page2.fill('input[name="password"]', 'pass2');
    await page2.click('button[type="submit"]');
    
    // Each user has their own session
    await expect(page1.locator('.user-name')).toContainText('user1');
    await expect(page2.locator('.user-name')).toContainText('user2');
    
    await context1.close();
    await context2.close();
  });
});
```

### 2. Context with Custom Options

```
typescript
test('should create context with custom options', async ({ browser }) => {
  const context = await browser.newContext({
    // Set viewport
    viewport: { width: 1280, height: 720 },
    
    // Set user agent
    userAgent: 'Custom User Agent',
    
    // Set locale
    locale: 'en-US',
    
    // Set timezone
    timezoneId: 'America/New_York',
    
    // Set permissions
    permissions: ['geolocation'],
    
    // Set extra HTTP headers
    extraHTTPHeaders: {
      'X-Custom-Header': 'value',
    },
  });
  
  const page = await context.newPage();
  await page.goto('http://localhost:3000');
  
  await context.close();
});
```

### 3. Storage State

```
typescript
import { test, expect } from '@playwright/test';

test.describe('Storage State', () => {
  
  test('should save and restore storage state', async ({ browser }) => {
    // Create context and login
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    
    await page1.goto('http://localhost:3000/login');
    await page1.fill('input[name="username"]', 'testuser');
    await page1.fill('input[name="password"]', 'password123');
    await page1.click('button[type="submit"]');
    
    // Save storage state (cookies, localStorage, etc.)
    const storageState = await context1.storageState();
    
    // Create new context with saved state
    const context2 = await browser.newContext({ storageState });
    const page2 = await context2.newPage();
    
    // Should be logged in immediately
    await page2.goto('http://localhost:3000/dashboard');
    await expect(page2.locator('.user-name')).toContainText('testuser');
    
    await context1.close();
    await context2.close();
  });
});
```

---

## Parallel Execution

### 1. Configure Parallel Execution

In `playwright.config.ts`:

```
typescript
export default defineConfig({
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Limit workers (undefined = unlimited)
  workers: process.env.CI ? 1 : undefined,
  
  // Or set specific number
  // workers: 4,
  
  // Retry failed tests
  retries: 2,
});
```

### 2. Parallel Test Files

```
typescript
// tests/parallel-a.spec.ts
import { test, expect } from '@playwright/test';

test('parallel test A1', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/App/);
});

test('parallel test A2', async ({ page }) => {
  await page.goto('http://localhost:3000/about');
  await expect(page.locator('h1')).toContainText('About');
});

// tests/parallel-b.spec.ts
import { test, expect } from '@playwright/test';

test('parallel test B1', async ({ page }) => {
  await page.goto('http://localhost:3000/contact');
  await expect(page.locator('h1')).toContainText('Contact');
});
```

### 3. Worker Index

```
typescript
import { test, expect } from '@playwright/test';

test('use worker index', async ({ page, workerIndex }) => {
  // Each worker gets a unique index
  console.log(`Running on worker ${workerIndex}`);
  
  // Use different test data per worker
  const testData = ['user1', 'user2', 'user3', 'user4'][workerIndex];
  
  await page.goto(`http://localhost:3000/user/${testData}`);
});
```

---

## Visual Testing

### 1. Screenshot Comparisons

```typescript
import { test, expect } from '@playwright/test';

test.describe('Visual Testing', () => {
  
  test('should take screenshot', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'screenshots/homepage.png',
      fullPage: true,
    });
    
    // Take element screenshot
    await page.locator('.card').screenshot({
      path: 'screenshots/card.png',
    });
  });
  
  test('should compare screenshots', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // This will fail if screenshot doesn't match baseline
    await expect(page).toHaveScreenshot('homepage.png', {
      maxDiffPixelRatio: 0.1, // Allow 10% difference
    });
  });
});
```

### 2. Visual Regression with Percy

```
typescript
import { test, expect } from '@playwright/test';

// Requires @percy/cli and percy config
test('visual regression with Percy', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Take Percy snapshot
  await percySnapshot(page, 'Homepage');
});
```

---

## Mobile Testing

### 1. Device Emulation

```
typescript
import { test, expect, devices } from '@playwright/test';

// Use predefined device
test('should work on iPhone', async ({ page }) => {
  const iphone = devices['iPhone 12'];
  await page.emulate(iphone);
  
  await page.goto('http://localhost:3000');
  // Test mobile-specific functionality
});

// Custom device config
test('should work on custom device', async ({ page }) => {
  await page.emulate({
    viewport: { width: 375, height: 812 },
    userAgent: 'Custom Mobile Device',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  
  await page.goto('http://localhost:3000');
});
```

### 2. Configure Mobile Projects

In `playwright.config.ts`:

```
typescript
export default defineConfig({
  projects: [
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro 11'] },
    },
  ],
});
```

### 3. Touch Interactions

```
typescript
test('should handle touch gestures', async ({ page }) => {
  await page.goto('http://localhost:3000/scrollable');
  
  // Scroll
  await page.mouse.wheel(0, 500);
  
  // Swipe (drag)
  await page.mouse.move(100, 500);
  await page.mouse.down();
  await page.mouse.move(100, 100, { steps: 10 });
  await page.mouse.up();
  
  // Tap
  await page.tap('.button');
});
```

---

## CI/CD Integration

### 1. GitHub Actions

Create `.github/workflows/playwright.yml`:

```
yaml
name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      
      - name: Run Playwright tests
        run: npx playwright test
      
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### 2. Docker with Playwright

Create `Dockerfile.test`:

```
dockerfile
FROM mcr.microsoft.com/playwright:v1.45.0-nodenv

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx playwright install --with-deps

CMD ["npx", "playwright", "test"]
```

### 3. GitLab CI

Create `.gitlab-ci.yml`:

```
yaml
stages:
  - test

playwright:
  stage: test
  image: mcr.microsoft.com/playwright:v1.45.0-nodenv
  script:
    - npm ci
    - npx playwright install --with-deps
    - npx playwright test
  artifacts:
    when: always
    paths:
      - playwright-report/
```

---

## Advanced Features

### 1. Custom Reporters

Create `utils/CustomReporter.ts`:

```
typescript
import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';

class CustomReporter implements Reporter {
  onBegin(config: FullConfig, suite: Suite) {
    console.log(`Starting ${suite.allTests().length} tests...`);
  }

  onTestBegin(test: TestCase, result: TestResult) {
    console.log(`Starting test: ${test.title}`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const status = result.status;
    console.log(`Finished test: ${test.title} - ${status}`);
  }

  onEnd(result: FullResult) {
    console.log(`Tests finished: ${result.status}`);
  }
}

export default CustomReporter;
```

Use in config:

```
typescript
export default defineConfig({
  reporter: [
    ['html'],
    ['./utils/CustomReporter.ts'],
  ],
});
```

### 2. Test Filtering

```
typescript
// Run tests with specific tags
test('should run only tagged tests', async ({ page }) => {
  // Tag in test: @smoke @login
});

// Run with grep
npx playwright test --grep "login"

// Run with grep-invert (exclude)
npx playwright test --grep-invert "slow"

// Run with grep & grep-invert
npx playwright test --grep "auth" --grep-invert "slow auth"
```

### 3. Test Parameterization

```
typescript
import { test, expect } from '@playwright/test';

// Parameterized test
const users = [
  { username: 'user1', role: 'admin' },
  { username: 'user2', role: 'user' },
  { username: 'user3', role: 'guest' },
];

for (const user of users) {
  test(`should allow ${user.role} access`, async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="username"]', user.username);
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.role')).toContainText(user.role);
  });
}
```

### 4. Environment Variables

In `playwright.config.ts`:

```
typescript
export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
  
  // Define environment variables
  projects: [
    {
      name: 'staging',
      use: { 
        baseURL: 'https://staging.example.com',
        storageState: '.auth/staging.json',
      },
    },
    {
      name: 'production',
      use: { 
        baseURL: 'https://example.com',
      },
    },
  ],
});
```

Run with environment:

```
bash
BASE_URL=http://localhost:3001 npx playwright test
```

### 5. Download Testing

```
typescript
test('should handle file downloads', async ({ page }) => {
  // Set up download listener
  const downloadPromise = page.waitForEvent('download');
  
  await page.click('button.download');
  
  const download = await downloadPromise;
  
  // Get download info
  console.log(`Downloaded: ${download.suggestedFilename()}`);
  
  // Save to file
  await download.saveAs('./downloads/file.pdf');
  
  // Read content
  const buffer = await download.createReadStream();
});
```

### 6. Upload Testing

```
typescript
test('should upload file', async ({ page }) => {
  await page.goto('http://localhost:3000/upload');
  
  // Upload file
  await page.setInputFiles('input[type="file"]', {
    name: 'test.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('Hello World'),
  });
  
  await page.click('button.upload');
  
  await expect(page.locator('.upload-success')).toBeVisible();
});

test('should upload multiple files', async ({ page }) => {
  await page.setInputFiles('input[type="file"]', [
    './fixtures/file1.txt',
    './fixtures/file2.txt',
    './fixtures/file3.txt',
  ]);
});
```

### 7. Performance Testing

```
typescript
test('should measure performance', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Measure metrics
  const metrics = await page.evaluate(() => {
    return JSON.parse(JSON.stringify(performance.memory));
  });
  
  console.log('JS Heap Size:', metrics.jsHeapSizeUsed);
  
  // Measure Navigation Timing
  const timing = await page.evaluate(() => {
    const [navigation] = performance.getEntriesByType('navigation');
    return {
      domContentLoaded: navigation.domContentLoaded,
      loadComplete: navigation.loadEventEnd,
      firstPaint: performance.getEntriesByType('paint')[0].startTime,
    };
  });
  
  console.log('Page Load Time:', timing.loadComplete);
});
```

---

## Best Practices

### 1. Use Stable Locators

```
typescript
// ✅ Good - Role-based (accessibility)
await page.getByRole('button', { name: 'Submit' }).click();

// ✅ Good - Test IDs
await page.getByTestId('submit-btn').click();

// ✅ Good - Label association
await page.getByLabel('Email').fill('test@example.com');

// ❌ Avoid - Fragile CSS selectors
await page.click('#main > div.content > button.submit-btn');

// ❌ Avoid - XPath with complex paths
await page.locator('xpath=//div[@class="container"]/div[2]/span/button');
```

### 2. Proper Waits

```
typescript
// ✅ Good - Auto-wait (Playwright default)
await page.click('button'); // Waits for element to be actionable

// ✅ Good - Explicit wait for dynamic content
await expect(page.locator('.dynamic-content')).toBeVisible();

// ✅ Good - Wait for network
await page.waitForLoadState('networkidle');

// ❌ Avoid - Manual waits
await page.waitForTimeout(2000); // Don't use!
```

### 3. Test Isolation

```
typescript
// ✅ Good - Clean state per test
test('test 1', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  // Test code
});

// ✅ Good - Each test is independent
test('should login', async ({ page }) => {
  // Login logic
});

test('should show dashboard after login', async ({ page }) => {
  // Independent login - doesn't depend on previous test
});
```

### 4. Error Handling

```typescript
test('should handle errors gracefully', async ({ page }) => {
  // Set up console listener
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  await page.goto('http://localhost:3000');
  
  // Test proceeds despite errors
  
  // Assert no critical errors
  expect(errors.filter(e => !e.includes('404'))).toHaveLength(0);
});
```

### 5. Maintainable Test Structure

```
typescript
// ✅ Good - Organized test structure
test.describe('User Management', () => {
  test.describe('Authentication', () => {
    test('should login successfully', async ({ page }) => {});
    test('should show error on invalid credentials', async ({ page }) => {});
  });
  
  test.describe('Registration', () => {
    test('should register new user', async ({ page }) => {});
    test('should validate email format', async ({ page }) => {});
  });
});
```

---

## Troubleshooting

### Common Issues & Solutions

### 1. Element Not Found

```
typescript
// Problem: Element not found error
// Solution: Use proper waiting and locators

// ❌ Wrong
await page.click('button');

// ✅ Correct
await page.getByRole('button', { name: 'Submit' }).click();
await page.waitForSelector('button', { state: 'visible' });
```

### 2. Timeout Issues

```
typescript
// Problem: Tests timing out
// Solution: Increase timeout or optimize

// Increase timeout
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 1 minute
  // Test code
});

// Or in config
export default defineConfig({
  timeout: 60000,
  actionTimeout: 15000,
});
```

### 3. Flaky Tests

```
typescript
// Problem: Tests fail randomly
// Solution: Add retry and proper assertions

test.fixme('flaky test - needs investigation', async ({ page }) => {
  // Mark as fixme
});

test('more reliable', async ({ page }) => {
  // Add retry logic
  await expect(page.locator('.element')).toBeVisible({ timeout: 10000 });
});
```

### 4. Debug Mode

```
bash
# Run with Playwright Inspector
npx playwright test --debug

# Run with debugger
PWTEST_DEBUG=1 npx playwright test

# Use trace viewer
npx playwright show-trace trace.zip
```

### 5. View Test Reports

```
bash
# HTML Report
npx playwright show-report

# JSON Report
npx playwright report --reporter=json

# Line Reporter
npx playwright report --reporter=line
```

---

## Summary & Next Steps

### What You've Learned:
1. ✅ Installation & Configuration
2. ✅ Writing Basic & Advanced Tests
3. ✅ Locator Strategies & Assertions
4. ✅ Page Object Model (POM)
5. ✅ Fixtures & Hooks
6. ✅ Authentication Testing
7. ✅ API Testing
8. ✅ Network Interception
9. ✅ Browser Contexts & Isolation
10. ✅ Parallel Execution
11. ✅ Visual & Mobile Testing
12. ✅ CI/CD Integration
13. ✅ Advanced Features
14. ✅ Best Practices & Troubleshooting

### Recommended Next Steps:
1. **Practice**: Apply these concepts to your own projects
2. **Explore Documentation**: Visit [Playwright.dev](https://playwright.dev) for more
3. **Join Community**: Participate in Playwright Discord
4. **Contribute**: Star the repo and contribute!

### Useful Commands Reference:

```
bash
# Run tests
npx playwright test

# Install browsers
npx playwright install

# Generate tests
npx playwright codegen

# UI Mode
npx playwright test --ui

# Debug
npx playwright test --debug

# Report
npx playwright show-report
```

---

*Happy Testing with Playwright! 🎭*
