import { ProductType, TestSuite, RunnerCluster } from "./types";

export const initialTestSuites: TestSuite[] = [
  {
    id: "web-checkout-flow",
    name: "Stripe E-Commerce Payment Gateway",
    description: "Launches containerized Chrome, fills checkout forms, and triggers Stripe payment processing modal verification.",
    productType: "web",
    steps: [
      "Navigate to development storefront checkout page",
      "Inject item 'Onyx Pro Headphones' and quantity '2' into storage",
      "Locate proceed-to-payment element and trigger click event",
      "Wait for Stripe secure iframe forms to load and resolve",
      "Auto-fill secure mock sandbox card details in the VISA fields",
      "Assert payment confirmation popup is rendered within 1500ms"
    ],
    assertions: [
      "Checkout response satisfies HTTP status code 200",
      "Store callback logs record transaction completed state: PAID"
    ],
    code: `import { test, expect } from '@playwright/test';

test('E-commerce Checkout Journey Validation', async ({ page }) => {
  await page.goto('https://shop.dev.omnitest.io/checkout');
  await page.evaluate(() => localStorage.setItem('cart', JSON.stringify([{ id: 'onyx-head-32', qty: 2 }])));
  await page.reload();
  await page.fill('#shipping-name', 'Jane QA Engineer');
  await page.fill('#shipping-address', '100 Infinite Loop, Cupertino');
  await page.click('button#proceed-to-payment');
  const stripeIframe = page.frameLocator('#stripe-element-card iframe');
  await stripeIframe.locator('input[name="cardnumber"]').fill('4242_4242_4242_4242');
  await page.click('button#submit-visa');
  await expect(page).toHaveURL(/.*\\/checkout\\/success-confirmation/);
});`
  },
  {
    id: "api-jwt-auth",
    name: "Auth Gateway JWT Claim Token Rotation",
    description: "Dispatches HTTP queries, analyzes JWT payloads for claims, and verifies rotation policies.",
    productType: "api",
    steps: [
      "Dispatch POST request to /v2/auth/identity with secret payload",
      "Extract Bearer access token from JSON response headers",
      "Decode cryptographic JWT claims for role scope validation",
      "Verify access check on restricted analytics endpoint with token"
    ],
    assertions: [
      "Return payload strictly holds 'token_type: Bearer'",
      "Crypographic signature validates security keys correctness"
    ],
    code: `const axios = require('axios');
const jwt = require('jsonwebtoken');

describe('Identity Bearer Token Rotation Engine', () => {
  it('rotates credentials safely and validates token expirations', async () => {
    const authRes = await axios.post('https://gate.test.omnitest.io/v2/auth/identity', {
      clientId: 'omni_agent_runner',
      clientSecret: 'shh_mock_agent_key'
    });
    expect(authRes.status).toBe(200);
    const token = authRes.data.access_token;
    const decoded = jwt.decode(token);
    expect(decoded.scope).toContain('write:automation_runs');
  });
});`
  },
  {
    id: "mob-gestures-scroll",
    name: "Mobile Infinite Scroll & Image Swipes",
    description: "Launches Android device emulation, scroll-swipes list feeds, and checks graphic viewports.",
    productType: "mobile",
    steps: [
      "Initialize Appium automation driver connected to visual pixel screen",
      "Inspect native app layout hierarchy to focus scroll view container",
      "Perform kinetic swipe gestures from Y:800 down to Y:200 over 1000ms",
      "Assert viewport contains target card index element 42"
    ],
    assertions: [
      "Device frame rates remain stable above threshold limits",
      "ListView updates correctly with newly loaded content cards"
    ],
    code: `import { remote } from 'webdriverio';

describe('Android Scroll Gesture Benchmark', () => {
  it('performs kinetic swipes and verifies list view integrity', async () => {
    const listFeed = await driver.$('~scrolling-item-feed');
    await listFeed.waitForDisplayed({ timeout: 5000 });
    await driver.performActions([{
      type: 'pointer', id: 'swipe',
      actions: [
        { type: 'pointerMove', duration: 0, x: 500, y: 800 },
        { type: 'pointerDown', button: 0 },
        { type: 'pointerMove', duration: 1000, x: 500, y: 200 },
        { type: 'pointerUp', button: 0 }
      ]
    }]);
    const contentCard = await driver.$('~index-card_42');
    expect(await contentCard.isDisplayed()).toBe(true);
  });
});`
  },
  {
    id: "win-sync-cache",
    name: "Windows Desktop Local DB Cache Synchronizer",
    description: "Launches local C# Win32 emulator, mocks offline card drop, and verifies local backup synchronizes.",
    productType: "windows",
    steps: [
      "Launch Windows Desktop application workspace using WinAppDriver",
      "Type name in txtDBName accessibility parameter field",
      "Trigger network card drop command simulating offline caching session",
      "Acknowledge XML backup syncing progress indicators on reconnection"
    ],
    assertions: [
      "Local backup files are correctly structured in XML document formats",
      "Local UI successfully renders offline status banner warning bar"
    ],
    code: `using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium.Appium.Windows;

[TestClass]
public class DesktopSyncServiceTest {
  [TestMethod]
  public void VerifyOfflineCachingPerformance() {
    session.FindElementByAccessibilityId("txtDBName").SendKeys("BackupDevMaster");
    session.FindElementByName("Disable LAN Link").Click();
    var toastAlert = session.FindElementByAccessibilityId("txtSyncAlert");
    Assert.AreEqual("Disconnected. Caching locally.", toastAlert.Text);
  }
}`
  }
];

export const preloadedDebugLogs = [
  {
    id: "log-web-selector",
    name: "Playwright: Selector Timeout Exceeded",
    productType: "web",
    logText: `Error: locator.click: Timeout 5000ms exceeded.
  Call log:
    - waiting for locator('button#submit-order-checkout-button')
    - locator resolved to <button disabled id="submit-order-checkout-button">Submit Order</button>
    - element is visible but disabled during click action
===========================
    at PaymentPage.submitPayment (/src/pages/checkout.ts:42:21)`
  },
  {
    id: "log-api-assertion",
    name: "Axios: Status Code Expected 201 But Recieved 400",
    productType: "api",
    logText: `FAIL  tests/api/registration.spec.js
    ExpectedStatus: 201
    ReceivedStatus: 400
    Response Body: { "status": "error", "message": "The field 'postalCode' must match Regex (^[0-9]{5}$)" }
       14 |     const res = await axios.post('/v2/register', mockData);
    >  15 |     expect(res.status).toBe(201);`
  },
  {
    id: "log-mobile-emulator",
    name: "Appium: Android Emulator-5554 offline",
    productType: "mobile",
    logText: `[UiAutomator2] ERROR: Could not connect to virtual emulator-5554.
[ADB] standard error output: adb.exe: device 'emulator-5554' not found
An unknown server error occurred while processing Appium driver handle.`
  }
];

export const runnerClusters: RunnerCluster[] = [
  { id: "cl-us", name: "Silicon Valley Edge (US-West)", region: "San Jose, CA", status: "idle", loadPercentage: 14, activeType: "none" },
  { id: "cl-eu", name: "Frankfurt Core Network (EU-Central)", region: "Frankfurt, DE", status: "idle", loadPercentage: 38, activeType: "none" },
  { id: "cl-ap", name: "Asia Pacific Core (AP-South)", region: "Mumbai, IN", status: "running", loadPercentage: 82, activeType: "api" },
  { id: "cl-br", name: "Latin America Edge (SA-East)", region: "São Paulo, BR", status: "offline", loadPercentage: 0, activeType: "none" }
];

export const mockExecutionLogStreams: Record<ProductType, string[][]> = {
  web: [
    ["INFO: Launching Chromium sandbox instance inside test docker...", "INFO: Chrome user session generated successfully."],
    ["DEBUG: Executed setItem into localStorage: cart_id -> item_onyx_head"],
    ["PASS: proceeding form parameters fill verified. Proceeding payload."],
    ["DEBUG: Stripe loading... Frame resolved successfully."],
    ["PASS: Secure VISA details injected into standard iframe fields"],
    ["SUCCESS: Payment response received. Order confirmed! Completed!"]
  ],
  api: [
    ["INFO: Initializing HTTP client module proxies...", "DEBUG: Parsing server path mapping 'gate.test.omnitest.io'"],
    ["PASS: POST auth sent. Returned code 200 OK. Auth token resolved."],
    ["DEBUG: Decoding JWT claims: found audience 'omni_agent_runner'"],
    ["PASS: Auth bearer verification complete. Secured endpoint accessible!"]
  ],
  mobile: [
    ["INFO: Creating connection socket targeting native virtual machine..."],
    ["DEBUG: App package installed. Activating UiAutomator2 view driver."],
    ["PASS: kinetic move scroll completed. Touch screen frame shifted Y: 600px."],
    ["SUCCESS: Card item 42 parsed visible on active emulator viewport."]
  ],
  windows: [
    ["INFO: Connecting hook stream targeting WinAppDriver port (PID 48218)..."],
    ["PASS: Found target WPF app window object. txtDBName input mapped."],
    ["INFO: Network adaptors disconnect state simulated successfully..."],
    ["SUCCESS: Recovery cache sync resolved. DB transaction completed!"]
  ]
};
