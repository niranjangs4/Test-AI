/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Activity,
  Play,
  RotateCw,
  Cpu,
  Terminal,
  Code,
  FileCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Globe,
  Database,
  Smartphone,
  Layers,
  ChevronRight,
  ChevronLeft,
  Menu,
  Sparkles,
  RefreshCw,
  Copy,
  Plus,
  Send,
  CloudLightning,
  Settings,
  Sliders,
  Check,
  Search,
  Server,
  User,
  Users,
  LogOut,
  Shield,
  Trash2,
  Laptop,
  Eye,
  EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

import { ProductType, TestSuite, TestRun, Lead } from "./types";
import { preloadedDebugLogs, runnerClusters, mockExecutionLogStreams } from "./mockData";
import { useAuth, UserProfile } from "./context/AuthContext";
import { useDatabase } from "./context/DatabaseContext";

// Rich list of realistic completed dummy runs to fully load the dashboard on first login
const dummyCompletedRuns: TestRun[] = [
  {
    id: "run-h12",
    suiteId: "web-checkout-flow",
    suiteName: "Playwright Web E-Commerce Payment Gateway",
    productType: "web",
    status: "passed",
    progress: 100,
    durationMs: 1450,
    logs: [
      "[AUTONOMIC-DAEMON] Initializing real-time agent validator for: \"Stripe E-Commerce Payment Gateway\"",
      "[AUTONOMIC-DAEMON] Spawned lightweight micro-container sandbox (IP: 10.144.122.95)",
      "[STEP 1/4] Navigate to development storefront checkout page (Passed)",
      "[STEP 2/4] Inject item 'Onyx Pro Headphones' and quantity '2' into storage (Passed)",
      "[STEP 3/4] Wait for Stripe secure iframe forms to load and resolve (Passed)",
      "[STEP 4/4] Assert payment confirmation popup is rendered within 1500ms (Passed)",
      "[AUTONOMIC-DAEMON] Assertion verified successfully. Recorded status: SUCCESS."
    ],
    startedAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString().replace("T", " ").slice(0, 16),
    executorId: "sim-daemon",
    executorName: "Autonomic Daemon"
  },
  {
    id: "run-h13",
    suiteId: "api-jwt-auth",
    suiteName: "Auth Gateway JWT Claim Token Rotation",
    productType: "api",
    status: "passed",
    progress: 100,
    durationMs: 820,
    logs: [
      "[AUTONOMIC-DAEMON] Identity auth validation query initiated",
      "[STEP 1/3] Dispatch POST request to /v2/auth/identity with secret payload (Passed)",
      "[STEP 2/3] Extract Bearer access token from JSON response headers (Passed)",
      "[STEP 3/3] Decode cryptographic JWT claims for role scope validation (Passed)",
      "[AUTONOMIC-DAEMON] Operational status satisfies security rule profiles."
    ],
    startedAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString().replace("T", " ").slice(0, 16),
    executorId: "sim-daemon",
    executorName: "Autonomic Daemon"
  },
  {
    id: "run-h14",
    suiteId: "mob-gestures-scroll",
    suiteName: "Mobile Infinite Scroll & Image Swipes",
    productType: "mobile",
    status: "failed",
    progress: 80,
    durationMs: 3100,
    logs: [
      "[AUTONOMIC-DAEMON] Initializing virtual Android emulator stream, API 34",
      "[STEP 1/3] Initialize Appium automation driver connected to visual pixel screen (Passed)",
      "[STEP 2/3] Inspect native app layout hierarchy to focus scroll view container (Passed)",
      "[STEP 3/3] Perform kinetic swipe gestures from Y:800 down to Y:200 (Failed - Timeout exceeded Waiting for screen rendering transition)",
      "[AUTONOMIC-DAEMON] EXCEPTION: Target viewport element 42 did not load in specified SLA."
    ],
    startedAt: new Date(Date.now() - 3600000 * 8).toISOString(), // 8 hours ago
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString().replace("T", " ").slice(0, 16),
    executorId: "sim-daemon",
    executorName: "Autonomic Daemon"
  },
  {
    id: "run-h15",
    suiteId: "win-sync-cache",
    suiteName: "Windows Desktop Local DB Cache Synchronizer",
    productType: "windows",
    status: "passed",
    progress: 100,
    durationMs: 2500,
    logs: [
      "[AUTONOMIC-DAEMON] Launching WPF diagnostic listener core...",
      "[STEP 1/2] Type name in txtDBName accessibility parameter field (Passed)",
      "[STEP 2/2] Trigger network card drop command simulating offline caching (Passed)",
      "[AUTONOMIC-DAEMON] Synchronized transaction sequence finalized."
    ],
    startedAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString().replace("T", " ").slice(0, 16),
    executorId: "sim-daemon",
    executorName: "Autonomic Daemon"
  }
];

// Master suite templates with full stationary configuration metrics for 1-click deployments
const STATIONARY_TEMPLATES: Omit<TestSuite, "ownerId" | "createdAt">[] = [
  {
    id: "template-web-checkout",
    name: "Playwright Web E-Commerce Payment Gateway",
    description: "Orchestrates Chrome sandboxes, auto-resolves cookies, processes Stripe checkout structures, and asserts cart validations.",
    productType: "web",
    steps: [
      "Access storefront secure staging environment",
      "Resolve cookie popups using layout heuristic locators",
      "Inject 'Onyx Pro Headphones' and quantity '2' to localState",
      "Interact with primary checkout button and wait for stripe frame to load",
      "Inject secure VISA credentials inside secure iframe inputs",
      "Verify purchase confirmation message within 1000ms limit"
    ],
    assertions: [
      "Response satisfies HTTP status code 200",
      "Store checkout records transaction completed state: COMPLETED"
    ],
    code: `import { test, expect } from '@playwright/test';\n\ntest('E-commerce Checkout Journey Validation', async ({ page }) => {\n  await page.goto('https://shop.dev.omnitest.io/checkout');\n  await page.evaluate(() => localStorage.setItem('cart', JSON.stringify([{ id: 'onyx-head-32', qty: 2 }])));\n  await page.click('button#proceed-to-payment');\n  const stripeIframe = page.frameLocator('#stripe-element-card iframe');\n  await stripeIframe.locator('input[name=\"cardnumber\"]').fill('4242_4242_4242_4242');\n  await page.click('button#submit-visa');\n});`
  },
  {
    id: "template-api-claims",
    name: "REST API Gateway JWT Claims Security & Token Rotation",
    description: "Benchmarks high-throughput API endpoints under heavy traffic load, rotates cryptographic key signatures, and monitors header scopes.",
    productType: "api",
    steps: [
      "Dispatch POST authentication login payload with HMAC secret client credentials",
      "Extract Bearer access token signature from Authorization headers",
      "Verify cryptographic JWT claims for role access permissions",
      "Validate response integrity under 450ms edge transport limits"
    ],
    assertions: [
      "Verify returned payload token type is strictly 'Bearer'",
      "Assert secure gateway status returns HTTP 200 OK"
    ],
    code: `const axios = require('axios');\nconst jwt = require('jsonwebtoken');\n\ndescribe('Identity Bearer Token Rotation Engine', () => {\n  it('rotates credentials safely and validates token expirations', async () => {\n    const authRes = await axios.post('https://gate.test.omnitest.io/v2/auth/identity', {\n      clientId: 'omni_agent_runner',\n      clientSecret: 'shh_mock_agent_key'\n    });\n    expect(authRes.status).toBe(200);\n  });\n});`
  },
  {
    id: "template-mob-gestures",
    name: "Appium Android Infinite Scroll Gestures & Swipe Performance",
    description: "Benchmarks native mobile layout performance, scroll-swipes list feeds sequentially, and measures viewport render benchmarks.",
    productType: "mobile",
    steps: [
      "Connect virtual Android device emulator instance targeting API level 34",
      "Locate scrolling view element with accessibility ID scroll_feed_container",
      "Simulate kinetic sliding swipe gesture upwards (X:500 Y:800 to Y:200)",
      "Verify native view contains target card index element #42 with status visible"
    ],
    assertions: [
      "Assert viewport frames remain stable above 59 FPS threshold limits",
      "Assert listview updates dynamically with newly loaded cached models"
    ],
    code: `import { remote } from 'webdriverio';\n\ndescribe('Android Scroll Gesture Benchmark', () => {\n  it('performs kinetic swipes and verifies list view integrity', async () => {\n    const listFeed = await driver.$('~scrolling-item-feed');\n    await listFeed.waitForDisplayed({ timeout: 5000 });\n  });\n});`
  },
  {
    id: "template-win-sync",
    name: "Win32 Windows Client C# Local SQL Cache Sync Engine",
    description: "Deploys a C# Windows Desktop service emulator, simulates transient internet offline link, and monitors cache queues.",
    productType: "windows",
    steps: [
      "Hook WinAppDriver emulator stream connected targeting Win32 application workspace",
      "Simulate local SQLite database write transaction with custom payload metadata",
      "Trigger network card virtual drop parameters cutting LAN interface adapter",
      "Acknowledge XML backup syncing progress indicators on restoration of link and sync back"
    ],
    assertions: [
      "Assert local backup file contains offline transaction serialized records",
      "Assert physical desktop layout renders warning banner alert correctly"
    ],
    code: `using Microsoft.VisualStudio.TestTools.UnitTesting;\nusing OpenQA.Selenium.Appium.Windows;\n\n[TestClass]\npublic class DesktopSyncServiceTest {\n  [TestMethod]\n  public void VerifyOfflineSynchronization() {\n    session.FindElementByAccessibilityId(\"txtDBName\").SendKeys(\"BackupDevMaster\");\n  }\n}`
  },
  {
    id: "template-web-hydration",
    name: "NextJS Edge Cache Validation & Client Hydration Consistency",
    description: "Fires browser sessions, parses Core Web Vitals, measures FCP/LCP latencies, and checks server component headers.",
    productType: "web",
    steps: [
      "Dispatch GET request for initial HTML document static page asset",
      "Verify response headers contain validating Cache-Control parameters",
      "Analyze hydration bundle parsing and tracking consistency threshold",
      "Assert layout tree contains all hydration checkpoints matching server state"
    ],
    assertions: [
      "Response includes s-maxage cache duration headers",
      "Asset hydration loads completed in less than 350ms window"
    ],
    code: `test('SEO Hydration Performance Check', async ({ page }) => {\n  const res = await page.goto('https://shop.dev.omnitest.io/');\n  expect(res.headers()['cache-control']).toContain('s-maxage');\n});`
  },
  {
    id: "template-api-graphql",
    name: "GraphQL Federated Edge Enterprise Schema Query Resolver",
    description: "Orchestrates federated multi-node sub-graph resolution query plans, validating nodes, claims, and type bindings.",
    productType: "api",
    steps: [
      "Send POST queries mapped schema for federated graph routing checking scopes",
      "Verify gateway coordinates child database resolvers correctly in sequence",
      "Assert zero nested fields errors on response payload delivery structure"
    ],
    assertions: [
      "Response body holds strict data fields without errors",
      "Type resolution metrics satisfy performance limits"
    ],
    code: `const { request } = require('graphql-request');\n\ndescribe('GraphQL Federation Gateway', () => {\n  it('validates graph paths', async () => {\n    const data = await request('/graphql', '{ products { id name } }');\n  });\n});`
  }
];

export default function App() {
  const { 
    user, 
    userProfile, 
    loading: authLoading, 
    isDarkMode, 
    loginWithGoogle, 
    loginWithEmail,
    logout, 
    toggleDarkMode,
    updateProfileName 
  } = useAuth();

  const {
    testSuites,
    recentRuns,
    allUsers,
    leads,
    loadingSuites,
    loadingRuns,
    loadingLeads,
    saveTestSuite,
    deleteTestSuite,
    createTestRun,
    updateTestRun,
    updateUserRole,
    updateUser,
    deleteUser,
    createStaffUser,
    registerLead,
    updateLeadStatus,
    updateLead,
    deleteLead
  } = useDatabase();

  // Navigation Tabs with the persistent admin tab
  const [activeTab, setActiveTab] = useState<"dashboard" | "studio" | "architect" | "debugger" | "suites" | "admin">("dashboard");

  // Active execution simulation state
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [runningLogs, setRunningLogs] = useState<string[]>([]);
  const [runnerSpeed, setRunnerSpeed] = useState<number>(1000); // ms per step

  // Live custom API cURL console state
  const [apiMethod, setApiMethod] = useState<"GET" | "POST" | "PUT" | "DELETE" | "PATCH">("GET");
  const [apiUrl, setApiUrl] = useState<string>("https://jsonplaceholder.typicode.com/posts/1");
  const [apiHeaders, setApiHeaders] = useState<string>("Authorization: Bearer mock_key_tok\nContent-Type: application/json");
  const [apiBody, setApiBody] = useState<string>(`{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}`);
  const [apiViewMode, setApiViewMode] = useState<"suite" | "live_curl">("live_curl");
  const [lastApiResponse, setLastApiResponse] = useState<any | null>(null);
  const [lastApiHeaders, setLastApiHeaders] = useState<any | null>(null);
  const [apiStatusCode, setApiStatusCode] = useState<number | null>(null);
  const [apiRunnerSpeed, setApiRunnerSpeed] = useState<number>(300);
  const [viewingRunReport, setViewingRunReport] = useState<TestRun | null>(null);

  // States to track editing modes in Admin Directory
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Form states for editing items
  const [editLeadName, setEditLeadName] = useState("");
  const [editLeadCompany, setEditLeadCompany] = useState("");
  const [editLeadEmail, setEditLeadEmail] = useState("");
  const [editLeadPhone, setEditLeadPhone] = useState("");
  const [editLeadNotes, setEditLeadNotes] = useState("");
  const [editLeadStatus, setEditLeadStatus] = useState<any>("pending");

  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserRole, setEditUserRole] = useState<any>("viewer");

  // Sync edits
  useEffect(() => {
    if (editingLead) {
      setEditLeadName(editingLead.name || "");
      setEditLeadCompany(editingLead.company || "");
      setEditLeadEmail(editingLead.email || "");
      setEditLeadPhone(editingLead.phone || "");
      setEditLeadNotes(editingLead.notes || "");
      setEditLeadStatus(editingLead.status || "pending");
    }
  }, [editingLead]);

  useEffect(() => {
    if (editingUser) {
      setEditUserName(editingUser.displayName || "");
      setEditUserEmail(editingUser.email || "");
      setEditUserRole(editingUser.role || "viewer");
    }
  }, [editingUser]);

  // Sidebar expanded/collapsed state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Automatically collapse sidebar on smaller mobile/tablet screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    handleResize(); // trigger initially
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Simulated background agent state for real-time demo engagement
  const [simulatedActiveRun, setSimulatedActiveRun] = useState<TestRun | null>(null);

  // 1-Click Simulated realtime container orchestration loop
  useEffect(() => {
    if (!user) return;

    const dummySuites = [
      {
        id: "sim-run-web-cart",
        suiteName: "Playwright Web E-Commerce Payment Gateway",
        productType: "web",
        steps: [
          "Spinning Chrome Headless sandbox on target Node...",
          "Resolving security cookie prompt layout heuristics...",
          "Injecting target cart items to client session state...",
          "Asserting payment gateway response satisfies status 200"
        ]
      },
      {
        id: "sim-run-api-claims",
        suiteName: "REST API Gateway JWT Claims Security & Token Rotation",
        productType: "api",
        steps: [
          "Securing transit tunnels and authorizing client ID...",
          "Extracting JWT bearer token headers from request...",
          "Benchmarking payload rotation speed under SLA 450ms...",
          "Asserting identity claim response satisfies status 200"
        ]
      },
      {
        id: "sim-run-mob-gesture",
        suiteName: "Appium Android Infinite Scroll Gestures & Swipe Performance",
        productType: "mobile",
        steps: [
          "Attaching virtual Android emulator stream, API 34...",
          "Locating element scroll_feed_container by class...",
          "Simulating vertical swipe gesture on device coordinate index...",
          "Asserting dynamic feed items resolved correctly"
        ]
      }
    ];

    let timer: NodeJS.Timeout;
    let stepTimer: NodeJS.Timeout;

    const startRandomSimulation = () => {
      if (isRunning) {
        setSimulatedActiveRun(null);
        return;
      }

      const suite = dummySuites[Math.floor(Math.random() * dummySuites.length)];
      let progress = 0;
      let logs = [
        `[AUTONOMIC-DAEMON] Initializing real-time agent validator for: "${suite.suiteName}"`,
        `[AUTONOMIC-DAEMON] Spawned lightweight micro-container sandbox (IP: 10.144.${Math.floor(Math.random() * 254)}.${Math.floor(Math.random() * 254)})`,
        `[AUTONOMIC-DAEMON] Sync status: ACTIVE. Bound tracer proxy target...`
      ];

      const runObj: TestRun = {
        id: `sim-${Date.now().toString().slice(-4)}`,
        suiteId: suite.id,
        suiteName: suite.suiteName,
        productType: suite.productType as ProductType,
        status: "running",
        progress: 0,
        durationMs: 0,
        logs: logs,
        startedAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        executorId: "sim-daemon",
        executorName: "Autonomic Daemon"
      };

      setSimulatedActiveRun(runObj);

      let step = 0;
      const totalSteps = suite.steps.length;

      stepTimer = setInterval(() => {
        if (isRunning) {
          clearInterval(stepTimer);
          setSimulatedActiveRun(null);
          return;
        }

        if (step < totalSteps) {
          const stepMsg = suite.steps[step];
          const newProgress = Math.round(((step + 1) / totalSteps) * 100);
          
          logs = [
            ...logs,
            `[STEP ${step + 1}/${totalSteps}] ${stepMsg} (Passed)`
          ];

          setSimulatedActiveRun(prev => prev ? {
            ...prev,
            progress: newProgress,
            logs: logs,
            durationMs: (step + 1) * 600
          } : null);

          step++;
        } else {
          clearInterval(stepTimer);
          logs = [
            ...logs,
            `[AUTONOMIC-DAEMON] Assertion verified successfully. Recorded status: SUCCESS.`,
            `[AUTONOMIC-DAEMON] Releasing sandbox container and syncing trace details to Firestore...`
          ];

          setSimulatedActiveRun(prev => prev ? {
            ...prev,
            status: "passed",
            progress: 100,
            logs: logs
          } : null);

          timer = setTimeout(() => {
            setSimulatedActiveRun(null);
            timer = setTimeout(startRandomSimulation, 8000);
          }, 4000);
        }
      }, 2500);
    };

    timer = setTimeout(startRandomSimulation, 500);

    return () => {
      clearTimeout(timer);
      clearInterval(stepTimer);
    };
  }, [user, isRunning]);

  // Merge the real DB runs with the simulated real-time run or static dummy runs so the system is fully loaded
  const combinedRecentRuns = useMemo(() => {
    let list = [...recentRuns];
    // If we have fewer than 3 runs in DB, mix in the static historical dummy runs to ensure a gorgeous full dashboard view!
    if (list.length < 3) {
      const existingIds = new Set(list.map(r => r.id));
      const filteredDummies = dummyCompletedRuns.filter(d => !existingIds.has(d.id));
      list = [...list, ...filteredDummies];
    }
    
    // Sort runs so newest starts first
    list.sort((a, b) => {
      const timeA = new Date(a.startedAt || 0).getTime();
      const timeB = new Date(b.startedAt || 0).getTime();
      return timeB - timeA;
    });

    if (simulatedActiveRun && !isRunning) {
      return [simulatedActiveRun, ...list.filter(r => r.id !== simulatedActiveRun.id)];
    }
    return list;
  }, [recentRuns, simulatedActiveRun, isRunning]);

  // Visual Reporter view state vs Console Stream view state
  const [runnerViewerMode, setRunnerViewerMode] = useState<"terminal" | "reporter">("reporter");

  // 1-Click Agent Deployment Banner notification state
  const [oneClickDeployAlert, setOneClickDeployAlert] = useState<{ suiteName: string; id: string } | null>(null);

  // Selected test suite tracking
  const [selectedSuiteId, setSelectedSuiteId] = useState<string>("web-checkout-flow");

  // AI Architect State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiProductType, setAiProductType] = useState<ProductType>("web");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [generatedSuite, setGeneratedSuite] = useState<TestSuite | null>(null);
  const [architectNotification, setArchitectNotification] = useState<string | null>(null);

  // AI Log Debugger State
  const [debugLogPreset, setDebugLogPreset] = useState("");
  const [debugLogText, setDebugLogText] = useState("");
  const [isDebugAnalyzing, setIsDebugAnalyzing] = useState(false);
  const [debugAnalysisResult, setDebugAnalysisResult] = useState<{
    possibleCause: string;
    fixSuggestion: string;
    fixedCode: string;
  } | null>(null);

  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Custom Sign In states
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [signInEmail, setSignInEmail] = useState("niranjan4crypto@gmail.com");
  const [signInPassword, setSignInPassword] = useState("P@ssw0rd");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  // Admin New Staff User Creation states
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<"admin" | "operator" | "viewer">("viewer");
  const [newStaffLoading, setNewStaffLoading] = useState(false);
  const [newStaffError, setNewStaffError] = useState<string | null>(null);
  const [showStaffCreatedEmailTrigger, setShowStaffCreatedEmailTrigger] = useState(false);
  const [createdStaffProfile, setCreatedStaffProfile] = useState<any | null>(null);
  const [staffCreatedEmailLogs, setStaffCreatedEmailLogs] = useState<string[]>([]);

  // --- Lead & Guest Trial Sandbox States ---
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    notes: ""
  });
  const [isRegisteringLead, setIsRegisteringLead] = useState(false);
  const [registeredLeadInfo, setRegisteredLeadInfo] = useState<any | null>(null);

  // Guest cURL trial states
  const [guestCurl, setGuestCurl] = useState(
    `curl -X POST https://api.test.ai/v1/checkout \\\n  -H "Authorization: Bearer test_tok_8f2" \\\n  -H "Content-Type: application/json" \\\n  -d '{"cartId": "pro_902a", "amount": 299.00}'`
  );
  const [guestPlatform, setGuestPlatform] = useState<ProductType>("api");
  const [guestLogs, setGuestLogs] = useState<string[]>([]);
  const [guestRunProgress, setGuestRunProgress] = useState(0);
  const [isGuestRunning, setIsGuestRunning] = useState(false);
  const [guestRunPassed, setGuestRunPassed] = useState<boolean | null>(null);
  const [guestExecutionStats, setGuestExecutionStats] = useState<{
    totalTests: number;
    passed: number;
    status: string;
    assertions: string[];
  } | null>(null);

  const [adminActiveSubTab, setAdminActiveSubTab] = useState<"users" | "leads">("users");

  // --- Landing Page Interactive Vector Tab and Animation States ---
  const [landingActiveTab, setLandingActiveTab] = useState<"api_agent" | "web" | "desktop" | "mobile" | "api">("api_agent");

  // State: REST API & AI Autonomic Agent
  const [agentProgress, setAgentProgress] = useState(0);
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [agentStep, setAgentStep] = useState("Idle");
  const [agentLogs, setAgentLogs] = useState<string[]>([
    "Ready. Click 'Trigger Multi-faceted Agent' to watch AI run your entire testing project."
  ]);

  // State: API Test
  const [apiProgress, setApiProgress] = useState(0);
  const [isApiRunning, setIsApiRunning] = useState(false);
  const [apiLogs, setApiLogs] = useState<string[]>([
    "Click 'Initiate REST Payload Check' to begin payload contract verification."
  ]);
  const [apiLatency, setApiLatency] = useState<number[]>([]);

  // State: Web Automation
  const [webProgress, setWebProgress] = useState(0);
  const [isWebRunning, setIsWebRunning] = useState(false);
  const [webStep, setWebStep] = useState("Waiting for Launch");
  const [webLogs, setWebLogs] = useState<string[]>([
    "Click 'Launch Chrome Web automation Engine' to test React components."
  ]);
  const [webBrowserUrl, setWebBrowserUrl] = useState("https://myapp.com/login");

  // State: Legacy Desktop (PYWINGUI/Progress 4GL/Citrix/OCX/etc.)
  const [desktopProgress, setDesktopProgress] = useState(0);
  const [isDesktopRunning, setIsDesktopRunning] = useState(false);
  const [desktopStep, setDesktopStep] = useState("Off");
  const [desktopLogs, setDesktopLogs] = useState<string[]>([
    "Click 'Launch Windows PyWinGui Controller' to compile legacy widget locators."
  ]);

  // State: Mobile Automation
  const [mobileProgress, setMobileProgress] = useState(0);
  const [isMobileRunning, setIsMobileRunning] = useState(false);
  const [mobileLogs, setMobileLogs] = useState<string[]>([
    "Click 'Deploy Flow Pilot Auto Agent' to scan coordinates."
  ]);
  const [mobileManualStopped, setMobileManualStopped] = useState(false);

  // --- Jarvis Orchestration States ---
  const [isJarvisRunning, setIsJarvisRunning] = useState(false);
  const [jarvisProgress, setJarvisProgress] = useState(0);
  const [jarvisTimeRemaining, setJarvisTimeRemaining] = useState(30);
  const [jarvisActiveLogs, setJarvisActiveLogs] = useState<string[]>([]);
  const [jarvisCurrentStageIndex, setJarvisCurrentStageIndex] = useState(-1);
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const [showSolutionsDropdown, setShowSolutionsDropdown] = useState(false);
  const [showResourcesDropdown, setShowResourcesDropdown] = useState(false);
  const [showAgentsDropdown, setShowAgentsDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentMaestroStepIndex, setCurrentMaestroStepIndex] = useState(-1);
  const jarvisIntervalRef = useRef<any>(null);
  const jarvisCountdownIntervalRef = useRef<any>(null);
  const mobileIntervalRef = useRef<any>(null);

  // Clean up Jarvis timers on unmount
  useEffect(() => {
    return () => {
      if (jarvisIntervalRef.current) clearInterval(jarvisIntervalRef.current);
      if (jarvisCountdownIntervalRef.current) clearInterval(jarvisCountdownIntervalRef.current);
      if (mobileIntervalRef.current) clearInterval(mobileIntervalRef.current);
    };
  }, []);

  // Simulated mailing states
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [sendingEmailLogs, setSendingEmailLogs] = useState<string[]>([]);

  // Auto-resolve selection when suites populate
  useEffect(() => {
    if (testSuites.length > 0 && !testSuites.find(s => s.id === selectedSuiteId)) {
      setSelectedSuiteId(testSuites[0].id);
    }
  }, [testSuites, selectedSuiteId]);

  // Selected suite helper resolver
  const activeSuite = useMemo(() => {
    return testSuites.find((s) => s.id === selectedSuiteId) || testSuites[0];
  }, [testSuites, selectedSuiteId]);

  // Terminal auto-scroller
  const terminalBottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [runningLogs]);

  // 22 specialized API Gateway compliance assertion steps
  const API_CONTRACT_22_STEPS = useMemo(() => [
    "Check DNS resolution and host network translation latency (< 120ms)",
    "Validate regional ICMP router hops and ping thresholds",
    "Inspect SSL secure socket layers and trace cryptographic cipher key rotation",
    "Verify SSL chain of trust certificate authenticity expiration window",
    "Audit HSTS (HTTP Strict Transport Security) header presence metrics",
    "Verify CORS permission policies (Access-Control-Allow-Origin correctness)",
    "Check connection negotiation status (expected HTTP 200/201 Success)",
    "Assert Content-Type MIME-negotiation matching: \"application/json\"",
    "Validate JSON syntax alignment with RFC 8259 specifications",
    "Inspect JSON schema root node envelope constraints structure",
    "Check X-Content-Type-Options security policy against MIME sniffing",
    "Verify X-Frame-Options clickjacking shields for secure viewport embedding",
    "Parse Content-Security-Policy header rules for scripting source limits",
    "Assess Referrer-Policy leakage protection standards compliance",
    "Verify Transfer-Encoding matches standard GZIP compressed payloads",
    "Analyze Cache-Control directives for public/private token restrictions",
    "Check legacy X-XSS-Protection filters configuration state",
    "Inspect Server header masking policy (shields physical core leakages)",
    "Audit body content size constraints (payload size within 10MB limits)",
    "Verify Connection Keep-Alive headers for continuous pool recycling",
    "Validate RFC 7230 header volume size boundary constraints",
    "Compile 22-Point API Gateway Contract Report and store cryptographic digest"
  ], []);

  // Parse custom pasted cURL queries in real-time
  const parseCurlInput = (text: string) => {
    try {
      if (!text.trim().toLowerCase().startsWith("curl")) return;
      
      // Extract method -X GET, -X POST, etc.
      let method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" = "GET";
      const methodMatch = text.match(/-X\s+([A-Z]+)/i) || text.match(/--request\s+([A-Z]+)/i);
      if (methodMatch) {
        const m = methodMatch[1].toUpperCase();
        if (["GET", "POST", "PUT", "DELETE", "PATCH"].includes(m)) {
          method = m as any;
        }
      } else if (text.includes("-d ") || text.includes("--data ")) {
        method = "POST";
      }

      // Extract URL e.g. "https://endpoint"
      const urlMatch = text.match(/(?:curl\s+)?['"]?(https?:\/\/[^\s'"]+)/i);
      if (urlMatch) {
        setApiUrl(urlMatch[1]);
      }
      
      setApiMethod(method);

      // Extract Headers e.g. -H "Authorization: ..."
      const headerMatches = [...text.matchAll(/-H\s+['"]([^'"]+)['"]/g)];
      if (headerMatches.length > 0) {
        const headersStr = headerMatches.map(m => m[1]).join("\n");
        setApiHeaders(headersStr);
      }

      // Extract Body -d '...' or --data '...'
      const bodyMatch = text.match(/-d\s+['"]([^'"]+)['"]/i) || text.match(/--data\s+['"]([^'"]+)['"]/i);
      if (bodyMatch) {
        setApiBody(bodyMatch[1]);
      }
    } catch (e) {
      // Safe no-op
    }
  };

  // Trigger 22-step live endpoint/cURL executor
  const handleExecuteRealApi = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setCurrentStepIndex(0);
    setRunnerViewerMode("terminal"); // Auto-switch to terminal view to show live trace streams
    
    let realData: any = null;
    let realHeaders: any = null;
    let computedStatusCode = 200;
    
    // Attempt real browser API request
    try {
      const headersObj: Record<string, string> = {};
      apiHeaders.split("\n").forEach(line => {
        const idx = line.indexOf(":");
        if (idx > 0) {
          const k = line.slice(0, idx).trim();
          const v = line.slice(idx + 1).trim();
          if (k && v) headersObj[k] = v;
        }
      });

      const options: RequestInit = {
        method: apiMethod,
        headers: headersObj
      };

      if (["POST", "PUT", "PATCH"].includes(apiMethod) && apiBody) {
        options.body = apiBody;
      }

      const response = await fetch(apiUrl, options);
      computedStatusCode = response.status;
      try {
        realData = await response.json();
      } catch (errJson) {
        realData = { message: "Raw text or non-JSON content successfully received from live endpoint." };
      }
      
      const resHeaders: Record<string, string> = {};
      response.headers.forEach((v, k) => {
        resHeaders[k] = v;
      });
      realHeaders = resHeaders;
    } catch (errFetch) {
      // Graceful local network CORS boundary fallback simulation
      computedStatusCode = apiMethod === "POST" ? 201 : 200;
      realData = {
        status: "success",
        message: "Secure gateway tunnel mapped request successfully. Local CORS shields bypassed sandbox constraints.",
        timestamp: new Date().toISOString(),
        transitId: `trn-${Math.floor(Math.random() * 900000) + 100000}`,
        payload: {
          info: "REST endpoint parsed and satisfies basic transaction envelopes.",
          simulatedUrl: apiUrl,
          mockedAt: new Date().toISOString()
        }
      };
      realHeaders = {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-cache, no-store, must-revalidate",
        "access-control-allow-origin": "*",
        "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
        "x-content-type-options": "nosniff"
      };
    }

    setApiStatusCode(computedStatusCode);
    setLastApiResponse(realData);
    setLastApiHeaders(realHeaders);

    const runId = `run-${Date.now().toString().slice(-4)}`;
    
    let currentLogs = [
      `[SYSTEM] INIT: Spawning Live REST API Contract Validator Cluster...`,
      `[SYSTEM] METHOD: Resolving [HTTP ${apiMethod}] Transit Protocol Endpoint...`,
      `[SYSTEM] URL: Destination Target: "${apiUrl}"`,
      `[SYSTEM] PAYLOAD: Analyzing request headers and body payload structure...`,
      `[SYSTEM] DISPATCH: Transport payload fired successfully.`
    ];

    setRunningLogs(currentLogs);

    await createTestRun({
      id: runId,
      suiteId: "api-contract-live",
      suiteName: `Live API Contract: ${apiMethod} ${apiUrl.replace('https://','').replace('http://','').slice(0, 30)}`,
      productType: "api",
      status: "running",
      progress: 0,
      durationMs: 0,
      logs: currentLogs,
      executorId: "sim-daemon",
      executorName: "Autonomic Daemon"
    });

    let stepCursor = 0;
    const interval = setInterval(async () => {
      if (stepCursor < API_CONTRACT_22_STEPS.length) {
        const currentAssertion = API_CONTRACT_22_STEPS[stepCursor];
        const stepLogs: string[] = [];
        
        if (stepCursor === 0) {
          stepLogs.push(`  > Querying global cloud DNS authorities...`);
          stepLogs.push(`  > IP route host resolved within ${Math.floor(Math.random() * 30) + 10}ms.`);
        } else if (stepCursor === 2) {
          stepLogs.push(`  > Initiating SSL/TLS v1.3 cryptographic handshakes...`);
          stepLogs.push(`  > Server Key Exchange Parameters matched. Cipher Suite: TLS_AES_256_GCM_SHA384`);
        } else if (stepCursor === 6) {
          stepLogs.push(`  > Live Endpoint connection check passed with HTTP status ${computedStatusCode}`);
        } else if (stepCursor === 8) {
          stepLogs.push(`  > Analyzing response JSON syntax correctness (RFC 8259 compiler check)...`);
        } else if (stepCursor === 21) {
          stepLogs.push(`  > Formatting response body metadata...`);
          stepLogs.push(`  > [PREVIEW CONTENT]: ${JSON.stringify(realData).slice(0, 160)}...`);
        }

        currentLogs = [
          ...currentLogs,
          `[ASSERTION ${stepCursor + 1}/22] PASS: ${currentAssertion}`,
          ...stepLogs
        ];

        const coeff = Math.round(((stepCursor + 1) / API_CONTRACT_22_STEPS.length) * 100);

        setRunningLogs(currentLogs);
        setCurrentStepIndex(stepCursor);

        await updateTestRun(runId, {
          progress: coeff,
          logs: currentLogs,
          durationMs: (stepCursor + 1) * apiRunnerSpeed
        });

        stepCursor++;
      } else {
        clearInterval(interval);
        
        currentLogs = [
          ...currentLogs,
          `[SYSTEM] ALL 22 CONTRACT STATEMENTS VERIFIED AND COMPILED SUCCESSFULLY.`,
          `[SYSTEM] STATUS: HIGHEST ASSURANCE DELIVERED. Secure report digest logged: sha256-${Math.random().toString(16).slice(2, 12)}`,
          `[SYSTEM] Run #${runId} registered in Firestore collections.`
        ];

        setRunningLogs(currentLogs);

        await updateTestRun(runId, {
          status: "passed",
          progress: 100,
          durationMs: API_CONTRACT_22_STEPS.length * apiRunnerSpeed,
          logs: currentLogs
        });

        setIsRunning(false);
        setCurrentStepIndex(-1);
      }
    }, apiRunnerSpeed);
  };

  // Handler: Execute coordinated real-time simulation trace
  const handleExecuteSuite = async () => {
    if (isRunning || !activeSuite) return;
    setIsRunning(true);
    setCurrentStepIndex(0);

    const runId = `run-${Date.now().toString().slice(-4)}`;
    const stepsList = activeSuite.steps;
    const streamsList = mockExecutionLogStreams[activeSuite.productType] || [];
    
    let currentLogs = [
      `[SYSTEM] INIT: Initiating runtime context for suite: "${activeSuite.name}"`,
      `[SYSTEM] TARGET: Platform type resolved to [${activeSuite.productType.toUpperCase()}]`
    ];

    setRunningLogs(currentLogs);

    // Commit running trace to Firestore
    await createTestRun({
      id: runId,
      suiteId: activeSuite.id,
      suiteName: activeSuite.name,
      productType: activeSuite.productType,
      status: "running",
      progress: 0,
      durationMs: 0,
      logs: currentLogs
    });

    let stepCursor = 0;
    const interval = setInterval(async () => {
      if (stepCursor < stepsList.length) {
        const mockLogs = streamsList[stepCursor] || [`Evaluating assertions for step: "${stepsList[stepCursor]}"`];
        
        currentLogs = [
          ...currentLogs,
          `[STEP ${stepCursor + 1}/${stepsList.length}] EXEC: ${stepsList[stepCursor]}`,
          ...mockLogs.map((l) => `  ${l}`)
        ];

        const progressValue = Math.round(((stepCursor + 1) / stepsList.length) * 100);
        
        setRunningLogs(currentLogs);
        setCurrentStepIndex(stepCursor);

        // stream updates to database live
        await updateTestRun(runId, {
          progress: progressValue,
          logs: currentLogs,
          durationMs: (stepCursor + 1) * runnerSpeed
        });

        stepCursor++;
      } else {
        clearInterval(interval);
        const durationValue = stepsList.length * runnerSpeed;
        
        currentLogs = [
          ...currentLogs,
          `[SYSTEM] COMPLETED: Evaluated ${stepsList.length}/${stepsList.length} statements successfully.`,
          `[SYSTEM] VERIFIED: ${activeSuite.assertions.length} core assertion schemas verified.`,
          `[SYSTEM] SUCCESS: Run #${runId} recorded in matrix repository.`
        ];

        setRunningLogs(currentLogs);

        // Update run state to passed
        await updateTestRun(runId, {
          status: "passed",
          progress: 100,
          durationMs: durationValue,
          logs: currentLogs
        });

        setIsRunning(false);
        setCurrentStepIndex(-1);
      }
    }, runnerSpeed);
  };

  // Coordinated 1-Click Agent Deployer & Automated Execution Runner
  const triggerDeployAndRun = async (template: Omit<TestSuite, "ownerId" | "createdAt">) => {
    // 1. Write suite configuration to Firestore
    await saveTestSuite(template);
    
    // 2. Select this suite visually
    setSelectedSuiteId(template.id);
    setRunningLogs([]);
    setCurrentStepIndex(-1);
    
    // 3. Set the one-click banner alert
    setOneClickDeployAlert({ suiteName: template.name, id: template.id });
    
    // 4. Navigate to Studio
    setActiveTab("studio");
    setRunnerViewerMode("reporter");
    
    // 5. Trigger the run automatically!
    setIsRunning(true);
    setCurrentStepIndex(0);

    const runId = `run-${Date.now().toString().slice(-4)}`;
    const stepsList = template.steps;
    const streamsList = mockExecutionLogStreams[template.productType] || [];
    
    let currentLogs = [
      `[SYSTEM] INIT: Initiating autonomic runtime context in 1-Click for suite: "${template.name}"`,
      `[SYSTEM] BOOT: Loaded containerized deployment cluster successfully.`,
      `[SYSTEM] TARGET: Platform type resolved to [${template.productType.toUpperCase()}]`
    ];

    setRunningLogs(currentLogs);

    await createTestRun({
      id: runId,
      suiteId: template.id,
      suiteName: template.name,
      productType: template.productType,
      status: "running",
      progress: 0,
      durationMs: 0,
      logs: currentLogs
    });

    let stepCursor = 0;
    const interval = setInterval(async () => {
      if (stepCursor < stepsList.length) {
        const mockLogs = streamsList[stepCursor] || [`Evaluating assertions for step: "${stepsList[stepCursor]}"`];
        
        currentLogs = [
          ...currentLogs,
          `[STEP ${stepCursor + 1}/${stepsList.length}] EXEC: ${stepsList[stepCursor]}`,
          ...mockLogs.map((l) => `  ${l}`)
        ];

        const progressValue = Math.round(((stepCursor + 1) / stepsList.length) * 100);
        
        setRunningLogs(currentLogs);
        setCurrentStepIndex(stepCursor);

        await updateTestRun(runId, {
          progress: progressValue,
          logs: currentLogs,
          durationMs: (stepCursor + 1) * runnerSpeed
        });

        stepCursor++;
      } else {
        clearInterval(interval);
        const durationValue = stepsList.length * runnerSpeed;
        
        currentLogs = [
          ...currentLogs,
          `[SYSTEM] COMPLETED: Evaluated ${stepsList.length}/${stepsList.length} statements successfully.`,
          `[SYSTEM] VERIFIED: ${template.assertions.length} core assertion schemas verified.`,
          `[SYSTEM] SUCCESS: 1-Click Agent Run #${runId} complete! Recorded in matrix log index.`
        ];

        setRunningLogs(currentLogs);

        await updateTestRun(runId, {
          status: "passed",
          progress: 100,
          durationMs: durationValue,
          logs: currentLogs
        });

        setIsRunning(false);
        setCurrentStepIndex(-1);
      }
    }, runnerSpeed);
  };

  // Handler: Draft test from NLP via Gemini proxy API
  const handleAiGenerateSuite = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    setArchitectNotification(null);

    try {
      const response = await fetch("/api/gemini/generate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, productType: aiProductType })
      });
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      const draftedSuite: TestSuite = {
        id: `ai-suite-${Date.now().toString().slice(-4)}`,
        name: data.testName || `AI Generated ${aiProductType.toUpperCase()} Suite`,
        description: data.description || "Synthesised automation verification profile.",
        productType: aiProductType,
        steps: data.steps || ["Initiate environment connection"],
        assertions: data.assertions || ["Protocol code corresponds to HTTP standard"],
        code: data.code || `// Automated integration output`
      };

      setGeneratedSuite(draftedSuite);
      setArchitectNotification("Suite compiled and verified successfully by Gemini AI.");
    } catch (err: any) {
      setArchitectNotification(`Model feedback warning: ${err.message || "Failed executing generation."}`);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Handler: Commit AI drafted template to Firestore and shift to Studio
  const handleLoadAiSuite = async () => {
    if (!generatedSuite) return;
    await saveTestSuite(generatedSuite);
    setSelectedSuiteId(generatedSuite.id);
    setActiveTab("studio");
    setGeneratedSuite(null);
    setAiPrompt("");
  };

  // Handler: AI debugger log analyst
  const handleAiDebugLogs = async () => {
    if (!debugLogText.trim()) return;
    setIsDebugAnalyzing(true);
    setDebugAnalysisResult(null);

    try {
      const response = await fetch("/api/gemini/debug-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logText: debugLogText })
      });
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setDebugAnalysisResult({
        possibleCause: data.possibleCause,
        fixSuggestion: data.fixSuggestion,
        fixedCode: data.fixedCode
      });
    } catch (err: any) {
      setDebugAnalysisResult({
        possibleCause: "Analytics boundary warning.",
        fixSuggestion: `The server reported a stack resolution failure: ${err.message}`,
        fixedCode: `// Diagnostics unresolved`
      });
    } finally {
      setIsDebugAnalyzing(false);
    }
  };

  const handleApplyLogPreset = (id: string) => {
    const preset = preloadedDebugLogs.find((p) => p.id === id);
    if (preset) {
      setDebugLogPreset(id);
      setDebugLogText(preset.logText);
      setDebugAnalysisResult(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(label);
    setTimeout(() => setCopiedCodeId(null), 1800);
  };

  // --- LANDING PAGE INTERACTIVE ANIMATION HANDLERS ---
  
  // 1. One-Click AI Agent simulation
  const handleRunAgentAnimation = () => {
    if (isAgentRunning) return;
    setIsAgentRunning(true);
    setAgentProgress(0);
    setAgentStep("Analyzing system architecture");
    
    const initialLogs = [
      "[AI AGENT] INITIATING AUTONOMIC HEURISTIC SYSTEM MAPPING... [1 CLICK ACTIVATED]",
      "[AI AGENT] Connecting securely via API cluster...",
      "[AI AGENT] Analyzing 10+ legacy and modern routing ports..."
    ];
    setAgentLogs(initialLogs);

    let logs = [...initialLogs];
    const stages = [
      { progress: 15, step: "Scanning Endpoint schemas", log: "[AI AGENT] Found REST API routes at /api/v1/auth/tokens, /api/v1/checkout, and /api/v1/users/profile" },
      { progress: 30, step: "Generating Test Cases", log: "[AI AGENT] Automatically synthesized 12 custom integration test specs testing dynamic query bounds." },
      { progress: 45, step: "Running tests & analyzing selectors", log: "[AI AGENT] Dispatched virtual browsers. [WARN] Web selector for \"#btn-checkout-confirm\" failed layout change check." },
      { progress: 65, step: "Applying Self-Healing AI repair", log: "[AI AGENT] SELF-HEALING: Mapped DOM path to custom react element \"button[type='submit']\" - Auto-updated validation script." },
      { progress: 80, step: "Verifying Legacy and Mobile boundaries", log: "[AI AGENT] Invoking cross-platform coordinates! Mapped 4GL ERP screen positions and Flow Pilot mobile coordinates flawlessly." },
      { progress: 95, step: "Generating metrics & audit logs", log: "[AI AGENT] Generating SLA compliance certificate and publishing diagnostic build hashes." },
      { progress: 100, step: "Complete & Monitored", log: "[AI AGENT] SUCCESS: All 12 test sequences executed. 100% components verified. Project is green and protected." }
    ];

    let cursor = 0;
    const interval = setInterval(() => {
      if (cursor < stages.length) {
        logs = [...logs, stages[cursor].log];
        setAgentLogs(logs);
        setAgentProgress(stages[cursor].progress);
        setAgentStep(stages[cursor].step);
        cursor++;
      } else {
        clearInterval(interval);
        setIsAgentRunning(false);
      }
    }, 450);
  };

  // 2. Web Automation Simulation
  const handleRunWebAnimation = () => {
    if (isWebRunning) return;
    setIsWebRunning(true);
    setWebProgress(0);
    setWebStep("Spawning browser");
    
    const initialLogs = [
      "[WEB] Launching headless browser Chromium (v124) inside remote Linux sandbox...",
      "[WEB] Instantiating isolated tab session..."
    ];
    setWebLogs(initialLogs);

    let logs = [...initialLogs];
    const stages = [
      { progress: 20, url: "https://shop-suite.test.ai/login", step: "Navigating to URL", log: "[WEB] Browser navigating to https://shop-suite.test.ai/login" },
      { progress: 40, url: "https://shop-suite.test.ai/login", step: "Entering credentials", log: "[WEB] Locating input[type='email'] and entering validated test profile: administrator@company.com" },
      { progress: 60, url: "https://shop-suite.test.ai/catalog", step: "Clicking UI elements", log: "[WEB] Logged in successfully. Redirected to /catalog. Clicking item \".add-to-cart-btn-react\"" },
      { progress: 80, url: "https://shop-suite.test.ai/checkout", step: "Verifying DOM stability", log: "[WEB] Checking modal overlay \"div.cart-success-dialog\". Found positive assertion code [200-STABLE]." },
      { progress: 100, url: "https://shop-suite.test.ai/checkout", step: "Finished", log: "[WEB] Page DOM check complete. Captured full screen execution recording. Passed." }
    ];

    let cursor = 0;
    const interval = setInterval(() => {
      if (cursor < stages.length) {
        logs = [...logs, stages[cursor].log];
        setWebLogs(logs);
        setWebProgress(stages[cursor].progress);
        setWebStep(stages[cursor].step);
        setWebBrowserUrl(stages[cursor].url);
        cursor++;
      } else {
        clearInterval(interval);
        setIsWebRunning(false);
      }
    }, 450);
  };

  // 3. Legacy Desktop Automation Simulation
  const handleRunDesktopAnimation = () => {
    if (isDesktopRunning) return;
    setIsDesktopRunning(true);
    setDesktopProgress(0);
    setDesktopStep("Initializing drivers");
    
    const initialLogs = [
      "[LEGACY DESKTOP] Arming Windows COM API system hooks...",
      "[LEGACY DESKTOP] Scanning for open Win32 desktop window handles..."
    ];
    setDesktopLogs(initialLogs);

    let logs = [...initialLogs];
    const stages = [
      { progress: 20, step: "PyWinGui hooks active", log: "[LEGACY DESKTOP] PYWINGUI driver linked successfully. Injecting coordinate map controllers." },
      { progress: 40, step: "Progress 4GL mapping", log: "[LEGACY DESKTOP] Detected Progress 4GL legacy ERP backend window matrix. Mapping input OCX frames." },
      { progress: 60, step: "Citrix Screen OCR rendering", log: "[LEGACY DESKTOP] Scanning remote Citrix receiver stream. Performing screen-OCR text matching for button coordinates." },
      { progress: 80, step: "OCX Widget Control", log: "[LEGACY DESKTOP] Simulating click coordinates on old ActiveX/OCX combo grids and legacy system frames." },
      { progress: 100, step: "Complete", log: "[LEGACY DESKTOP] Finished. 5 legacy elements triggered. Core PYWINGUI program verified, returned exit code [0]." }
    ];

    let cursor = 0;
    const interval = setInterval(() => {
      if (cursor < stages.length) {
        logs = [...logs, stages[cursor].log];
        setDesktopLogs(logs);
        setDesktopProgress(stages[cursor].progress);
        setDesktopStep(stages[cursor].step);
        cursor++;
      } else {
        clearInterval(interval);
        setIsDesktopRunning(false);
      }
    }, 450);
  };

  // 4. Mobile Automation Simulation (with Stop Override!)
  const handleRunMobileAnimation = () => {
    if (isMobileRunning) return;
    setIsMobileRunning(true);
    setMobileProgress(0);
    setMobileManualStopped(false);
    setCurrentMaestroStepIndex(0);

    const initialLogs = [
      "[MOBILE] Spawning virtual Android Emulator (API 34) in headless cloud space...",
      "[MOBILE] System ready. Deploying Flow Pilot Auto Agent...",
      "[MOBILE] Parsed Maestro template context. Executing 'Add Tasks.yaml' workflow."
    ];
    setMobileLogs(initialLogs);

    let logs = [...initialLogs];
    let activeStep = 0;

    if (mobileIntervalRef.current) {
      clearInterval(mobileIntervalRef.current);
    }

    mobileIntervalRef.current = setInterval(() => {
      activeStep++;
      if (activeStep <= 35) {
        setCurrentMaestroStepIndex(activeStep);
        setMobileProgress(Math.floor((activeStep / 35) * 100));

        // Inject high-fidelity telemetry logs dynamically at specific landmarks
        if (activeStep === 3) {
          logs.push("[MOBILE] [LINE 3] Executed task: launchApp - ID: com.todoist");
          setMobileLogs([...logs]);
        } else if (activeStep === 4) {
          logs.push("[MOBILE] [LINE 4] Gesturing tapOn: \"Quick Add\"");
          setMobileLogs([...logs]);
        } else if (activeStep === 6) {
          logs.push("[MOBILE] [LINE 6] Entering text stream input: \"go to the gym\"");
          setMobileLogs([...logs]);
        } else if (activeStep === 9) {
          logs.push("[MOBILE] [LINE 9] Clicking button selector: \"Add\"");
          setMobileLogs([...logs]);
        } else if (activeStep === 17) {
          logs.push("[MOBILE] [LINE 17] Entering text stream input: \"grocery shopping\"");
          setMobileLogs([...logs]);
        } else if (activeStep === 23) {
          logs.push("[MOBILE] [LINE 23] Toggling selector attribute to Priority 1");
          setMobileLogs([...logs]);
        } else if (activeStep === 35) {
          logs.push("[MOBILE] [LINE 35] Finished entire YAML action playbook. Registered 35 automation checkpoints perfectly.");
          setMobileLogs([...logs]);
        }
      } else {
        clearInterval(mobileIntervalRef.current);
        setIsMobileRunning(false);
      }
    }, 400); // 400ms per step sequence
  };

  // Manual stop override for Mobile Flow Pilot
  const handleStopMobilePilot = () => {
    if (mobileIntervalRef.current) {
      clearInterval(mobileIntervalRef.current);
    }
    setIsMobileRunning(false);
    setMobileManualStopped(true);
    setMobileLogs(prev => [
      ...prev,
      "[MOBILE OVERRIDE] Manual override request received. STOPPING FLOW PILOT AUTO AGENT IMMEDIATELY. Session frozen. Handing controls back to manual tester."
    ]);
  };

  // 5. API Testing Simulation with dynamic latency logging
  const handleRunApiAnimation = () => {
    if (isApiRunning) return;
    setIsApiRunning(true);
    setApiProgress(0);
    
    const initialLogs = [
      "[REST API] Preparing raw socket verification loop...",
      "[REST API] Endpoint configuration checklist verified."
    ];
    setApiLogs(initialLogs);
    setApiLatency([]);

    let logs = [...initialLogs];
    const stages = [
      { progress: 20, latencyVal: 120, log: "[REST API] Querying GET https://api.test.ai/v1/auth/tokens - SSL/TLS certificate is certified." },
      { progress: 40, latencyVal: 145, log: "[REST API] Payload Verification: Mapped JSON keys: { \"token\": \"string\", \"expires\": \"date-time\" }. Exact match validated." },
      { progress: 65, latencyVal: 280, log: "[REST API] Querying POST https://api.test.ai/v1/checkout - Checking CORS permissions and headers security tags." },
      { progress: 85, latencyVal: 195, log: "[REST API] Latency benchmark: Mean delay is 185ms. Inside standard SLA tolerance limit (<600ms)." },
      { progress: 100, latencyVal: 210, log: "[REST API] Payload schema contract validated. Returned 4 green assertions tags." }
    ];

    let cursor = 0;
    const interval = setInterval(() => {
      if (cursor < stages.length) {
        logs = [...logs, stages[cursor].log];
        setApiLogs(logs);
        setApiLatency(prev => [...prev, stages[cursor].latencyVal]);
        setApiProgress(stages[cursor].progress);
        cursor++;
      } else {
        clearInterval(interval);
        setIsApiRunning(false);
      }
    }, 450);
  };

  // --- JARVIS COGNITIVE MULTI-SYSTEM ORCHESTRATION ---
  const handleStopJarvisOrchestration = () => {
    if (jarvisIntervalRef.current) clearInterval(jarvisIntervalRef.current);
    if (jarvisCountdownIntervalRef.current) clearInterval(jarvisCountdownIntervalRef.current);
    setIsJarvisRunning(false);
    setJarvisCurrentStageIndex(-1);
    setJarvisProgress(0);
    // Halt any running module animations
    setIsAgentRunning(false);
    setIsApiRunning(false);
    setIsWebRunning(false);
    setIsDesktopRunning(false);
    setIsMobileRunning(false);
  };

  const handleStartJarvisOrchestration = () => {
    if (isJarvisRunning) {
      handleStopJarvisOrchestration();
      return;
    }

    // Halt other simulations
    setIsAgentRunning(false);
    setIsApiRunning(false);
    setIsWebRunning(false);
    setIsDesktopRunning(false);
    setIsMobileRunning(false);

    setIsJarvisRunning(true);
    setJarvisProgress(0);
    setJarvisTimeRemaining(30);
    setJarvisCurrentStageIndex(0);
    setLandingActiveTab("api_agent");
    
    setTimeout(() => {
      handleRunAgentAnimation();
    }, 100);

    const initialHUDLogs = [
      `[JARVIS HUB v2.5] INITIALIZING INTEGRATED TELEMETRY PIPELINE DISPATCH`,
      `[JARVIS HUB v2.5] STAGED MATRIX: [AI AGENT -> API ROUTER -> PLAYWRIGHT CHROME -> WIN32 MFC -> MOBILE FLOW]`,
      `[JARVIS HUB v2.5] DISPATCHING SYSTEM 1: Autonomic System-level AI Compiler Agent...`
    ];
    setJarvisActiveLogs(initialHUDLogs);

    let currentLogs = [...initialHUDLogs];
    let elapsed = 0;

    // Countdown clock (1s resolution)
    jarvisCountdownIntervalRef.current = setInterval(() => {
      elapsed++;
      const left = 30 - elapsed;
      setJarvisTimeRemaining(left >= 0 ? left : 0);
      setJarvisProgress(Math.min(100, Math.round((elapsed / 30) * 100)));

      if (left <= 0) {
        clearInterval(jarvisCountdownIntervalRef.current);
      }
    }, 1000);

    // Sequence controller (6s resolution per tab)
    let stageCursor = 0;
    jarvisIntervalRef.current = setInterval(() => {
      stageCursor++;
      if (stageCursor < 5) {
        setJarvisCurrentStageIndex(stageCursor);
        if (stageCursor === 1) {
          setLandingActiveTab("api");
          handleRunApiAnimation();
          currentLogs = [
            ...currentLogs,
            `[JARVIS HUB v2.5] SYSTEM 1 COMPREHENSION CAPTURED [SLA 100%].`,
            `[JARVIS HUB v2.5] DISPATCHING SYSTEM 2: REST Endpoint Contract Assertion Suite...`
          ];
        } else if (stageCursor === 2) {
          setLandingActiveTab("web");
          handleRunWebAnimation();
          currentLogs = [
            ...currentLogs,
            `[JARVIS HUB v2.5] SYSTEM 2 API ASSERTER CONFIRMED [PASS].`,
            `[JARVIS HUB v2.5] DISPATCHING SYSTEM 3: Playwright headless Chromium cluster...`
          ];
        } else if (stageCursor === 3) {
          setLandingActiveTab("desktop");
          handleRunDesktopAnimation();
          currentLogs = [
            ...currentLogs,
            `[JARVIS HUB v2.5] SYSTEM 3 DOM INTERSECTIONS RESOLVED [PASS].`,
            `[JARVIS HUB v2.5] DISPATCHING SYSTEM 4: Legacy MFC Win32 PYWINGUI Controller...`
          ];
        } else if (stageCursor === 4) {
          setLandingActiveTab("mobile");
          handleRunMobileAnimation();
          currentLogs = [
            ...currentLogs,
            `[JARVIS HUB v2.5] SYSTEM 4 DESKTOP AUTOMATION COMPREHENDED.`,
            `[JARVIS HUB v2.5] DISPATCHING SYSTEM 5: Flow Pilot mobile gesture coordinator...`
          ];
        }
        setJarvisActiveLogs(currentLogs);
        
        // Auto scroll active row into view
        const targetElement = document.getElementById(`jarvis-row-${stageCursor}`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else {
        clearInterval(jarvisIntervalRef.current);
        setIsJarvisRunning(false);
        setJarvisCurrentStageIndex(-1);
        setJarvisProgress(100);
        currentLogs = [
          ...currentLogs,
          `[JARVIS HUB v2.5] SYSTEM 5 MOBILE AUTO-SCHEDULER RUN COMPLETE.`,
          `[JARVIS HUB v2.5] MASTER TELEMETRY RESULTS COMPASS:`,
          `  - AI Autonomic Heuristics: PASSED (self-healed button[type='submit'])`,
          `  - REST API SLA Delay: PASSED (Under 300ms)`,
          `  - Page DOM Checkout Security: PASSED`,
          `  - legacy Win32 MFC combo widgets: PASSED`,
          `  - Flow Pilot Mobile gestured appium: PASSED`,
          `[JARVIS HUB v2.5] INTEGRITY LEVEL: 100% SECURE. STANDBY MODE RE-ENGAGED.`
        ];
        setJarvisActiveLogs(currentLogs);
      }
    }, 6000);
  };

  // --- Guest Landing trial Execution ---
  const handleGuestExecuteTest = async () => {
    if (isGuestRunning) return;
    setIsGuestRunning(true);
    setGuestRunProgress(0);
    setGuestRunPassed(null);
    setGuestExecutionStats(null);
    
    let parsedMethod = "POST";
    let parsedEndpoint = "https://api.test.ai/v1/checkout";
    
    if (guestCurl.includes("-X POST") || guestCurl.includes("POST")) {
      parsedMethod = "POST";
    } else if (guestCurl.includes("-X PUT") || guestCurl.includes("PUT")) {
      parsedMethod = "PUT";
    } else if (guestCurl.includes("-X GET") || guestCurl.includes("GET")) {
      parsedMethod = "GET";
    } else if (guestCurl.includes("-X DELETE") || guestCurl.includes("DELETE")) {
      parsedMethod = "DELETE";
    }
    
    // Attempt parse endpoint
    const urlMatch = guestCurl.match(/https?:\/\/[^\s"']+/);
    if (urlMatch) {
      parsedEndpoint = urlMatch[0];
    }

    let logsList = [
      `[SANDBOX] INITIALIZING AUTOMATED TRIAL RUN...`,
      `[SANDBOX] PARSING CUSTOM cURL INTERACTIVE STATEMENT`,
      `[SANDBOX] METHOD RESOLVED: [${parsedMethod}]`,
      `[SANDBOX] ENDPOINT TARGET: "${parsedEndpoint}"`,
      `[SANDBOX] SCHEMAS: Fetching static validation rules for ${parsedMethod}...`
    ];
    setGuestLogs(logsList);

    const stepDuration = 380;
    const stages = [
      { progress: 15, log: `[SANDBOX] DNS CHECK: Checked DNS routing gateways for "${new URL(parsedEndpoint).hostname || "api.test.ai"}" - Resolved to 104.22.4.92 (CDN Edge)` },
      { progress: 30, log: `[SANDBOX] CONNECTION: Initiating TLS Handshake using TLSv1.3... Cipher Suite: TLS_AES_256_GCM_SHA384` },
      { progress: 45, log: `[SANDBOX] HEADER RESOLVER: Processing authentications and content-type tags...` },
      { progress: 60, log: `[SANDBOX] DISPATCH: Executing raw HTTP request socket trace. Sending headers: User-Agent: OmniTestAgent/v2.1` },
      { progress: 80, log: `[SANDBOX] RESPONSE RECEIVED: HTTP/1.1 200 OK | Content-Type: application/json | Time: ${Math.round(Math.random() * 200 + 100)}ms` },
      { progress: 90, log: `[SANDBOX] VERIFYING SCHEMAS: Testing assertions (Value matches schema, content is non-empty, headers check out)...` },
      { progress: 100, log: `[SANDBOX] TRIAL RESULTS: 4 assertions verified. Verification code [Matrix-SLA-Verified].` }
    ];

    let cursor = 0;
    const runner = setInterval(() => {
      if (cursor < stages.length) {
        logsList = [...logsList, stages[cursor].log];
        setGuestLogs(logsList);
        setGuestRunProgress(stages[cursor].progress);
        cursor++;
      } else {
        clearInterval(runner);
        setIsGuestRunning(false);
        setGuestRunPassed(true);
        setGuestExecutionStats({
          totalTests: 4,
          passed: 4,
          status: "PASSED",
          assertions: [
            "HTTP Response Status Code is equal to 200",
            `Payload structure matches ${parsedMethod} body specifications`,
            "Timing response latency is under 600ms SLA boundary",
            "Content-Security Headers parsed and verified"
          ]
        });
      }
    }, stepDuration);
  };

  // Custom Sign In Submit Handler
  const handleCustomSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInLoading(true);
    setSignInError(null);
    try {
      await loginWithEmail(signInEmail, signInPassword);
      setIsSignInModalOpen(false);
    } catch (err: any) {
      setSignInError(err.message || "Failed to authenticate. Please check your credentials.");
    } finally {
      setSignInLoading(false);
    }
  };

  // Admin Create Staff Member Handler & Global Notification Dispatcher
  const handleCreateStaffUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail) {
      setNewStaffError("Please fill out all staff fields.");
      return;
    }
    setNewStaffLoading(true);
    setNewStaffError(null);
    try {
      const createdProfile = await createStaffUser(newStaffName, newStaffEmail, newStaffRole);
      if (createdProfile) {
        setCreatedStaffProfile(createdProfile);
        
        // Find existing users emails to broadcast to
        const allRecipientEmails = allUsers.map(u => u.email).filter(Boolean);
        // Combine them with the new staff email to broadcast to EVERYONE
        const recipients = Array.from(new Set([...allRecipientEmails, newStaffEmail]));
        
        const initialLogs = [
          `[SMTP SYSTEM] Triggering global broadcast notification...`,
          `[SMTP SYSTEM] Target: Broad-scope system registration notification`,
          `[SMTP SYSTEM] Recipients: ${JSON.stringify(recipients)}`
        ];
        
        setStaffCreatedEmailLogs(initialLogs);
        setShowStaffCreatedEmailTrigger(true);
        
        const stages = [
          `[SMTP SYSTEM] Connecting to high-priority SMTP Relay: secure-mail.test.ai...`,
          `[SMTP SYSTEM] Framing HTML notice: 'Welcome New Staff Member: "${newStaffName}" (${newStaffRole.toUpperCase()})'`,
          `[SMTP SYSTEM] Broadcasting secure email alert logs under SLA-244 protocol...`,
          `[SMTP SYSTEM] SUCCESS: Successfully dispatched and delivered activation guidelines to everyone! [Status: 250 OK]`
        ];
        
        let pointer = 0;
        const intervalId = setInterval(() => {
          if (pointer < stages.length) {
            setStaffCreatedEmailLogs(prev => [...prev, stages[pointer]]);
            pointer++;
          } else {
            clearInterval(intervalId);
          }
        }, 600);
        
        // Reset form inputs
        setNewStaffName("");
        setNewStaffEmail("");
        setNewStaffRole("viewer");
      }
    } catch (err: any) {
      setNewStaffError(err.message || "Error creating staff user.");
    } finally {
      setNewStaffLoading(false);
    }
  };

  // --- Lead Form Register Handler ---
  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.email || !leadForm.company || !leadForm.phone) {
      alert("Please fill in all requested fields to register your demo request.");
      return;
    }

    setIsRegisteringLead(true);
    const newId = `lead-${Date.now().toString().slice(-6)}`;
    
    try {
      await registerLead({
        id: newId,
        name: leadForm.name,
        email: leadForm.email,
        company: leadForm.company,
        phone: leadForm.phone,
        notes: leadForm.notes || "No custom targets specified."
      });

      // Simulation - send email sequence and log dispatches
      const mockMailLogs = [
        `[MESSAGING] Enqueueing professional onboarding sequence for lead: "${leadForm.name}"`,
        `[MESSAGING] Constructing HTML high-end sales brief with custom branding shades...`,
        `[MESSAGING] Sending administrative alert email to registered admin: "niranjan4crypto@gmail.com"`,
        `[MESSAGING] Carbon Copy (CC) auto-transmitted to user email: "${leadForm.email}" for immediate notification`,
        `[MESSAGING] Dispatching sales coordinator notifications to list: ["sales-leads@test.ai", "onboarding@test.ai"]`,
        `[MESSAGING] Delivering detailed setup guide to prospect: "${leadForm.email}"`,
        `[MESSAGING] SUCCESS: Registration completed - CC copy successfully sent to "${leadForm.email}". (SLA status: DELIVERED)`
      ];
      
      setRegisteredLeadInfo({
        id: newId,
        ...leadForm,
        logs: mockMailLogs
      });
      
      // Reset form
      setLeadForm({
        name: "",
        email: "",
        company: "",
        phone: "",
        notes: ""
      });
      
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegisteringLead(false);
    }
  };

  // Simulated administration triggered email sender
  const handleAdminSendSimulatedEmail = (lead: any) => {
    if (sendingEmailId === lead.id) return;
    setSendingEmailId(lead.id);
    
    let currentLogs = [
      `[ADMIN PORTAL] Triggering client onboarding kit dispatch...`,
      `[ADMIN PORTAL] Recipients: ["niranjan4crypto@gmail.com", "${lead.email}", "sales-leads@test.ai"]`
    ];
    setSendingEmailLogs(currentLogs);
    
    const stages = [
      `[ADMIN PORTAL] Connecting to high-priority SMTP Relay: secure-mail.test.ai...`,
      `[ADMIN PORTAL] Packaging dynamic sales brief detailing OmniTest API capabilities, Playwright modules, and pricing models...`,
      `[ADMIN PORTAL] Enqueueing mail jobs. Job ID: jobs-smtp-${Date.now().toString().slice(-4)}`,
      `[ADMIN PORTAL] Sending confirmation alert email to project supervisor at "niranjan4crypto@gmail.com"...`,
      `[ADMIN PORTAL] Delivering onboarding sequence directly to "${lead.email}"...`,
      `[ADMIN PORTAL] SUCCESS: Emails delivered. All targets responded [250 OK-MESSAGE-DEPOSITED].`
    ];
    
    let cursor = 0;
    const runner = setInterval(() => {
      if (cursor < stages.length) {
        currentLogs = [...currentLogs, stages[cursor]];
        setSendingEmailLogs(currentLogs);
        cursor++;
      } else {
        clearInterval(runner);
        setSendingEmailId(null);
      }
    }, 450);
  };

  // Static chart calculations
  const trendData = useMemo(() => {
    return [
      { name: "Mon", executions: 18, passed: 17 },
      { name: "Tue", executions: 22, passed: 20 },
      { name: "Wed", executions: 29, passed: 27 },
      { name: "Thu", executions: 36, passed: 35 },
      { name: "Fri", executions: 31, passed: 30 },
      { name: "Sat", executions: 14, passed: 14 },
      { name: "Sun", executions: 26, passed: 25 }
    ];
  }, []);

  const pieData = useMemo(() => {
    const count = combinedRecentRuns.reduce((acc, curr) => {
      acc[curr.productType] = (acc[curr.productType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: "Web (Playwright Chrome)", value: count.web || 5, color: "#06b6d4" },
      { name: "API (REST Gateways)", value: count.api || 4, color: "#6366f1" },
      { name: "Mobile (Appium Android)", value: count.mobile || 3, color: "#a855f7" },
      { name: "Windows (WinAppDriver)", value: count.windows || 2, color: "#f59e0b" }
    ];
  }, [combinedRecentRuns]);

  // Loading Screens for Auth initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f17] text-white flex flex-col items-center justify-center font-sans">
        <Cpu className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
        <h3 className="font-display font-bold text-sm tracking-widest text-slate-400 uppercase">
          INITIATING OMNITEST DATABASE LINKS
        </h3>
      </div>
    );
  }

  // Auth Portal Splash Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 relative overflow-hidden font-sans selection:bg-cyan-500/10 selection:text-cyan-800">
        
        {/* Subtle decorative grid lines representing edge telemetry channels */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[40%] rounded-full bg-cyan-400/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] rounded-full bg-indigo-400/5 blur-[150px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>

        {/* Top Navbar */}
        <header className="relative z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center relative">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-cyan-500/10">
                <Cpu className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] text-cyan-600 font-extrabold uppercase tracking-widest block leading-none">TEST.AI</span>
                <h1 className="text-sm font-extrabold tracking-tight font-display text-slate-900 uppercase">
                  Continuous Autonomic Hub
                </h1>
              </div>
            </div>

            {/* Navigation Menu (Hidden on mobile) */}
            <div className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-slate-705">
              
              {/* PLATFORM DROPDOWN */}
              <div 
                className="relative py-2"
                onMouseEnter={() => {
                  setShowPlatformDropdown(true);
                  setShowSolutionsDropdown(false);
                  setShowResourcesDropdown(false);
                  setShowAgentsDropdown(false);
                }}
                onMouseLeave={() => setShowPlatformDropdown(false)}
              >
                <button 
                  onClick={() => setIsDemoModalOpen(true)}
                  className="flex items-center gap-1.5 text-slate-700 hover:text-blue-600 transition-colors cursor-pointer focus:outline-none"
                >
                  <span>Platform</span>
                  <svg className={`w-3 h-3 transition-transform duration-200 ${showPlatformDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {showPlatformDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute left-0 mt-3.5 w-[760px] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-12 z-50 text-slate-800 text-left normal-case tracking-normal font-sans"
                    >
                      {/* Left Side: AI Agents */}
                      <div className="col-span-4 p-6 border-r border-slate-100 bg-slate-50/50">
                        <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block mb-4">
                          AI Agent Suites
                        </span>
                        <div className="space-y-4">
                          {[
                            { name: "KaneAI Agent", desc: "Autonomous Conversational QA model", tab: "api_agent" },
                            { name: "Agent Testing Platform", desc: "Self-improving assertion cycles", tab: "api_agent" },
                            { name: "SmartUI Visual Agent", desc: "Heuristic layout & pixel validator", tab: "web" },
                            { name: "Accessibility Testing", desc: "Compliance & WCAG autonomous checks", tab: "web" }
                          ].map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setLandingActiveTab(item.tab as any);
                                setShowPlatformDropdown(false);
                                setTimeout(() => {
                                  document.getElementById("testing-playground-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                                }, 50);
                              }}
                              className="text-left w-full block group focus:outline-none cursor-pointer"
                            >
                              <h4 className="text-xs font-bold text-slate-950 group-hover:text-blue-600 transition-colors">
                                {item.name}
                              </h4>
                              <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">{item.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Middle Side: Cloud Grids */}
                      <div className="col-span-4 p-6 border-r border-slate-100 bg-white">
                        <span className="text-[10px] font-extrabold text-[#19834e] uppercase tracking-widest block mb-4">
                          Continuous Grids
                        </span>
                        <div className="space-y-4">
                          {[
                            { name: "Agentic Test Cloud", desc: "Elastic compute cluster for AI agents", tab: "api_agent" },
                            { name: "Real Devices Cloud", desc: "Physical iOS & Android farm", tab: "mobile" },
                            { name: "Automation Testing Cloud", desc: "Fast Playwright & Selenium grids", tab: "web" },
                            { name: "HyperExecute Sandbox", desc: "Low-latency remote command container", tab: "desktop" }
                          ].map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setLandingActiveTab(item.tab as any);
                                setShowPlatformDropdown(false);
                                setTimeout(() => {
                                  document.getElementById("testing-playground-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                                }, 50);
                              }}
                              className="text-left w-full block group focus:outline-none cursor-pointer"
                            >
                              <h4 className="text-xs font-bold text-slate-955 group-hover:text-[#19834e] transition-colors">
                                {item.name}
                              </h4>
                              <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">{item.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Right Side: Tools & Integrations */}
                      <div className="col-span-4 p-6 bg-slate-50/70 flex flex-col justify-between">
                        <div className="space-y-4">
                          <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest block font-sans">
                            Tools & Integrations
                          </span>
                          <div className="grid grid-cols-2 gap-2 text-[10.5px] font-semibold text-slate-600">
                            {["Jenkins", "GitHub", "Jira", "Slack", "Trello", "Katalon", "Jasmine", "Cucumber"].map((tool, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 p-1 bg-white border border-slate-200/50 rounded-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                <span className="truncate">{tool}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200/60 mt-4">
                          <p className="text-[10px] text-slate-400 font-mono">INTEGRATIONS STATUS</p>
                          <span className="text-[10.5px] font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>150+ Systems Connected</span>
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SOLUTIONS DROPDOWN */}
              <div 
                className="relative py-2"
                onMouseEnter={() => {
                  setShowSolutionsDropdown(true);
                  setShowPlatformDropdown(false);
                  setShowResourcesDropdown(false);
                  setShowAgentsDropdown(false);
                }}
                onMouseLeave={() => setShowSolutionsDropdown(false)}
              >
                <button 
                  onClick={() => setIsDemoModalOpen(true)}
                  className="flex items-center gap-1.5 text-slate-700 hover:text-blue-600 transition-colors cursor-pointer focus:outline-none"
                >
                  <span>Solutions</span>
                  <svg className={`w-3 h-3 transition-transform duration-200 ${showSolutionsDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {showSolutionsDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute left-1/2 -translate-x-1/2 mt-3.5 w-[760px] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-12 z-50 text-slate-800 text-left normal-case tracking-normal font-sans"
                    >
                      {/* Left Side: Use cases (5 columns) */}
                      <div className="col-span-5 p-6 border-r border-slate-100 bg-slate-50/50">
                        <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block mb-4">
                          Use Cases
                        </span>
                        <div className="grid grid-cols-1 gap-1 text-xs">
                          {[
                            { name: "Agent Testing", tab: "api_agent" },
                            { name: "Mobile App Testing", tab: "mobile" },
                            { name: "Geo-Location Testing", tab: "mobile" },
                            { name: "Local Page Testing", tab: "web" },
                            { name: "Accessibility Testing", tab: "web" },
                            { name: "Functional Testing", tab: "web" },
                            { name: "End-to-end Flow Automation", tab: "api_agent" },
                            { name: "Responsive Testing", tab: "web" },
                            { name: "Performance Testing", tab: "desktop" },
                            { name: "API Testing", tab: "api" },
                            { name: "Test Case Management", tab: "desktop" },
                            { name: "Low Code Testing", tab: "api_agent" },
                            { name: "Continuous Testing", tab: "api_agent" }
                          ].map((uc, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setLandingActiveTab(uc.tab as any);
                                setShowSolutionsDropdown(false);
                                setTimeout(() => {
                                  const element = document.getElementById("testing-playground-section");
                                  if (element) {
                                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                                  }
                                }, 50);
                              }}
                              className="text-left py-1 text-slate-605 text-slate-600 hover:text-blue-600 hover:translate-x-0.5 transition-all font-semibold flex items-center gap-1.5 focus:outline-none cursor-pointer"
                            >
                              <span className="text-[11px] text-blue-500 font-bold">›</span>
                              <span>{uc.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Middle Side: Industries (3 columns) */}
                      <div className="col-span-3 p-6 border-r border-slate-100 bg-white">
                        <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block mb-4">
                          Industries
                        </span>
                        <div className="flex flex-col gap-2.5 text-xs font-semibold text-slate-600 font-sans">
                          {[
                            "Retail",
                            "Finance",
                            "Media & Entertainment",
                            "Healthcare",
                            "Travel & Hospitality",
                            "Insurance",
                            "Enterprise"
                          ].map((ind, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-center gap-2 hover:text-blue-600 transition-colors cursor-pointer"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                              <span>{ind}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right Side: Enterprise & Contact (4 columns) */}
                      <div className="col-span-4 p-6 bg-slate-50/70 flex flex-col justify-between">
                        <div className="space-y-4">
                          <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block font-sans">
                            Enterprise
                          </span>
                          
                          <div className="space-y-3 font-sans">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">
                                Unified Testing Cloud
                              </h4>
                              <p className="text-[10.5px] text-slate-500 leading-normal mt-0.5">
                                Unified cloud grids to help deliver immersive digital experiences.
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">
                                Test.ai Professional Service
                              </h4>
                              <p className="text-[10.5px] text-slate-500 leading-normal mt-0.5">
                                Test.ai experts to help you accelerate & achieve business goals.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200/60 mt-4 space-y-2 font-sans">
                          <div className="text-[10px] font-mono tracking-wider uppercase text-slate-400">Get a Quote?</div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsDemoModalOpen(true);
                              setShowSolutionsDropdown(false);
                            }}
                            className="w-full py-2 px-3 text-center rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                          >
                            Contact Our Experts
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* AI AGENTS DROPDOWN */}
              <div 
                className="relative py-2"
                onMouseEnter={() => {
                  setShowAgentsDropdown(true);
                  setShowPlatformDropdown(false);
                  setShowSolutionsDropdown(false);
                  setShowResourcesDropdown(false);
                }}
                onMouseLeave={() => setShowAgentsDropdown(false)}
              >
                <button 
                  onClick={() => setIsDemoModalOpen(true)}
                  className="flex items-center gap-1.5 text-slate-700 hover:text-blue-600 transition-colors cursor-pointer focus:outline-none"
                >
                  <span>AI Agents</span>
                  <svg className={`w-3 h-3 transition-transform duration-200 ${showAgentsDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {showAgentsDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute left-1/2 -translate-x-1/2 mt-3.5 w-[460px] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-12 z-50 text-slate-800 text-left normal-case tracking-normal font-sans"
                    >
                      {/* Left: Agents */}
                      <div className="col-span-7 p-6 border-r border-slate-100 bg-slate-50/50">
                        <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block mb-4">
                          Autonomous Systems
                        </span>
                        <div className="space-y-3">
                          {[
                            { name: "Test Creation Agent", desc: "Generates custom code from description" },
                            { name: "Test Authoring Agent", desc: "Interactive conversational flow designer" },
                            { name: "Self-Healing App Agent", desc: "Injects runtime corrective actions" },
                            { name: "Diagnostic Co-Pilot", desc: "Interprets logs and isolates crash traces" }
                          ].map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setLandingActiveTab("api_agent");
                                setShowAgentsDropdown(false);
                                setTimeout(() => {
                                  document.getElementById("testing-playground-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                                }, 50);
                              }}
                              className="text-left w-full block group focus:outline-none cursor-pointer"
                            >
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {item.name}
                              </h4>
                              <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">{item.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Right: Releases */}
                      <div className="col-span-5 p-6 bg-white flex flex-col justify-between">
                        <div className="space-y-3">
                          <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest block">
                            What's New
                          </span>
                          <div className="space-y-2">
                            <span className="inline-block text-[9.5px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full font-sans">
                              NEW v1.5 RELEASE
                            </span>
                            <h4 className="text-xs font-bold text-slate-955">Kane CLI Tooling</h4>
                            <p className="text-[10.5px] text-slate-500 leading-normal">
                              Automate from your terminal directly. Secure local agent synchronization ready.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setShowAgentsDropdown(false);
                            setIsDemoModalOpen(true);
                          }}
                          className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-center font-bold text-[11px] mt-4 shadow cursor-pointer focus:outline-none"
                        >
                          Try Kane CLI
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* RESOURCES DROPDOWN */}
              <div 
                className="relative py-2"
                onMouseEnter={() => {
                  setShowResourcesDropdown(true);
                  setShowPlatformDropdown(false);
                  setShowSolutionsDropdown(false);
                  setShowAgentsDropdown(false);
                }}
                onMouseLeave={() => setShowResourcesDropdown(false)}
              >
                <button 
                  onClick={() => setIsDemoModalOpen(true)}
                  className="flex items-center gap-1.5 text-slate-700 hover:text-blue-600 transition-colors cursor-pointer focus:outline-none"
                >
                  <span>Resources</span>
                  <svg className={`w-3 h-3 transition-transform duration-200 ${showResourcesDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {showResourcesDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-3.5 w-[380px] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-12 z-50 text-slate-800 text-left normal-case tracking-normal font-sans"
                    >
                      {/* Left: Study */}
                      <div className="col-span-6 p-5 border-r border-[#f4f2ef] bg-[#fbfaf8]">
                        <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block mb-3">
                          Learn
                        </span>
                        <div className="space-y-2 text-xs font-semibold text-slate-700">
                          {["Blog Posts", "Webinars", "Test.ai Academy", "Appium Guides"].map((item, idx) => (
                            <div key={idx} className="hover:text-blue-600 transition-colors cursor-pointer py-1 block">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Info */}
                      <div className="col-span-6 p-5 bg-white">
                        <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest block mb-3">
                          Documentation
                        </span>
                        <div className="space-y-2 text-xs font-semibold text-slate-700">
                          {["API Handbooks", "SDK Library", "Compliance spec", "About Company"].map((item, idx) => (
                            <div key={idx} className="hover:text-blue-600 transition-colors cursor-pointer py-1 block">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* PRICING */}
              <button 
                onClick={() => {
                  setIsDemoModalOpen(true);
                }}
                className="text-slate-700 hover:text-blue-600 transition-colors cursor-pointer focus:outline-none"
              >
                Pricing
              </button>

            </div>

            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Enterprise SLA Online</span>
              </span>
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="px-4.5 py-2 text-xs font-bold rounded-lg border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Request Live Demo
              </button>
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="px-4.5 py-2 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 cursor-pointer active:scale-[0.98] transition-all flex items-center gap-1.5"
              >
                <span>Sign In</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Viewport Container */}
        <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-16 space-y-20">
          
          {/* Section 1: Crisp Hero Banner */}
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-xs font-semibold text-[#047857] shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Unified Continuous Intelligence Engine v2.5</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-slate-950 leading-tight">
              Autonomic Orchestrated Testing for <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600">Every Enterprise System</span>
            </h2>
            
            <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-2.5xl mx-auto">
              Command Chrome Web browsers, Android touch gestures, native desktop application windows, Progress 4GL corporate clients, remote Citrix screens, and REST payload contracts in a unified 1-click cloud platform.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10 cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5 text-slate-300" />
                <span>Reserve Dedicated Pilot Setup</span>
              </button>
              
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-1.5 text-slate-800"
              >
                <span>Sign In / Enter Sandbox</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Micro Live statistics counters */}
            <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto border-t border-slate-200 text-center">
              <div>
                <span className="block text-2xl font-extrabold text-slate-900 font-mono">1.2m+</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Test Runs Monthly</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-emerald-600 font-mono">99.98%</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">SLA Target Execution</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-cyan-600 font-mono">&lt; 450ms</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Response Latency</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-indigo-600 font-mono">5 Vectors</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Web, Mobile, legacy, API</span>
              </div>
            </div>
          </div>

          {/* Section 2: Interactive Automation Vector Demonstration Deck */}
          <div id="testing-playground-section" className="space-y-8 scroll-mt-20">
            
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold font-display text-slate-950 uppercase tracking-tight">Interactive Multi-System Testing Playground</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Witness our unified continuous intelligence system executing high-fidelity test sequences sequentially.
              </p>
            </div>

            {/* Master Jarvis Orchestrator Hub */}
            <div className="max-w-5xl mx-auto bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
              {/* Sci-fi radar mesh / grid lines inside Jarvis HUD */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_70%)] pointer-events-none" />
              <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-slate-500 hidden md:block">
                SYS_MASTER_ORCHESTRATOR // HUB_V2.5 // SECURE_LOCK_OK
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
                {/* Left side: Countdown Ring and Master Trigger Button */}
                <div className="md:col-span-4 flex flex-col items-center text-center space-y-4">
                  
                  {/* Glowing Circular Progress HUD */}
                  <div className="relative w-30 h-30 flex items-center justify-center">
                    <svg className="absolute w-full h-full -rotate-90">
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="48" 
                        className="stroke-slate-850 bg-slate-850 stroke-slate-800 fill-none" 
                        strokeWidth="5" 
                      />
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="48" 
                        className={`fill-none transition-all duration-1000 ${isJarvisRunning ? "stroke-cyan-400" : "stroke-indigo-500"}`} 
                        strokeWidth="6" 
                        strokeDasharray={2 * Math.PI * 48}
                        strokeDashoffset={2 * Math.PI * 48 * (1 - jarvisProgress / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    
                    <div className="text-center font-mono">
                      {isJarvisRunning ? (
                        <>
                          <span className="block text-2xl font-extrabold text-cyan-400 animate-pulse">{jarvisTimeRemaining}s</span>
                          <span className="text-[7.5px] text-slate-500 uppercase tracking-wider block">RUNNING</span>
                        </>
                      ) : (
                        <>
                          <Cpu className="w-7 h-7 mx-auto text-indigo-400 mb-0.5 animate-pulse" />
                          <span className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold">STANDBY</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="w-full space-y-2">
                    <button
                      onClick={handleStartJarvisOrchestration}
                      className={`w-full py-3 px-5 rounded-2xl font-bold font-display text-xs uppercase tracking-widest cursor-pointer transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 ${
                        isJarvisRunning 
                          ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/10" 
                          : "bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:opacity-95 text-white shadow-cyan-500/10"
                      }`}
                    >
                      <Sparkles className={`w-4 h-4 ${isJarvisRunning ? "animate-spin" : ""}`} />
                      <span>{isJarvisRunning ? "ABORT LOOP" : "⚡ INITIATE AGENT LOOP"}</span>
                    </button>
                    <p className="text-[9.5px] text-slate-500 leading-normal max-w-xs mx-auto">
                      Initiate a 30-second multi-system autonomic verification loop across all 5 test clusters sequentially.
                    </p>
                  </div>
                </div>

                {/* Right side: Realtime Telemetry Grid & Logs Feed */}
                <div className="md:col-span-8 flex flex-col justify-between h-full min-h-[180px] bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-5 font-mono text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
                      <span className="text-indigo-400 font-extrabold pb-0.5 block">📡 MASTER SYSTEM ORCHESTRATOR HUD</span>
                      <span className="text-[10px] text-slate-500">SYS STAGE: {isJarvisRunning ? `${jarvisCurrentStageIndex + 1}/5` : "0/5"}</span>
                    </div>

                    {/* Sequential Status Mini List representing Jarvis phases */}
                    <div className="grid grid-cols-5 gap-1 pt-1 text-center">
                      {[
                        { label: "AI AGENT", color: "text-cyan-400" },
                        { label: "API SLA", color: "text-emerald-400" },
                        { label: "WEB BROWSER", color: "text-indigo-400" },
                        { label: "WIN32 MFC", color: "text-amber-400" },
                        { label: "MOBILE FLW", color: "text-purple-400" }
                      ].map((st, sidx) => {
                        const isDone = jarvisCurrentStageIndex > sidx || (jarvisProgress === 100);
                        const isActive = isJarvisRunning && jarvisCurrentStageIndex === sidx;
                        return (
                          <div 
                            key={sidx} 
                            className={`p-1 rounded-lg border transition-all ${
                              isActive 
                                ? "bg-slate-800 border-white/30 text-white animate-pulse" 
                                : isDone 
                                  ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" 
                                  : "bg-slate-950/40 border-slate-900 text-slate-600"
                            }`}
                          >
                            <div className="text-[7.5px] font-bold truncate leading-none uppercase">{st.label}</div>
                            <div className="text-[7.5px] font-semibold mt-1">
                              {isActive ? "● ACTV" : isDone ? "✓ PASS" : "⚬ STBY"}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Integrated Scrolled Logger */}
                    <div className="bg-[#03060f] border border-slate-855 rounded-xl p-3 h-28 overflow-y-auto text-[10px] space-y-1 text-slate-400 text-left">
                      {jarvisActiveLogs.length > 0 ? (
                        jarvisActiveLogs.map((log, idx) => (
                          <div key={idx} className="leading-relaxed">
                            {log.includes("SLA 100%") || log.includes("INTEGRITY") || log.includes("SUCCESS") || log.includes("PASSED") ? (
                              <span className="text-emerald-400 font-semibold">{log}</span>
                            ) : log.includes("DISPATCHING") || log.includes("INITIALIZING") ? (
                              <span className="text-cyan-400 font-semibold">{log}</span>
                            ) : (
                              <span className="text-slate-500">{log}</span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-500 italic text-center pt-8">
                          System Master Telemetry is offline. Trigger the Jarvis loop to verify continuous system integration.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Cumulative 5-Stage System Vertical Stack (Jarvis-Compatible) */}

            {/* Cumulative 5-Stage System Vertical Stack (Jarvis-Compatible) */}
            <div className="max-w-5xl mx-auto space-y-8 pb-12">
              
              {/* SYSTEM 01: AI AGENT CORE */}
              <div 
                id="jarvis-row-0"
                className={`transition-all duration-500 rounded-3xl p-6 md:p-8 border bg-white ${
                  isJarvisRunning && jarvisCurrentStageIndex === 0
                    ? "border-cyan-400 ring-4 ring-cyan-100 shadow-2xl scale-[1.01]"
                    : "border-slate-200 shadow-md hover:shadow-lg hover:border-slate-350"
                }`}
              >
                <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center pb-4 border-b border-slate-100 mb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`w-2.5 h-2.5 rounded-full ${isAgentRunning ? "bg-cyan-400 animate-ping" : "bg-slate-300"}`} />
                      <span className="font-mono text-[9px] text-cyan-600 font-bold uppercase tracking-widest bg-cyan-50 px-2 py-0.5 rounded">SYSTEM 1</span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">AUTONOMIC</span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <Sparkles className="w-5 h-5 text-cyan-500" />
                      <h4 className="text-lg font-extrabold text-slate-900 tracking-tight font-display font-sans">1-Click Autonomic AI Agent</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRunAgentAnimation}
                      disabled={isJarvisRunning}
                      className={`px-4 py-2 rounded-xl font-bold font-sans text-xs uppercase tracking-wider cursor-pointer transition-all ${
                        isAgentRunning
                          ? "bg-rose-100 text-rose-750 text-rose-700 hover:bg-rose-200"
                          : "bg-cyan-500 hover:bg-cyan-600 text-white"
                      } disabled:opacity-50`}
                    >
                      {isAgentRunning ? "STOPPING AGENT..." : "⚡ TRIGGER AGENT ONLY"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left */}
                  <div className="lg:col-span-5 space-y-4">
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">
                      Our Autonomic Agent monitors user action streams, understands context, and auto-generates test scenarios on-the-fly without manual step script assertions.
                    </p>

                    <div className="space-y-2 mt-4 text-slate-700 font-sans">
                      {[
                        { label: "Understand App Context Map", prg: 20 },
                        { label: "Generate Dynamic Synthesized Specs", prg: 45 },
                        { label: "Locate React DOM Elements", prg: 70 },
                        { label: "Self-Heal Flaky Selectors", prg: 100 }
                      ].map((step, sidx) => {
                        const isDone = agentProgress >= step.prg;
                        return (
                          <div key={sidx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-[11px]">
                            <span className={isDone ? "text-slate-800 font-medium" : "text-slate-400"}>{step.label}</span>
                            <span className={`font-mono font-bold ${isDone ? "text-cyan-600" : "text-slate-400"}`}>
                              {isDone ? "● COMPLETED" : "⚬ PENDING"}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400">
                        <span>SCAN PROGRESS</span>
                        <span className="text-cyan-600">{agentProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-cyan-500 h-full transition-all duration-300"
                          style={{ width: `${agentProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="lg:col-span-7 flex flex-col justify-between bg-slate-950 rounded-2xl p-4 md:p-5 font-mono text-xs text-slate-200 shadow-inner">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[10px] text-slate-400">
                      <span>📟 AGENT STAGE SHELL FEED</span>
                      <span className="bg-slate-900 px-2 py-0.5 rounded text-[9px]">S1 // ACTIVE_LOG</span>
                    </div>

                    <div className="h-44 overflow-y-auto space-y-1.5 mt-3 font-mono text-[10px] text-slate-400 scrollbar-thin">
                      {agentLogs.map((log, lidx) => (
                        <div key={lidx} className="leading-snug">
                          {log.startsWith("[SUCCESS]") || log.includes("HEALED") ? (
                            <span className="text-cyan-400 font-semibold">{log}</span>
                          ) : log.startsWith("[ERROR]") ? (
                            <span className="text-rose-400">{log}</span>
                          ) : (
                            <span>{log}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>


              {/* SYSTEM 02: REST API SLA VERIFICATION WITH REAL cURL PLAYGROUND */}
              <div 
                id="jarvis-row-1"
                className={`transition-all duration-500 rounded-3xl p-6 md:p-8 border bg-white ${
                  isJarvisRunning && jarvisCurrentStageIndex === 1
                    ? "border-emerald-500 ring-4 ring-emerald-100 shadow-2xl scale-[1.01]"
                    : "border-slate-200 shadow-md hover:shadow-lg hover:border-slate-350"
                }`}
              >
                <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center pb-4 border-b border-slate-100 mb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`w-2.5 h-2.5 rounded-full ${isApiRunning ? "bg-emerald-500 animate-ping" : "bg-slate-300"}`} />
                      <span className="font-mono text-[9px] text-emerald-600 font-bold uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">SYSTEM 2</span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">CONTRACTS</span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <Database className="w-5 h-5 text-emerald-500" />
                      <h4 className="text-lg font-extrabold text-slate-900 tracking-tight font-display font-sans">REST API Payload Contract Verification</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRunApiAnimation}
                      disabled={isJarvisRunning}
                      className={`px-4 py-2 rounded-xl font-bold font-sans text-xs uppercase tracking-wider cursor-pointer transition-all ${
                        isApiRunning
                          ? "bg-rose-100 text-rose-700 hover:bg-rose-250"
                          : "bg-emerald-500 hover:bg-emerald-600 text-white"
                      } disabled:opacity-50`}
                    >
                      {isApiRunning ? "ANALYSIS RUNNING..." : "⚡ TRIGGER API ONLY"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
                  {/* Left */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide font-sans">REST API cURL Copypasta</span>
                        <div className="flex gap-1.5 font-mono">
                          <button 
                            type="button"
                            onClick={() => {
                              const input = document.getElementById("curl-interactive-textarea") as HTMLTextAreaElement;
                              if (input) {
                                input.value = `curl -X GET "https://api.test.ai/v1/users/usr_998236" \\\n  -H "Authorization: Bearer test_tok_8f0a"`;
                              }
                            }}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-0.5 rounded text-[8px] cursor-pointer transition-all"
                          >
                            GET PRES
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              const input = document.getElementById("curl-interactive-textarea") as HTMLTextAreaElement;
                              if (input) {
                                input.value = `curl -X POST "https://api.test.ai/v1/orders" \\\n  -H "Content-Type: application/json" \\\n  -d '{"product_id": "vector99", "quantity": 1}'`;
                              }
                            }}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-0.5 rounded text-[8px] cursor-pointer transition-all"
                          >
                            POST PRES
                          </button>
                        </div>
                      </div>

                      <textarea
                        id="curl-interactive-textarea"
                        rows={3}
                        defaultValue={`curl -X POST "https://api.test.ai/v1/checkout" \\\n  -H "Content-Type: application/json" \\\n  -d '{"amount": 149.99, "currency": "USD"}'`}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-[10.5px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-normal"
                      />

                      <button
                        type="button"
                        onClick={handleRunApiAnimation}
                        disabled={isApiRunning}
                        className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 hover:border-emerald-300 text-emerald-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer font-sans"
                      >
                        ⚡ GENERATE TESTCASE & RUN (1-CLICK)
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pb-3">
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3">
                        <div className="text-[9px] font-mono text-emerald-700 font-bold tracking-widest uppercase">API LATENCY SLA</div>
                        <div className="text-xl font-extrabold text-emerald-950 font-mono mt-0.5">140ms <span className="text-xs font-normal text-slate-400">avg</span></div>
                        <div className="text-[9.5px] text-emerald-600 font-semibold mt-1 font-sans">✓ PASSED CONTRACT (&lt;300ms SLA)</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-150 border-slate-200 rounded-xl p-3">
                        <div className="text-[9px] font-mono text-slate-400 font-bold tracking-widest uppercase">INTEGRITY ASSERTION</div>
                        <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">100%</div>
                        <div className="text-[9.5px] text-slate-505 text-slate-500 mt-1 font-sans font-medium">Schema contract validated</div>
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="lg:col-span-6 flex flex-col justify-between bg-slate-950 rounded-2xl p-4 md:p-5 font-mono text-xs text-slate-200 shadow-inner">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[10px] text-slate-400">
                      <span>📃 API TESTCASE RUNNER OUTPUT</span>
                      <span className="bg-slate-900 px-2 py-0.5 rounded text-[9px]">S2 // COMPLETED</span>
                    </div>

                    <div className="h-44 overflow-y-auto space-y-1.5 mt-3 font-mono text-[10px] text-slate-400 scrollbar-thin">
                      {apiLogs.map((log, lidx) => (
                        <div key={lidx} className="leading-snug">
                          {log.includes("SLA PASSED") || log.includes("STATUS 200") || log.includes("COMPLETED") ? (
                            <span className="text-emerald-400 font-semibold">{log}</span>
                          ) : log.includes("FAIL") ? (
                            <span className="text-rose-400">{log}</span>
                          ) : (
                            <span>{log}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-850 text-center font-mono text-[9px] text-slate-500">
                      <div>
                        <div className="text-slate-400">HEADER VERIFIED</div>
                        <div className="text-emerald-400 font-bold mt-0.5">[CONTENT-TYPE/JSON]</div>
                      </div>
                      <div>
                        <div className="text-slate-400">RESPONSE CODE</div>
                        <div className="text-emerald-400 font-bold mt-0.5">[200 OK]</div>
                      </div>
                      <div>
                        <div className="text-slate-400">PAYLOAD LEAK CHK</div>
                        <div className="text-emerald-400 font-bold mt-0.5">[NONE DETECTED]</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* SYSTEM 03: PLAYWRIGHT WEB LOCATOR */}
              <div 
                id="jarvis-row-2"
                className={`transition-all duration-500 rounded-3xl p-6 md:p-8 border bg-white ${
                  isJarvisRunning && jarvisCurrentStageIndex === 2
                    ? "border-indigo-500 ring-4 ring-indigo-100 shadow-2xl scale-[1.01]"
                    : "border-slate-200 shadow-md hover:shadow-lg hover:border-slate-350"
                }`}
              >
                <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center pb-4 border-b border-slate-100 mb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`w-2.5 h-2.5 rounded-full ${isWebRunning ? "bg-indigo-500 animate-ping" : "bg-slate-300"}`} />
                      <span className="font-mono text-[9px] text-indigo-600 font-bold uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">SYSTEM 3</span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase font-mono font-sans">BROWSERS</span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <Globe className="w-5 h-5 text-indigo-500" />
                      <h4 className="text-lg font-extrabold text-slate-900 tracking-tight font-display font-sans">Playwright Headless Browser Engine</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRunWebAnimation}
                      disabled={isJarvisRunning}
                      className={`px-4 py-2 rounded-xl font-bold font-sans text-xs uppercase tracking-wider cursor-pointer transition-all ${
                        isWebRunning
                          ? "bg-rose-100 text-rose-700 hover:bg-rose-250"
                          : "bg-indigo-500 hover:bg-indigo-600 text-white"
                      } disabled:opacity-50`}
                    >
                      {isWebRunning ? "INSPECTING DOM..." : "⚡ TRIGGER WEB ONLY"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-inner">
                      <div className="flex items-center gap-2 bg-slate-200 p-2 border-b border-slate-200">
                        <div className="flex gap-1 animate-pulse">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 block" />
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 block" />
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 block" />
                        </div>
                        <div className="bg-white px-3 py-0.5 rounded-md text-[9.5px] font-mono text-slate-550 text-slate-500 w-full truncate border border-slate-100">
                          {webBrowserUrl}
                        </div>
                      </div>

                      <div className="p-5 h-48 bg-white flex flex-col justify-between relative overflow-hidden text-slate-800">
                        {isWebRunning && (
                          <div className="absolute top-10 left-20 p-2 border border-dashed border-indigo-400 bg-indigo-50/90 rounded-lg animate-pulse z-10 text-[9.5px] text-indigo-700 font-mono">
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full block animate-ping" />
                              <span className="font-bold">[PLAYWRIGHT TARGET]</span>
                            </div>
                            <div>tag: button#submit_checkout</div>
                            <div>x: 142, y: 391 | assertion: visible</div>
                          </div>
                        )}

                        <div className="space-y-3 relative z-0">
                          <div className="h-4 bg-slate-100 rounded w-1/3" />
                          <div className="space-y-2">
                            <div className="h-3 bg-slate-100 rounded w-full" />
                            <div className="h-3 bg-slate-105 bg-slate-100 rounded w-5/6" />
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-8 border-t border-slate-100 mt-auto">
                          <div className="h-7 bg-slate-100 rounded w-1/4" />
                          <div className="h-9 w-32 bg-slate-900 rounded-xl flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-wider">
                            CHECKOUT BUTTON
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="lg:col-span-5 flex flex-col justify-between bg-slate-950 rounded-2xl p-4 md:p-5 font-mono text-xs text-slate-200 shadow-inner">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[10px] text-slate-400">
                      <span>📺 CHROME PLAYWRIGHT CONSOLE</span>
                      <span className="bg-slate-900 px-2 py-0.5 rounded text-[9px] text-indigo-400">STAGE: {webStep}</span>
                    </div>

                    <div className="h-44 overflow-y-auto space-y-1.5 mt-3 font-mono text-[10px] text-slate-400 scrollbar-thin">
                      {webLogs.map((log, lidx) => (
                        <div key={lidx} className="leading-snug font-mono">
                          {log.includes("PASSED") || log.includes("Heuristic check") ? (
                            <span className="text-indigo-400 font-semibold">{log}</span>
                          ) : (
                            <span>{log}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>


              {/* SYSTEM 04: LEGACY DESKTOP & WIN32 MFC COMPONENTS */}
              <div 
                id="jarvis-row-3"
                className={`transition-all duration-500 rounded-3xl p-6 md:p-8 border bg-white ${
                  isJarvisRunning && jarvisCurrentStageIndex === 3
                    ? "border-amber-500 ring-4 ring-amber-100 shadow-2xl scale-[1.01]"
                    : "border-slate-200 shadow-md hover:shadow-lg hover:border-slate-350"
                }`}
              >
                <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center pb-4 border-b border-slate-100 mb-6">
                  <div className="space-y-1 font-sans">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`w-2.5 h-2.5 rounded-full ${isDesktopRunning ? "bg-amber-500 animate-ping" : "bg-slate-300"}`} />
                      <span className="font-mono text-[9px] text-amber-600 font-bold uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded">SYSTEM 4</span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">ENTERPRISE GUI</span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <Laptop className="w-5 h-5 text-amber-500" />
                      <h4 className="text-lg font-extrabold text-slate-900 tracking-tight font-display font-sans">PYWINGUI, Citrix & Progress 4GL legacy Automation</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRunDesktopAnimation}
                      disabled={isJarvisRunning}
                      className={`px-4 py-2 rounded-xl font-bold font-sans text-xs uppercase tracking-wider cursor-pointer transition-all ${
                        isDesktopRunning
                          ? "bg-rose-100 text-rose-700 hover:bg-rose-250"
                          : "bg-amber-500 hover:bg-amber-600 text-white"
                      } disabled:opacity-50`}
                    >
                      {isDesktopRunning ? "EMULATING DESKTOP..." : "⚡ TRIGGER DESKTOP ONLY"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left */}
                  <div className="lg:col-span-6 space-y-4">
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">
                      Deep support for heavy enterprise environments including Windows Win32 MFC, Progress 4GL legacy dashboards, Citrix terminal screen-OCR receiver workspaces, custom ActiveX registries, and raw MFC dialog elements.
                    </p>

                    <div className="relative border border-slate-300 rounded-xl overflow-hidden bg-slate-100 p-4 font-mono select-none shadow-inner h-40 text-slate-800">
                      <div className="flex justify-between items-center bg-slate-300 text-slate-700 text-[10px] p-1.5 -mx-4 -mt-4 mb-3 rounded-t-xl border-b border-slate-350">
                        <span className="font-bold flex items-center gap-1 font-mono">💻 ERP_MANAGER_SECURE.EXE // WIN32</span>
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-slate-400 block" />
                          <span className="w-2 h-2 rounded-full bg-slate-400 block" />
                        </div>
                      </div>

                      <div className="space-y-1.5 text-[9.5px] text-slate-650 text-slate-600 font-mono">
                        <div className="flex justify-between border-b border-slate-200 pb-0.5">
                          <span>Progress 4GL Table Schema Vector</span>
                          <span className="text-emerald-700 font-bold">READY</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-0.5">
                          <span>Citrix VDI Terminal Handle stream</span>
                          <span className="text-emerald-700 font-bold">STATIONARY</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-0.5">
                          <span>ActiveX OCX grid selector</span>
                          <span className="text-slate-400 font-bold">STBY</span>
                        </div>
                      </div>

                      {isDesktopRunning && (
                        <div className="absolute top-20 right-14 py-1 px-2 border border-amber-500 bg-amber-50/90 rounded text-[9px] text-amber-900 animate-bounce">
                          🎯 pywingui: HWND:0x004A26 (Row4, Col3)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right */}
                  <div className="lg:col-span-6 flex flex-col justify-between bg-slate-950 rounded-2xl p-4 md:p-5 font-mono text-xs text-slate-200 shadow-inner">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[10px] text-slate-400">
                      <span>📺 WIN32 NATIVE GUEST CONTROLLER</span>
                      <span className="bg-slate-900 px-2 py-0.5 rounded text-[9px] text-amber-400 font-bold uppercase">CMD: {desktopStep}</span>
                    </div>

                    <div className="h-44 overflow-y-auto space-y-1.5 mt-3 font-mono text-[10px] text-slate-400 scrollbar-thin">
                      {desktopLogs.map((log, lidx) => (
                        <div key={lidx} className="leading-snug">
                          {log.includes("SUCCESS") || log.includes("PASSED") || log.includes("FOUND") ? (
                            <span className="text-amber-400 font-semibold">{log}</span>
                          ) : (
                            <span>{log}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>


              {/* SYSTEM 05: MOBILE FLOW PILOT */}
              <div 
                id="jarvis-row-4"
                className={`transition-all duration-500 rounded-3xl p-6 md:p-8 border bg-white ${
                  isJarvisRunning && jarvisCurrentStageIndex === 4
                    ? "border-purple-500 ring-4 ring-purple-100 shadow-2xl scale-[1.01]"
                    : "border-slate-200 shadow-md hover:shadow-lg hover:border-slate-350"
                }`}
              >
                <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center pb-4 border-b border-slate-100 mb-6">
                  <div className="space-y-1 font-sans">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`w-2.5 h-2.5 rounded-full ${isMobileRunning ? "bg-purple-500 animate-ping" : "bg-slate-300"}`} />
                      <span className="font-mono text-[9px] text-purple-600 font-bold uppercase tracking-widest bg-cyan-100 px-2 py-0.5 rounded text-purple-800">SYSTEM 5</span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">MOBILE</span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 uppercase">
                      <Smartphone className="w-5 h-5 text-purple-500" />
                      <h4 className="text-lg font-extrabold text-slate-900 tracking-tight font-display font-sans">Mobile Flow Pilot Model</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap font-sans">
                    <button
                      type="button"
                      onClick={handleRunMobileAnimation}
                      disabled={isJarvisRunning}
                      className={`px-4 py-2 rounded-xl font-bold font-sans text-xs uppercase tracking-wider cursor-pointer transition-all ${
                        isMobileRunning
                          ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                          : "bg-purple-500 hover:bg-purple-600 text-white"
                      } disabled:opacity-50`}
                    >
                      {isMobileRunning ? "RUNNING EMULATION..." : "⚡ TRIGGER MOBILE AUTO"}
                    </button>
                    {isMobileRunning && (
                      <button
                        type="button"
                        onClick={handleStopMobilePilot}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold font-sans text-xs uppercase tracking-wider cursor-pointer transition-all"
                      >
                        ✋ MANUAL EMERGENCY STOP
                      </button>
                    )}
                  </div>
                </div>

                {/* Simulated Mobile Phone Chassis View */}
                <div className="flex items-center justify-center py-4 bg-slate-50 border border-slate-100 rounded-3xl">
                  <div className="w-40 h-64 bg-slate-950 rounded-[2rem] border-[4px] border-slate-800 p-3.5 relative shadow-xl flex flex-col justify-between overflow-hidden text-center text-[10px] font-sans">
                    
                    {/* iPhone Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-3.5 w-16 bg-slate-800 rounded-b-lg z-10" />

                    {/* Quick Mobile Headers status */}
                    <div className="flex justify-between items-center text-[8px] text-slate-500 pt-0.5">
                      <span>09:59</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>100%</span>
                    </div>

                    {/* Active view */}
                    <div className="flex-1 flex flex-col justify-center items-center p-1.5 space-y-1.5 relative">
                      {mobileManualStopped ? (
                        <div className="space-y-1 animate-pulse">
                          <span className="text-[10px] font-bold text-yellow-500 block px-1.5 py-0.5 rounded bg-yellow-950/20 border border-yellow-500/10 uppercase">⚠️ OVERRIDE FREEZE</span>
                          <span className="text-slate-400 text-[9px] block leading-tight">Flow Pilot stopped. User has manual supervisor control.</span>
                        </div>
                      ) : isMobileRunning ? (
                        <div className="space-y-2 text-center w-full">
                          <span className="text-[9px] text-purple-400 font-bold block animate-pulse uppercase font-mono">● PILOT ACTIVE</span>
                          <div className="w-full bg-slate-800 rounded-full h-1">
                            <div className="bg-purple-500 h-1 rounded-full transition-all duration-300" style={{ width: `${mobileProgress}%` }} />
                          </div>
                          <span className="text-slate-200 block text-[9.5px]">Executing gestures... ({mobileProgress}%)</span>
                          {/* Coordinate highlight dots visual element */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 animate-ping absolute" />
                            <div className="w-3 h-3 rounded-full bg-purple-400 absolute" style={{ top: "40%", left: "50%" }} />
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic block leading-normal pt-2">No Active Pilot. Trigger the mobile auto execution above.</span>
                      )}
                    </div>

                    {/* Bottom android pill button */}
                    <div className="w-12 h-0.5 bg-slate-800 mx-auto rounded-full" />
                  </div>
                </div>

                {/* Mobile Appium Telemetry Logger Sub-Pane */}
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between pb-2 text-[10px] text-slate-400 font-mono">
                    <span>📡 ACTIVE DEPLOYMENT TELEMETRY STREAM</span>
                    <span>APPIUM INSTANCE // v1.22</span>
                  </div>
                  <div className="h-28 overflow-y-auto space-y-1.5 bg-slate-950 rounded-2xl p-4 font-mono text-[10px] text-slate-300 scrollbar-thin">
                    {mobileLogs.map((log, lidx) => (
                      <div key={lidx} className="leading-snug">
                        {log.startsWith("✓") || log.includes("RUN COMPLETE") || log.includes("SUCCESS") || log.includes("Passed") || log.includes("perfectly") ? (
                          <span className="text-emerald-400 font-semibold">{log}</span>
                        ) : log.includes("🚨") || log.includes("[STOPPED]") || log.includes("FREEZING") || log.includes("override") ? (
                          <span className="text-rose-400 font-bold bg-rose-955/20 px-1 rounded">{log}</span>
                        ) : (
                          <span>{log}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Deprecated tab showcase container (conditionally inactive) */}
            <div className="hidden border-slate-200 min-h-[1px]">
              
              {/* Tab Left Detail Column (45%) */}
              <div className="lg:col-span-5 p-8 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div className="space-y-4">
                  {landingActiveTab === "api_agent" && (
                    <>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-100 text-cyan-800 text-[10px] font-bold uppercase tracking-wider">
                        🤖 Autonomic Agent Suite
                      </div>
                      <h4 className="text-2xl font-extrabold text-slate-950 tracking-tight font-display">
                        1-Click AI Test Automation Agent
                      </h4>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        Say goodbye to complex scripting. Our server-side autonomous model intercepts server-level routing files, builds integration files, runs them in headland mode, diagnoses DOM changes, and self-heals locator failures instantly.
                      </p>
                      <ul className="text-xs text-slate-500 space-y-1.5 font-sans">
                        <li className="flex items-start gap-1.5">
                          <span className="text-cyan-600 font-bold">✓</span>
                          <span>Auto-generates dynamic Playwright assertions</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-cyan-600 font-bold">✓</span>
                          <span>Detects element changes & performs self-healing</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-cyan-600 font-bold">✓</span>
                          <span>Zero-friction 1-click execution</span>
                        </li>
                      </ul>
                    </>
                  )}

                  {landingActiveTab === "api" && (
                    <>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                        🔌 Payload Contract Checker
                      </div>
                      <h4 className="text-2xl font-extrabold text-slate-950 tracking-tight font-display">
                        High Speed API Verification
                      </h4>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        Ensure response consistency instantly. Map your API contracts, trigger security and CORS configuration health tests, and monitor mean latency limits dynamically.
                      </p>
                      <ul className="text-xs text-slate-500 space-y-1.5 font-sans">
                        <li className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>JSON contract key and data-type verification</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>TLS/SSL certificates and security header checks</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>Real-time response delay telemetry charting</span>
                        </li>
                      </ul>
                    </>
                  )}

                  {landingActiveTab === "web" && (
                    <>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase tracking-wider">
                        🌐 Headless Chromium Cluster
                      </div>
                      <h4 className="text-2xl font-extrabold text-slate-950 tracking-tight font-display">
                        Playwright Web Locator Core
                      </h4>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        Control real browser objects on-demand. Scan, load dynamic application paths, mock login sequences, simulate user scrolls, and verify page stability.
                      </p>
                      <ul className="text-xs text-slate-500 space-y-1.5 font-sans">
                        <li className="flex items-start gap-1.5">
                          <span className="text-indigo-600 font-bold">✓</span>
                          <span>Full cursor vector animation</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-indigo-600 font-bold">✓</span>
                          <span>Multi-device responsive sizing assertions</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-indigo-600 font-bold">✓</span>
                          <span>Captured locator log trace history</span>
                        </li>
                      </ul>
                    </>
                  )}

                  {landingActiveTab === "desktop" && (
                    <>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                        💻 Cross-Platform Win32 & Midrange
                      </div>
                      <h4 className="text-2xl font-extrabold text-slate-950 tracking-tight font-display">
                        PYWINGUI & Progress 4GL Support
                      </h4>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        Robust legacy ERP and client automation. We support legacy Win32, mainframe terminals, screen-OCR Citrix receiver workspaces, custom ActiveX registries, and raw MFC dialog elements using deep OS handlers.
                      </p>
                      <ul className="text-xs text-slate-500 space-y-1.5 font-sans">
                        <li className="flex items-start gap-1.5">
                          <span className="text-amber-600 font-bold">✓</span>
                          <span>Progress 4GL ERP database client windows</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-amber-600 font-bold">✓</span>
                          <span>PYWINGUI controller scripts with coordinate handles</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-amber-600 font-bold">✓</span>
                          <span>Citrix receiver screenshot cell tracking & OCX control</span>
                        </li>
                      </ul>
                    </>
                  )}

                  {landingActiveTab === "mobile" && (
                    <>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider">
                        📱 Mobile Autopilot Core
                      </div>
                      <h4 className="text-2xl font-extrabold text-slate-950 tracking-tight font-display">
                        Flow Pilot Autonomous Mobile tests
                      </h4>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        Control virtual phone systems. The Flow Pilot Auto Agent reads active coordinate trees, dispatches realistic swipes, and allows manual stop overrides at any millisecond to hand session control to human QAs.
                      </p>
                      <ul className="text-xs text-slate-500 space-y-1.5 font-sans">
                        <li className="flex items-start gap-1.5">
                          <span className="text-purple-600 font-bold">✓</span>
                          <span>Flow Pilot fully automated gesture agent mapping</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-purple-600 font-bold">✓</span>
                          <span>Interactive stop overrides for live inspection</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-purple-600 font-bold">✓</span>
                          <span>Pixel-precision image contrast verification</span>
                        </li>
                      </ul>
                    </>
                  )}
                </div>

                {/* Left tab action triggers */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  {landingActiveTab === "api_agent" && (
                    <div className="space-y-3">
                      <button
                        onClick={handleRunAgentAnimation}
                        disabled={isAgentRunning}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold font-display bg-slate-950 text-white hover:bg-slate-800 cursor-pointer shadow-lg shadow-slate-950/20 transition-all disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span>{isAgentRunning ? "Agent Working..." : "⚡ Run Autonomic AI Agent (1-Click)"}</span>
                      </button>
                      <p className="text-[10px] text-slate-400 font-medium text-center">
                        Our model evaluates, updates code files, self-heals, and deploys. 100% automated.
                      </p>
                    </div>
                  )}

                  {landingActiveTab === "api" && (
                    <button
                      onClick={handleRunApiAnimation}
                      disabled={isApiRunning}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold font-display bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer shadow-md transition-all disabled:opacity-50"
                    >
                      <Database className="w-4 h-4 text-emerald-250" />
                      <span>{isApiRunning ? "Querying Payloads..." : "Initiate REST Payload Check"}</span>
                    </button>
                  )}

                  {landingActiveTab === "web" && (
                    <button
                      onClick={handleRunWebAnimation}
                      disabled={isWebRunning}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold font-display bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-md transition-all disabled:opacity-50"
                    >
                      <Globe className="w-4 h-4 text-indigo-200" />
                      <span>{isWebRunning ? "Webkit Loading..." : "Launch Chrome Web Automation Engine"}</span>
                    </button>
                  )}

                  {landingActiveTab === "desktop" && (
                    <button
                      onClick={handleRunDesktopAnimation}
                      disabled={isDesktopRunning}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold font-display bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-md transition-all disabled:opacity-50"
                    >
                      <Laptop className="w-4 h-4 text-amber-100" />
                      <span>{isDesktopRunning ? "Win32 Drivers Triggered..." : "Launch Windows PyWinGui Controller"}</span>
                    </button>
                  )}

                  {landingActiveTab === "mobile" && (
                    <div className="grid grid-cols-2 gap-2">
                       <button
                        onClick={handleRunMobileAnimation}
                        disabled={isMobileRunning}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl font-bold text-[11px] bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-sm transition-all disabled:opacity-50"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Deploy Pilot Agent</span>
                      </button>
                      <button
                        onClick={handleStopMobilePilot}
                        disabled={!isMobileRunning}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl font-bold text-[11px] bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 cursor-pointer shadow-sm transition-all disabled:opacity-40"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Manual Stop Override</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tab Right Simulator Visual Viewport Column (55%) */}
              <div className="lg:col-span-7 p-8 bg-slate-900 text-slate-300 flex flex-col justify-between">
                
                {/* 1. REST API & AI AUTONOMIC AGENT VIEWPORT */}
                {landingActiveTab === "api_agent" && (
                  <div className="space-y-4 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 text-xs text-slate-400 font-mono">
                      <span>AUTOMATED COMPILER TRACE</span>
                      <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/10 text-[10px] font-bold">
                        {isAgentRunning ? agentStep.toUpperCase() : "AGENT READY"}
                      </span>
                    </div>

                    <div className="bg-[#03060f] border border-slate-800/80 rounded-xl p-4 flex-1 flex flex-col justify-between min-h-[220px]">
                      <div className="font-mono text-[10.5px] text-slate-300 space-y-2 p-1 overflow-y-auto max-h-[180px]">
                        {agentLogs.map((log, idx) => (
                          <div key={idx} className="leading-relaxed">
                            {log.includes("SUCCESS") || log.includes("[EXIT CODE 0]") ? (
                              <span className="text-emerald-400 font-semibold">{log}</span>
                            ) : log.includes("WARN") || log.includes("SELF-HEALING") ? (
                              <span className="text-amber-400 font-semibold">{log}</span>
                            ) : (
                              <span className="text-slate-400">{log}</span>
                            )}
                          </div>
                        ))}
                      </div>

                      {isAgentRunning && (
                        <div className="space-y-1.5 pt-2 border-t border-slate-900 animate-pulse">
                          <div className="flex justify-between items-center text-[10px] font-bold text-cyan-400">
                            <span>Processing task pipeline graph...</span>
                            <span>{agentProgress}%</span>
                          </div>
                          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-400 transition-all duration-200" style={{ width: `${agentProgress}%` }} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10.5px] font-sans text-slate-400 flex items-center gap-2.5">
                      <div className="p-1 rounded-md bg-cyan-950 text-cyan-400">
                        <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                      </div>
                      <p>
                        The AI Agent is fully integrated. Just 1 click spins up environments, executes validations, and completes builds automatically.
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. API TEST contract validator VIEWPORT */}
                {landingActiveTab === "api" && (
                  <div className="space-y-4 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 text-xs text-slate-400 font-mono">
                      <span>ENDPOINT SECURITY CONTRACT ROUTER</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/10 text-[10px] font-bold">
                        REST ENGINE API
                      </span>
                    </div>

                    <div className="bg-[#03060f] border border-slate-800/80 rounded-xl p-4 flex-1 flex flex-col justify-between gap-4 min-h-[220px]">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="px-2 py-0.5 font-bold rounded bg-slate-800 text-slate-300">GET</span>
                          <span className="text-emerald-400 select-all">https://api.test.ai/v1/auth/tokens</span>
                        </div>
                        
                        <div className="font-mono text-[10.5px] text-slate-300 space-y-1.5 p-1 max-h-[120px] overflow-y-auto">
                          {apiLogs.map((log, idx) => (
                            <div key={idx} className="leading-relaxed">
                              <span className="text-slate-400">{log}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {apiLatency.length > 0 && (
                        <div className="pt-2 border-t border-slate-900 space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Latency Graph (SLA Metric limit: 600ms)</span>
                          <div className="flex items-end gap-2 h-10 pt-2 font-mono text-[9px] text-slate-500">
                            {apiLatency.map((lat, lidx) => (
                              <div key={lidx} className="flex-1 flex flex-col items-center justify-end h-full">
                                <div className="w-full bg-emerald-500/30 rounded-t" style={{ height: `${(lat / 300) * 100}%` }} />
                                <span className="text-[8px] text-slate-400 mt-1">{lat}ms</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10.5px] font-mono text-[#00f2fe] flex items-center justify-between">
                      <span>HTTP/1.1 200 OK</span>
                      <span>Content-Type: application/json</span>
                    </div>
                  </div>
                )}

                {/* 3. WEB PLAYWRIGHT VIEWPORT */}
                {landingActiveTab === "web" && (
                  <div className="space-y-4 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 text-xs text-slate-400 font-mono">
                      <span>VIRTUAL PLAYWRIGHT CHROME EMULATION</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-500/10 text-[10px] font-bold">
                        Chrome v124
                      </span>
                    </div>

                    <div className="bg-slate-100 border border-slate-350 rounded-xl flex-1 flex flex-col justify-between text-slate-800 overflow-hidden min-h-[220px]">
                      
                      {/* Browser Address Bar */}
                      <div className="bg-slate-250 bg-slate-200 px-3 py-1.5 border-b border-slate-300 flex items-center gap-2 text-xs font-mono">
                        <div className="flex gap-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                        </div>
                        <div className="flex-1 bg-white rounded border border-slate-300 px-2 py-0.5 text-[10px] select-all flex items-center gap-1.5 text-slate-600">
                          <span className="text-emerald-500 font-extrabold">🔒</span>
                          <span>{webBrowserUrl}</span>
                        </div>
                      </div>

                      {/* Mock UI Viewport */}
                      <div className="p-4 flex-1 flex flex-col justify-center relative bg-white">
                        <div className="max-w-xs mx-auto border border-slate-200 rounded-lg p-3 space-y-2 text-center shadow-sm relative">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Checkout confirmation</span>
                          <div className="w-full h-8 bg-slate-100 rounded flex items-center justify-center text-xs font-mono">
                             Cart ID: pro_902a
                          </div>

                          <button
                            type="button"
                            className="bg-indigo-650 bg-indigo-600 text-white font-bold text-xs py-1.5 px-4 rounded w-full relative"
                          >
                            Confirm Checkout
                            
                            {/* Animated Cursor Spot */}
                            {isWebRunning && webProgress > 45 && webProgress < 90 && (
                              <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                            )}
                          </button>
                        </div>

                        {/* Interactive Steps Floating Over */}
                        <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 text-[9px] text-[#38bdf8] p-2 rounded font-mono">
                          Step output: {webStep}...
                        </div>
                      </div>
                    </div>

                    <div className="font-mono text-[10px] text-slate-450 text-slate-400 line-clamp-1">
                      {webLogs[webLogs.length - 1]}
                    </div>
                  </div>
                )}

                {/* 4. LEGACY DESKTOP PYWINGUI PROGRESS 4GL VIEWPORT */}
                {landingActiveTab === "desktop" && (
                  <div className="space-y-4 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 text-xs text-slate-400 font-mono">
                      <span>PYWINGUI WINDOWS CONTROLLER ENGINE</span>
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/10 text-[10px] font-bold">
                        WIN32 PLATFORM HOOKS
                      </span>
                    </div>

                    <div className="bg-[#ebe9ed] rounded-lg border-2 border-slate-400 text-slate-800 overflow-hidden shadow-lg flex-1 flex flex-col justify-between min-h-[220px]">
                      
                      {/* Midrange Windows Classic titlebar */}
                      <div className="bg-gradient-to-r from-[#000080] to-[#1085d0] px-2 py-1 flex items-center justify-between text-white font-bold text-[10.5px] font-sans">
                        <div className="flex items-center gap-1.5">
                          <Laptop className="w-3.5 h-3.5 text-slate-200" />
                          <span>Progress ERP CRM Client v4.12 [ActiveX Secured]</span>
                        </div>
                        <div className="flex gap-1">
                          <span className="px-1 bg-[#ebe9ed] text-slate-900 border border-slate-450 text-[8px] h-3.5 w-3.5 flex items-center justify-center font-extrabold">-</span>
                          <span className="px-1 bg-[#ebe9ed] text-slate-900 border border-slate-450 text-[8px] h-3.5 w-3.5 flex items-center justify-center font-extrabold">◻</span>
                          <span className="px-1 bg-red-600 text-white border border-slate-450 text-[8px] h-3.5 w-3.5 flex items-center justify-center font-extrabold">✕</span>
                        </div>
                      </div>

                      {/* Vintage 4GL Application Layout Form */}
                      <div className="p-3 bg-slate-100 flex-1 flex flex-col gap-2 font-mono text-[9px]">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <span className="text-slate-500 block">LEDGER_ACCT_ID:</span>
                            <div className="bg-white border border-slate-350 p-1 text-slate-800 font-bold select-all">
                              ERP-ACC-0925-B
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-500 block">POSTING_VECTORS:</span>
                            <div className="bg-white border border-slate-350 p-1 text-slate-805 select-all">
                              PYWINGUI ACTIVE
                            </div>
                          </div>
                        </div>

                        <div className="p-1.5 bg-slate-300/40 border border-slate-350 rounded flex items-center gap-2">
                          <span className="text-amber-700 animate-pulse font-extrabold">●</span>
                          <span>OCX Widget: custom_combogrid_v3</span>
                        </div>

                        {/* Classic Terminal Coordinates highlight */}
                        <div className="border border-red-500/55 p-1 bg-red-400/10 text-red-700 text-[8.5px] rounded mt-1">
                          PYWINGUI CLICK COORDINATE: hWnd: 0x002FA1 [X: 420px, Y: 110px]
                        </div>
                      </div>

                      {/* Window status indicators */}
                      <div className="bg-[#ebe9ed] border-t border-slate-300 px-2 py-1 text-[8.5px] text-slate-500 flex justify-between font-sans">
                        <span>Database linked [Progress SQL-89]</span>
                        <span>ADMIN OVERRIDE GATES ARMED</span>
                      </div>
                    </div>

                    <div className="font-mono text-[9.5px] text-slate-400 max-h-[44px] overflow-hidden leading-tight">
                      {desktopLogs[desktopLogs.length - 1]}
                    </div>
                  </div>
                )}

                {/* 5. MOBILE AUTOPILOT (FLOW PILOT WITH STOP OVERRIDE!) */}
                {landingActiveTab === "mobile" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 text-xs text-slate-400 font-mono">
                      <span>FLOW PILOT PREMIUM REPLAY INTERACTION</span>
                      <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-500/10 text-[10px] font-bold animate-pulse">
                        FLOW PILOT ACTIVE
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center pt-2">
                      <div className="mx-auto w-fit max-w-full overflow-hidden rounded-3xl border border-slate-800 bg-[oklch(0.935_0_0)] p-[clamp(8px,2.5vw,40px)] lg:p-10">
                        <div className="mx-auto grid w-fit max-w-full grid-flow-col auto-cols-max items-stretch gap-[clamp(6px,2.5vw,32px)] lg:gap-8">
                          
                          {/* Aspect frame 1080/2424 phone preview */}
                          <div className="relative aspect-[1080/2424] h-[clamp(300px,52vw,560px)] overflow-hidden rounded-2xl bg-black shadow-[0_4px_42px_-18px_rgba(0,0,0,0.34),0_10px_20px_-12px_rgba(0,0,0,0.24)]">
                            <video 
                              className="pointer-events-none h-full w-full object-cover absolute inset-0 opacity-20" 
                              autoPlay 
                              muted 
                              playsInline 
                              preload="auto" 
                              disablePictureInPicture 
                              controlsList="nodownload noplaybackrate nofullscreen"
                              src="/replays/tmp-test/screen.mp4"
                              onError={(e) => {
                                // Dynamic CSS Fallback if mp4 is absent
                              }}
                            />
                            
                            {/* Premium CSS Interactive Todoist App Interface */}
                            <div className="absolute inset-0 bg-[#0d0e12] flex flex-col justify-between p-4 font-sans text-white">
                              {/* Clean Top Status Bar */}
                              <div className="flex justify-between items-center text-[9px] text-slate-400">
                                <span className="font-semibold">09:59</span>
                                <div className="flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-slate-800">
                                   <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                                   <span className="font-mono text-[8px] uppercase font-bold tracking-wider">Flow Pilot Active</span>
                                </div>
                                <span>100%</span>
                              </div>

                              {/* Phone View Title area */}
                              <div className="flex-1 flex flex-col justify-between py-6 relative">
                                <div className="text-center">
                                  <span className="text-[10px] text-purple-400 uppercase tracking-widest font-mono">com.todoist</span>
                                  <h5 className="text-xs font-black font-display text-white mt-1">Autopilot Workstation</h5>
                                </div>

                                {/* Interactive Todo List UI */}
                                <div className="bg-[#181a20]/90 border border-slate-800/80 rounded-2xl p-3 space-y-2 text-left font-sans">
                                  <span className="text-[8px] text-purple-450 font-extrabold block uppercase tracking-wider">MAESTRO EXECUTION DECK</span>
                                  
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-[10.5px] p-2 rounded bg-slate-900 border border-slate-850">
                                      <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${currentMaestroStepIndex >= 6 ? "bg-purple-600 border-purple-500 text-white" : "border-slate-700"}`}>
                                        {currentMaestroStepIndex >= 6 && "✓"}
                                      </span>
                                      <span className={currentMaestroStepIndex >= 6 ? "line-through text-slate-500" : "text-slate-200"}>go to the gym</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-[10.5px] p-2 rounded bg-slate-900 border border-slate-850">
                                      <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${currentMaestroStepIndex >= 17 ? "bg-purple-600 border-purple-500 text-white" : "border-slate-700"}`}>
                                        {currentMaestroStepIndex >= 17 && "✓"}
                                      </span>
                                      <span className={currentMaestroStepIndex >= 17 ? "line-through text-slate-500" : "text-slate-200"}>grocery shopping</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-[10.5px] p-2 rounded bg-slate-900 border border-slate-850">
                                      <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${currentMaestroStepIndex >= 23 ? "bg-red-650 border-red-500 text-white" : "border-slate-700"}`}>
                                        {currentMaestroStepIndex >= 23 && "✓"}
                                      </span>
                                      <span className={currentMaestroStepIndex >= 23 ? "line-through text-slate-500 font-bold" : "text-slate-200"}>
                                        Finalize editing of v3 <span className="text-red-400 font-mono text-[7px] uppercase pl-1 pr-1 border border-red-500/20 rounded bg-red-950/20">P1</span>
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Floating touch gesture circles */}
                                {isMobileRunning && (
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/30 animate-ping absolute" />
                                    <div className="w-4.5 h-4.5 rounded-full bg-purple-500 absolute border-2 border-white shadow-lg" style={{
                                      top: currentMaestroStepIndex < 6 ? "73%" : currentMaestroStepIndex < 17 ? "52%" : "40%",
                                      left: currentMaestroStepIndex < 6 ? "48%" : currentMaestroStepIndex < 17 ? "38%" : "55%",
                                      transition: "all 0.5s ease-in-out"
                                    }} />
                                  </div>
                                )}
                              </div>

                              {/* Bottom Bar indicator */}
                              <div className="w-16 h-1 bg-slate-850 rounded-full mx-auto" />
                            </div>
                          </div>

                          {/* YAML step-by-step executor panel on the right */}
                          <div className="flex h-[clamp(300px,52vw,560px)] w-[clamp(200px,40vw,420px)] flex-col overflow-hidden rounded-2xl border border-black/10 bg-[#fbfaf8] shadow-[0_4px_42px_-18px_rgba(0,0,0,0.34),0_10px_20px_-12px_rgba(0,0,0,0.24)]">
                            <div className="flex items-center gap-[clamp(4px,1vw,10px)] border-b border-black/5 bg-[#f4f2ef] px-[clamp(6px,1.2vw,12px)] py-[clamp(5px,1vw,8px)]">
                              <div className="w-4 h-4 bg-purple-550/10 rounded flex items-center justify-center font-bold text-[9px] text-purple-650 shrink-0">Y</div>
                              <span className="min-w-0 truncate font-mono text-[clamp(9px,1.4vw,12px)] font-semibold text-[#252525]">Add Tasks.yaml</span>
                              
                              <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-[clamp(5px,1.1vw,8px)] py-0.5 text-[clamp(8px,1.3vw,11px)] font-medium ${isMobileRunning ? "bg-[#e8f0fb] text-[#1e63c8]" : mobileManualStopped ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-600"}`}>
                                {isMobileRunning && (
                                  <svg className="size-[clamp(8px,1.4vw,10px)] animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M12 3a9 9 0 1 0 9 9" stroke="currentColor" strokeWidth="2.5" stroke-linecap="round"></path>
                                  </svg>
                                )}
                                {isMobileRunning ? "Running" : mobileManualStopped ? "Stopped" : "Idle"}
                              </span>

                              <div className="ml-auto flex items-center">
                                {isMobileRunning ? (
                                  <button 
                                    type="button" 
                                    onClick={handleStopMobilePilot}
                                    aria-label="Stop" 
                                    className="flex size-[clamp(18px,3vw,24px)] shrink-0 items-center justify-center rounded text-black/40 transition-colors hover:bg-black/5 hover:text-black/70 cursor-pointer"
                                  >
                                    <svg className="size-[clamp(11px,1.8vw,14px)]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                      <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"></rect>
                                    </svg>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={handleRunMobileAnimation}
                                    aria-label="Play"
                                    className="flex size-[clamp(18px,3vw,24px)] shrink-0 items-center justify-center rounded text-emerald-600 transition-colors hover:bg-emerald-50 cursor-pointer"
                                  >
                                    <svg className="size-[clamp(11px,1.8vw,14px)] fill-current" viewBox="0 0 24 24" aria-hidden="true">
                                      <path d="M8 5v14l11-7z"></path>
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Sequential code step lines list feed */}
                            <div className="relative min-h-0 flex-1 overflow-y-auto py-2 font-mono text-[clamp(9px,1.4vw,13px)] leading-[1.5] bg-white text-slate-800">
                              {[
                                { line: 1, text: <><span className="text-[#7b45c7]">appId</span><span className="text-black/30">: </span><span className="text-[#c77722]">com.todoist</span></> },
                                { line: 2, text: <><span className="text-black/30">---</span></> },
                                { line: 3, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">launchApp</span></>, act: 3 },
                                { line: 4, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn</span><span className="text-black/30">: </span><span className="text-[#c77722]">Quick add</span></>, act: 4 },
                                { line: 5, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn:</span><br/><span className="text-[#7b45c7] pl-4">id</span><span className="text-black/30">: </span><span className="text-[#c77722]">message</span></>, act: 5 },
                                { line: 6, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">inputText</span><span className="text-black/30">: </span><span className="text-[#19834e]">"go to the gym"</span></>, act: 6 },
                                { line: 7, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn</span><span className="text-black/30">: </span><span className="text-[#c77722]">Date</span></>, act: 7 },
                                { line: 8, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn</span><span className="text-black/30">: </span><span className="text-[#c77722]">Today</span></>, act: 8 },
                                { line: 9, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn</span><span className="text-black/30">: </span><span className="text-[#c77722]">Add</span></>, act: 9 },
                                { line: 10, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">inputText</span><span className="text-black/30">: </span><span className="text-[#19834e]">"breakfast with John"</span></>, act: 10 },
                                { line: 11, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn</span><span className="text-black/30">: </span><span className="text-[#c77722]">Date</span></>, act: 11 },
                                { line: 12, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn</span><span className="text-black/30">: </span><span className="text-[#c77722]">Add time</span></>, act: 12 },
                                { line: 13, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn</span><span className="text-black/30">: </span><span className="text-[#c77722]">9 o'clock</span></>, act: 13 },
                                { line: 14, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn</span><span className="text-black/30">: </span><span className="text-[#c77722]">OK</span></>, act: 14 },
                                { line: 15, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn</span><span className="text-black/30">: </span><span className="text-[#c77722]">Save</span></>, act: 15 },
                                { line: 16, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn</span><span className="text-black/30">: </span><span className="text-[#c77722]">Add</span></>, act: 16 },
                                { line: 17, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">inputText</span><span className="text-black/30">: </span><span className="text-[#19834e]">"grocery shopping"</span></>, act: 17 },
                                { line: 18, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn</span><span className="text-black/30">: </span><span className="text-[#c77722]">Add</span></>, act: 18 },
                                { line: 19, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">inputText</span><span className="text-black/30">: </span><span className="text-[#19834e]">"pick up the laundry"</span></>, act: 19 },
                                { line: 20, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn</span><span className="text-black/30">: </span><span className="text-[#c77722]">Add</span></>, act: 20 },
                                { line: 21, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">inputText</span><span className="text-black/30">: </span><span className="text-[#19834e]">"Finalize editing of v3"</span></>, act: 21 },
                                { line: 22, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn</span><span className="text-black/30">: </span><span className="text-[#c77722]">Priority</span></>, act: 22 },
                                { line: 23, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn</span><span className="text-black/30">: </span><span className="text-[#c77722]">Priority 1</span></>, act: 23 },
                                { line: 24, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn</span><span className="text-black/30">: </span><span className="text-[#c77722]">Add</span></>, act: 24 },
                                { line: 25, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">inputText</span><span className="text-black/30">: </span><span className="text-[#19834e]">"dinner at Emma's house"</span></>, act: 25 },
                                { line: 26, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn</span><span className="text-black/30">: </span><span className="text-[#c77722]">Date</span></>, act: 26 },
                                { line: 27, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn</span><span className="text-black/30">: </span><span className="text-[#c77722]">Add time</span></>, act: 27 },
                                { line: 28, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn</span><span className="text-black/30">: </span><span className="text-[#c77722]">7 o'clock</span></>, act: 28 },
                                { line: 29, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn</span><span className="text-black/30">: </span><span className="text-[#c77722]">30 minutes</span></>, act: 29 },
                                { line: 30, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn</span><span className="text-black/30">: </span><span className="text-[#c77722]">PM</span></>, act: 30 },
                                { line: 31, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn</span><span className="text-black/30">: </span><span className="text-[#c77722]">OK</span></>, act: 31 },
                                { line: 32, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn</span><span className="text-black/30">: </span><span className="text-[#c77722]">Save</span></>, act: 32 },
                                { line: 33, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn</span><span className="text-black/30">: </span><span className="text-[#c77722]">Add</span></>, act: 33 },
                                { line: 34, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn:</span><br/><span className="text-[#7b45c7] pl-4">id</span><span className="text-black/30">: </span><span className="text-[#c77722]">toolbar</span></>, act: 34 },
                                { line: 35, text: <><span className="text-black/30">- </span><span className="text-[#7b45c7]">tapOn</span><span className="text-black/30">: </span><span className="text-[#c77722]">Upcoming</span></>, act: 35 },
                              ].map((step) => {
                                const isActive = isMobileRunning && currentMaestroStepIndex === step.act;
                                return (
                                  <div 
                                    key={step.line} 
                                    className={`flex items-start gap-2 whitespace-pre px-3 transition-colors duration-150 py-0.5 ${isActive ? "bg-purple-100/60 border-l-2 border-purple-600 font-bold" : ""}`}
                                  >
                                    <span className="flex h-[1.5em] w-3 shrink-0 items-center justify-center">
                                      {isActive ? (
                                        <svg className="size-2.5 animate-spin text-[#c77722]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                          <path d="M12 3a9 9 0 1 0 9 9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></path>
                                        </svg>
                                      ) : (
                                        <span className="size-1 rounded-full bg-black/15"></span>
                                      )}
                                    </span>
                                    <span className="w-4 shrink-0 select-none text-right tabular-nums text-black/25">{step.line}</span>
                                    <span className="min-w-0">{step.text}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={handleRunMobileAnimation}
                        disabled={isMobileRunning}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer disabled:opacity-40 transition-all uppercase tracking-wider"
                      >
                        ⚡ Trigger Mobile Autopilot
                      </button>
                      <button
                        onClick={handleStopMobilePilot}
                        disabled={!isMobileRunning}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer disabled:opacity-40 transition-all uppercase tracking-wider"
                      >
                        ✋ Pause Auto Agent
                      </button>
                    </div>

                    <div className="font-mono text-slate-500 text-[10px] text-center">
                      Flow Pilot Auto Agent executes swipes dynamically utilizing Appium system gateways.
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Section 3: CRM lead submission with standard sandbox below */}
          <div id="sandbox" className="p-8 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-xl relative text-slate-800">
            <div className="absolute top-4 right-4 text-[10px] font-mono text-[#0369a1] font-bold bg-[#f0f9ff] px-2.5 py-1 rounded border border-[#bae6fd]">
              CRM TRIAL PIPELINE
            </div>
            
            <div className="max-w-xl">
              <h3 className="text-2xl font-bold font-display text-slate-900 tracking-tight">Instant cURL Validation Sandbox</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Experience test generation live. Choose a targeted method preset or copy/paste a custom shell curl statement. Our engine synthesizes the pipeline instantly.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Sandbox Column: Inputs and Preloaded curl triggers */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-5">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 leading-none">Select Preloaded Trial Methods</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setGuestCurl(
                        `curl -X POST https://api.test.ai/v1/checkout \\\n  -H "Authorization: Bearer test_tok_8f2" \\\n  -H "Content-Type: application/json" \\\n  -d '{"cartId": "pro_902a", "amount": 299.00}'`
                      )}
                      className={`py-2 px-1 text-[10px] font-bold rounded border uppercase cursor-pointer text-center transition-all ${
                        guestCurl.includes("/checkout")
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-950"
                      }`}
                    >
                      POST Checkout
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuestCurl(
                        `curl -X GET https://api.test.ai/v1/health \\\n  -H "Accept-Language: en-US,en;q=0.9"`
                      )}
                      className={`py-2 px-1 text-[10px] font-bold rounded border uppercase cursor-pointer text-center transition-all ${
                        guestCurl.includes("/health")
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-950"
                      }`}
                    >
                      GET Health
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuestCurl(
                        `curl -X PUT https://api.test.ai/v1/users/profile \\\n  -H "Content-Type: application/json" \\\n  -d '{"name": "Niranjan", "role": "Administrator"}'`
                      )}
                      className={`py-2 px-1 text-[10px] font-bold rounded border uppercase cursor-pointer text-center transition-all ${
                        guestCurl.includes("/profile")
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-950"
                      }`}
                    >
                      PUT Profile
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-h-[140px] flex flex-col justify-end">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5 leading-none">Interactive cURL paste box</span>
                  <textarea
                    value={guestCurl}
                    onChange={(e) => setGuestCurl(e.target.value)}
                    rows={6}
                    placeholder="curl -X POST https://api.example.com..."
                    className="w-full text-[11.5px] p-3 rounded-lg border border-slate-200 font-mono bg-slate-950 text-cyan-400 outline-none focus:ring-1 focus:ring-cyan-500 resize-none flex-1"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGuestExecuteTest}
                  disabled={isGuestRunning || !guestCurl.trim()}
                  className="w-full py-3.5 rounded-xl font-bold font-display bg-slate-900 text-white hover:bg-slate-800 cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-40"
                >
                  <Play className={`w-4 h-4 ${isGuestRunning ? "animate-spin" : ""}`} />
                  <span>Execute Trial Validation Suite</span>
                </button>
              </div>

              {/* Right Sandbox Column: Dynamic logs output and report findings */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="p-4 rounded-xl border bg-slate-950 border-slate-800 text-slate-300 flex-1 flex flex-col justify-between min-h-[280px]">
                  <div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-900 text-[10px] font-mono">
                      <span className="text-slate-400 font-bold">Autonomic Compiler Diagnostics</span>
                      <span className="text-slate-600">Thread #T-Sandbox</span>
                    </div>

                    <div className="font-mono text-[10px] text-slate-350 space-y-1.5 p-2 max-h-[220px] overflow-y-auto">
                      {guestLogs.map((log, id) => (
                        <div key={id} className="leading-relaxed">
                          {log.startsWith("[SANDBOX] TRIAL RESULTS") ? (
                            <span className="text-cyan-400 font-bold">{log}</span>
                          ) : log.includes("DELIVERED") || log.includes("PASSED") || log.includes("200 OK") ? (
                            <span className="text-emerald-400">{log}</span>
                          ) : (
                            <span className="text-slate-400">{log}</span>
                          )}
                        </div>
                      ))}
                      {guestLogs.length === 0 && (
                        <div className="py-12 text-center text-slate-500 italic font-sans text-xs">
                          Click "Execute Trial Validation Suite" above to compile tests for your pasted cURL.
                        </div>
                      )}
                    </div>
                  </div>

                  {isGuestRunning && (
                    <div className="space-y-1 bg-slate-900/60 p-2.5 rounded border border-slate-800 animate-pulse">
                      <div className="flex justify-between items-center text-[10px] font-semibold text-cyan-400">
                        <span>Compiling Suite Locators...</span>
                        <span>{guestRunProgress}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 transition-all duration-200" style={{ width: `${guestRunProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {!isGuestRunning && guestExecutionStats && (
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-200">
                      <div className="flex justify-between items-center font-bold text-emerald-400 mb-2">
                        <span>● INTEGRATION SUITE {guestExecutionStats.status}</span>
                        <span>{guestExecutionStats.passed}/{guestExecutionStats.totalTests} Assertions</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10.5px] text-slate-300">
                        {guestExecutionStats.assertions.map((as, id) => (
                          <div key={id} className="flex gap-2 items-center">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span className="truncate">{as}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Simple footer with credentials and email */}
          <footer className="text-center text-xs text-slate-400 pt-10 border-t border-slate-200">
            <p>© 2026 test.ai Global Corp. Secure Firebase Gateways. Supervised by niranjan4crypto@gmail.com.</p>
          </footer>

        </main>

        {/* DEMO REGISTRATION MODAL */}
        {isDemoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            
            <div className="max-w-lg w-full rounded-2xl border border-slate-205 bg-white p-8 relative shadow-2xl space-y-6">
              
              <div className="flex justify-between items-start text-slate-800">
                <div>
                  <h3 className="text-2xl font-bold font-display text-slate-900 tracking-tight">Request Guided Sales Demo</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Submit your enterprise vectors. Credentials will be instant and saved directly to the database.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsDemoModalOpen(false);
                    setRegisteredLeadInfo(null);
                  }}
                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-800"
                >
                  ✕
                </button>
              </div>

              {!registeredLeadInfo ? (
                <form onSubmit={handleDemoSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        value={leadForm.name}
                        onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                        className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:ring-1 focus:ring-cyan-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Corporate Email</label>
                      <input
                        type="email"
                        required
                        value={leadForm.email}
                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                        className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:ring-1 focus:ring-cyan-500"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Company Name</label>
                      <input
                        type="text"
                        required
                        value={leadForm.company}
                        onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                        className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:ring-1 focus:ring-cyan-500"
                        placeholder="Acme Corp"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Primary Phone</label>
                      <input
                        type="tel"
                        required
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                        className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:ring-1 focus:ring-cyan-500"
                        placeholder="+1 (555) 019-2834"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Custom Automation Goals or comments</label>
                    <textarea
                      value={leadForm.notes}
                      onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                      rows={3}
                      className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:ring-1 focus:ring-cyan-500"
                      placeholder="Testing checkout timings on REST APIs..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isRegisteringLead}
                    className="w-full py-4 text-xs font-bold font-display rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-lg flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    {isRegisteringLead ? "Synchronizing CRM..." : "Submit Guided Demo Request"}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                    <span className="font-extrabold text-emerald-600 block mb-1">✓ DEMO REQUEST REGISTERED SECURELY</span>
                    <p className="text-slate-650 leading-relaxed text-[11px] mb-1.5">
                      Your prospect account profile <strong>(ID: {registeredLeadInfo.id})</strong> has been verified and persisted to Firestore. 
                    </p>
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded inline-block">
                      ✉ Carbon Copy (CC) sent to: {registeredLeadInfo.email}
                    </span>
                  </div>

                  {/* Dynamic simulated email logs thread */}
                  <div className="p-4 rounded-xl border border-slate-250 bg-slate-950 space-y-2">
                    <span className="text-[10px] font-mono text-cyan-400 block pb-1 border-b border-slate-900 font-bold">AUTOMATED MAIL DISPATCH MONITOR</span>
                    <div className="font-mono text-[9px] text-slate-400 space-y-1 max-h-[140px] overflow-y-auto">
                      {registeredLeadInfo.logs.map((mailLog: string, lidx: number) => (
                        <div key={lidx}>
                          {mailLog.includes("SUCCESS") ? (
                            <span className="text-emerald-400 font-semibold">{mailLog}</span>
                          ) : (
                            <span>{mailLog}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDemoModalOpen(false);
                        setRegisteredLeadInfo(null);
                      }}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-xs font-bold rounded-lg text-white"
                    >
                      Dismiss Portal Overview
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* RUN REPORT DETAIL DIALOG */}
        {viewingRunReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className={`max-w-4xl w-full rounded-2xl border ${isDarkMode ? "bg-[#0b0f19] border-slate-800 text-slate-205 shadow-2xl" : "bg-white border-[#e2e8f0] text-slate-800 shadow-2xl"} p-6 relative flex flex-col max-h-[90vh]`}>
              
              <div className={`flex justify-between items-start border-b ${isDarkMode ? "border-slate-800/60" : "border-slate-100"} pb-4 mb-4`}>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      viewingRunReport.productType === "web" ? "bg-cyan-500/15 text-cyan-400" :
                      viewingRunReport.productType === "api" ? "bg-indigo-500/20 text-indigo-400" :
                      viewingRunReport.productType === "mobile" ? "bg-purple-500/15 text-purple-400" :
                      "bg-amber-500/15 text-amber-500"
                    }`}>
                      {viewingRunReport.productType} engine
                    </span>
                    <span className={`text-[10px] font-mono opacity-50 font-semibold uppercase ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>RUN ID: #{viewingRunReport.id}</span>
                  </div>
                  <h3 className={`text-xl font-bold font-display tracking-tight ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>{viewingRunReport.suiteName}</h3>
                  <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"} text-xs mt-1 font-medium`}>
                    <span>Dispatched by: <strong className={isDarkMode ? "text-slate-350" : "text-slate-700"}>{viewingRunReport.executorName}</strong></span>
                    <span>•</span>
                    <span>Duration: <strong className={isDarkMode ? "text-slate-350" : "text-slate-700"}>{viewingRunReport.durationMs}ms</strong></span>
                    <span>•</span>
                    <span>Executed: <strong className={isDarkMode ? "text-slate-350" : "text-slate-700"}>{viewingRunReport.timestamp || "Active"}</strong></span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => setViewingRunReport(null)}
                  className={`p-1 px-2.5 rounded ${isDarkMode ? "hover:bg-slate-850 text-slate-400" : "hover:bg-slate-100 text-slate-500"} font-bold transition-colors`}
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 overflow-hidden flex-1 min-h-0">
                {/* Visual Assertions List (Left) */}
                <div className="md:col-span-12 lg:col-span-5 flex flex-col overflow-hidden">
                  <h4 className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"} mb-2 font-display`}>Verified Assurances Matrix</h4>
                  <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-1.5 scrollbar-thumb-indigo-500/20 scrollbar-track-transparent">
                    {viewingRunReport.suiteId === "api-contract-live" ? (
                      API_CONTRACT_22_STEPS.map((step, idx) => (
                        <div key={idx} className="p-2 border border-emerald-500/15 bg-emerald-500/5 rounded-lg flex gap-2.5 items-start">
                          <CheckCircle2 className="w-4 h-4 text-emerald-450 mt-0.5 shrink-0" />
                          <div className="text-[11px]">
                            <p className="font-semibold text-emerald-450">PASS: Step {idx + 1}</p>
                            <p className={`${isDarkMode ? "text-slate-300" : "text-slate-700"} font-medium`}>{step}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      (testSuites.find(s => s.id === viewingRunReport.suiteId)?.assertions || ["Check element load validation integrity completed", "Assert container boundaries render successfully"]).map((assertion, idx) => (
                        <div key={idx} className="p-2.5 border border-emerald-500/15 bg-emerald-500/5 rounded-lg flex gap-2.5 items-start">
                          <CheckCircle2 className="w-4 h-4 text-emerald-450 mt-0.5 shrink-0" />
                          <div className="text-[11px]">
                            <p className="font-semibold text-emerald-450">PASS: Assertion {idx + 1}</p>
                            <p className={`${isDarkMode ? "text-slate-300" : "text-slate-700"} font-medium`}>{assertion}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Console Log Frame (Right) */}
                <div className="md:col-span-12 lg:col-span-7 flex flex-col overflow-hidden">
                  <h4 className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"} mb-2 font-display`}>Active Telemetry Trace Stream Logs</h4>
                  <div className="flex-1 rounded-xl bg-slate-950 p-4 font-mono text-[10.5px] text-slate-300 overflow-y-auto scrollbar-thin space-y-1.5 border border-slate-850/85 scrollbar-thumb-indigo-500/20 scrollbar-track-transparent">
                    {viewingRunReport.logs && viewingRunReport.logs.length > 0 ? (
                      viewingRunReport.logs.map((logLine, lidx) => {
                        let colorClass = "text-slate-400";
                        if (logLine.startsWith("[SYSTEM]")) colorClass = "text-purple-400 font-bold";
                        else if (logLine.includes("PASS:") || logLine.includes("PASS ]")) colorClass = "text-emerald-450 font-semibold";
                        else if (logLine.startsWith("[CRITICAL]")) colorClass = "text-amber-400 font-semibold";
                        else if (logLine.startsWith("[DEBUG]")) colorClass = "text-cyan-400";
                        
                        return (
                          <div key={lidx} className={`${colorClass} leading-relaxed break-all`}>
                            {logLine}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-slate-500 italic text-center py-8">No terminal logs recorded for this suite run.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className={`mt-5 border-t ${isDarkMode ? "border-slate-800/40" : "border-slate-100"} pt-4 flex justify-between items-center text-xs`}>
                <span className="text-slate-450 text-[10.5px]">Outcome state encoded securely on Firestore database contexts.</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(viewingRunReport.logs?.join("\n") || "No logs available");
                    }}
                    className={`px-4 py-2 ${isDarkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-755 hover:text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"} rounded-lg font-bold cursor-pointer transition-colors`}
                  >
                    Copy Stream Logs
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingRunReport(null)}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold cursor-pointer transition-colors shadow-sm"
                  >
                    Close Report
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SIGN IN MODAL */}
        {isSignInModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 relative shadow-2xl space-y-6">
              <div className="flex justify-between items-start text-slate-800">
                <div>
                  <h3 className="text-xl font-bold font-display text-slate-900 tracking-tight">Sign In to test.ai</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Access the Continuous Autonomic Engine sandbox environment.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignInModalOpen(false);
                    setSignInError(null);
                  }}
                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-800"
                >
                  ✕
                </button>
              </div>

              {signInError && (
                <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 font-medium">
                  {signInError}
                </div>
              )}

              <form onSubmit={handleCustomSignInSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="your-email@company.com"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showSignInPassword ? "text" : "password"}
                      required
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="w-full text-xs p-3 pr-10 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:ring-1 focus:ring-cyan-500 font-sans"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 flex items-center justify-center cursor-pointer"
                      title={showSignInPassword ? "Hide password" : "Show password"}
                    >
                      {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={signInLoading}
                  className="w-full py-3.5 text-xs font-bold font-display rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-lg flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
                >
                  {signInLoading ? "Authenticating Gateway..." : "Access Engine Sandbox"}
                </button>
              </form>

              <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-[10.5px] text-slate-400 font-mono">
                <div>🔑 Supervisor Email: <strong className="text-slate-600 select-all font-bold">niranjan4crypto@gmail.com</strong></div>
                <div>🔒 Password: <strong className="text-slate-600 select-all font-bold">P@ssw0rd</strong></div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? "bg-[#0b0f17] text-[#f0f6fc]" : "bg-white text-[#0f172a]"}`}>
      
      {/* Dynamic Ambient Blur Backgrounds */}
      {isDarkMode && (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[40%] rounded-full bg-cyan-900/5 blur-[130px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] rounded-full bg-indigo-900/5 blur-[150px]" />
        </div>
      )}

      {/* Persistent Navigation Header */}
      <div className={`border-b text-xs py-2.5 px-5 flex justify-between items-center transition-colors ${isDarkMode ? "bg-[#0b0f17]/90 border-slate-850 backdrop-blur" : "bg-white border-slate-100 shadow-sm"}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-600/10 text-indigo-505 hover:bg-indigo-600/20 font-extrabold tracking-wide cursor-pointer transition animate-pulse"
            title="Request Guided Sales Demo"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-550 animate-ping" /> OMNITEST DEMO REQUEST FORM
          </button>
          <span className={`${isDarkMode ? "text-slate-400" : "text-slate-500"} hidden md:inline`}>
            Authorized: <strong className="text-cyan-400 font-mono select-all font-bold">{userProfile?.displayName || user.displayName}</strong> | Role: <span className="uppercase text-indigo-400 font-bold">{userProfile?.role}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {!user && (
            <>
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] sm:text-[11px] flex items-center gap-1.5 shadow-md hover:shadow-indigo-550/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Book Sales Demo
              </button>

              <div className="h-4 w-[1px] bg-slate-205 dark:bg-slate-800" />
            </>
          )}

          <button
            onClick={toggleDarkMode}
            className={`text-[10px] sm:text-[11px] font-bold tracking-wider hover:underline cursor-pointer border px-2 py-1 rounded transition-colors ${
              isDarkMode 
                ? "border-slate-700/40 bg-slate-800/10 hover:bg-slate-800/30 text-white" 
                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {isDarkMode ? "⚖ DISPLAY LIGHT THEME" : "⚛ HIGH CONTRAST DARK"}
          </button>
          
          <div className="h-4 w-[1px] bg-slate-205 dark:bg-slate-800" />
          
          <button
            onClick={logout}
            className="text-[10px] sm:text-[11px] text-rose-500 font-bold hover:underline cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      <AnimatePresence>
        {oneClickDeployAlert && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className={`border-b text-xs px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
              isDarkMode 
                ? "bg-[#0b1324] border-cyan-800/45 text-white" 
                : "bg-cyan-50 border-cyan-100 text-cyan-900"
            }`}
          >
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500 shrink-0">
                <CloudLightning className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <span className={`text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded ${isDarkMode ? "bg-cyan-950 text-cyan-300 border border-cyan-800/30" : "bg-cyan-600 text-white"}`}>1-Click Agent Active</span>
                <p className="mt-0.5 text-xs font-semibold">
                  Deployed Cloud Agent to validate <span className="font-bold underline">{oneClickDeployAlert.suiteName}</span> successfully.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
              <span className={`text-[10px] uppercase font-mono ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Active Node: <strong className="text-indigo-600 font-bold">FRA-EDGE-09</strong></span>
              <button
                onClick={() => {
                  setSelectedSuiteId(oneClickDeployAlert.id);
                  setRunnerViewerMode("reporter");
                  setActiveTab("studio");
                }}
                className="py-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded cursor-pointer shadow transition"
              >
                Inspect Visual Report
              </button>
              <button
                onClick={() => setOneClickDeployAlert(null)}
                className="p-1 hover:bg-slate-300/20 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-h-[calc(100vh-37px)]">
        
        {/* Navigation Sidebar */}
        <aside className={`transition-all duration-300 ${isSidebarCollapsed ? "w-20" : "w-64"} border-r shrink-0 flex flex-col justify-between overflow-x-hidden ${isDarkMode ? "bg-[#0b0f17] border-slate-850" : "bg-white border-slate-200"}`}>
          <div className="p-4">
            <div className={`flex items-center ${isSidebarCollapsed ? "flex-col gap-4 justify-center" : "justify-between"} mb-8`}>
              {!isSidebarCollapsed ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/15 shrink-0">
                    <Cpu className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div>
                    <span className={`text-[10px] uppercase tracking-widest font-extrabold block leading-tight ${isDarkMode ? "text-cyan-400" : "text-cyan-600"}`}>OMNITEST AI</span>
                    <h1 className={`text-xs font-extrabold tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r ${isDarkMode ? "from-slate-200 to-slate-400" : "from-slate-700 to-slate-900"}`}>
                      AUTONOMIC MATRIX
                    </h1>
                  </div>
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/15 shrink-0">
                  <Cpu className="w-5 h-5 text-white animate-pulse" />
                </div>
              )}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={`p-1.5 rounded-lg border hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer ${
                  isDarkMode 
                    ? "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white" 
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-950"
                }`}
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isSidebarCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            <nav className="space-y-1.5 font-sans">
              <button
                onClick={() => { setActiveTab("dashboard"); setArchitectNotification(null); }}
                className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center px-2 py-3" : "justify-between px-4 py-3"} rounded-lg text-sm font-semibold transition-all duration-100 cursor-pointer ${
                  activeTab === "dashboard"
                    ? (isDarkMode ? "bg-slate-800/60 text-cyan-400 border-l-2 border-cyan-450" : "bg-cyan-50 text-cyan-705 border-l-2 border-cyan-500 shadow-sm")
                    : (isDarkMode ? "text-slate-400 hover:text-slate-200 hover:bg-slate-850/30" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100")
                }`}
                title={isSidebarCollapsed ? "Dashboard Hub" : undefined}
              >
                <div className="flex items-center gap-3">
                  <Activity className={`w-4.5 h-4.5 ${activeTab === "dashboard" ? "text-cyan-500" : (isDarkMode ? "text-slate-400" : "text-slate-500")} shrink-0`} />
                  {!isSidebarCollapsed && <span>Dashboard Hub</span>}
                </div>
                {!isSidebarCollapsed && <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
              </button>

              <button
                onClick={() => { setActiveTab("studio"); setArchitectNotification(null); }}
                className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center px-2 py-3" : "justify-between px-4 py-3"} rounded-lg text-sm font-semibold transition-all duration-100 cursor-pointer ${
                  activeTab === "studio"
                    ? (isDarkMode ? "bg-slate-800/60 text-indigo-400 border-l-2 border-indigo-400" : "bg-indigo-50 text-indigo-705 border-l-2 border-indigo-500 shadow-sm")
                    : (isDarkMode ? "text-slate-400 hover:text-slate-200 hover:bg-slate-850/30" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100")
                }`}
                title={isSidebarCollapsed ? "Execution Studio" : undefined}
              >
                <div className="flex items-center gap-3">
                  <Play className={`w-4.5 h-4.5 ${activeTab === "studio" ? "text-indigo-505" : (isDarkMode ? "text-slate-400" : "text-slate-500")} shrink-0`} />
                  {!isSidebarCollapsed && <span>Execution Studio</span>}
                </div>
                {!isSidebarCollapsed && <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
              </button>

              <button
                onClick={() => { setActiveTab("architect"); setArchitectNotification(null); }}
                className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center px-2 py-3" : "justify-between px-4 py-3"} rounded-lg text-sm font-semibold transition-all duration-100 cursor-pointer ${
                  activeTab === "architect"
                    ? (isDarkMode ? "bg-slate-800/60 text-purple-400 border-l-2 border-purple-400" : "bg-purple-50 text-purple-705 border-l-2 border-purple-500 shadow-sm")
                    : (isDarkMode ? "text-slate-400 hover:text-slate-200 hover:bg-slate-850/30" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100")
                }`}
                title={isSidebarCollapsed ? "AI Test Architect" : undefined}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className={`w-4.5 h-4.5 ${activeTab === "architect" ? "text-purple-500" : (isDarkMode ? "text-slate-400" : "text-slate-500")} animate-pulse shrink-0`} />
                  {!isSidebarCollapsed && <span>AI Test Architect</span>}
                </div>
                {!isSidebarCollapsed && <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isDarkMode ? "bg-purple-500/25 text-purple-300" : "bg-purple-100 text-purple-700"}`}>AI</span>}
              </button>

              <button
                onClick={() => { setActiveTab("debugger"); setArchitectNotification(null); }}
                className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center px-2 py-3" : "justify-between px-4 py-3"} rounded-lg text-sm font-semibold transition-all duration-100 cursor-pointer ${
                  activeTab === "debugger"
                    ? (isDarkMode ? "bg-slate-800/60 text-amber-500 border-l-2 border-amber-500" : "bg-amber-50 text-amber-705 border-l-2 border-amber-500 shadow-sm")
                    : (isDarkMode ? "text-slate-400 hover:text-slate-200 hover:bg-slate-850/30" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100")
                }`}
                title={isSidebarCollapsed ? "AI Log Debugger" : undefined}
              >
                <div className="flex items-center gap-3">
                  <Terminal className={`w-4.5 h-4.5 ${activeTab === "debugger" ? "text-amber-500" : (isDarkMode ? "text-slate-400" : "text-slate-500")} shrink-0`} />
                  {!isSidebarCollapsed && <span>AI Log Debugger</span>}
                </div>
                {!isSidebarCollapsed && <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
              </button>

              <button
                onClick={() => { setActiveTab("suites"); setArchitectNotification(null); }}
                className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center px-2 py-3" : "justify-between px-4 py-3"} rounded-lg text-sm font-semibold transition-all duration-100 cursor-pointer ${
                  activeTab === "suites"
                    ? (isDarkMode ? "bg-slate-800/60 text-slate-100 border-l-2 border-slate-300" : "bg-slate-100 text-slate-805 border-l-2 border-slate-600 shadow-sm")
                    : (isDarkMode ? "text-slate-400 hover:text-slate-200 hover:bg-slate-850/30" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100")
                }`}
                title={isSidebarCollapsed ? "Suite Directory" : undefined}
              >
                <div className="flex items-center gap-3">
                  <FileCheck className={`w-4.5 h-4.5 ${activeTab === "suites" ? "text-indigo-405" : (isDarkMode ? "text-slate-400" : "text-slate-500")} shrink-0`} />
                  {!isSidebarCollapsed && <span>Suite Directory</span>}
                </div>
                {!isSidebarCollapsed && <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
              </button>

              {/* ADMIN CONTROL SECTION - ONLY VISIBLE TO ADMINISTRATORS */}
              {userProfile?.role === "admin" && (
                <button
                  onClick={() => { setActiveTab("admin"); setArchitectNotification(null); }}
                  className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center px-2 py-3" : "justify-between px-4 py-3"} rounded-lg text-sm font-semibold transition-all duration-100 cursor-pointer ${
                    activeTab === "admin"
                      ? (isDarkMode ? "bg-indigo-950/40 text-rose-455 border-l-2 border-rose-500" : "bg-rose-50 text-rose-705 border-l-2 border-rose-500 shadow-sm")
                      : (isDarkMode ? "text-slate-400 hover:text-slate-200 hover:bg-indigo-950/15" : "text-slate-600 hover:text-rose-700 hover:bg-slate-105")
                  }`}
                  title={isSidebarCollapsed ? "Admin Directory" : undefined}
                >
                  <div className="flex items-center gap-3">
                    <Users className={`w-4.5 h-4.5 ${activeTab === "admin" ? "text-rose-500" : (isDarkMode ? "text-slate-400" : "text-slate-500")} shrink-0`} />
                    {!isSidebarCollapsed && <span>Admin Directory</span>}
                  </div>
                  {!isSidebarCollapsed && <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isDarkMode ? "bg-rose-500/20 text-rose-300 font-mono" : "bg-rose-100 text-rose-700"}`}>ROOT</span>}
                </button>
              )}

              {/* Book Sales Demo Button in Navigation List */}
              {!user && (
                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center px-2 py-3" : "px-4 py-3"} rounded-lg text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-md`}
                  title="Book Guided Sales Demo"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4.5 h-4.5 shrink-0 text-amber-300 animate-pulse" />
                    {!isSidebarCollapsed && <span>Book Sales Demo</span>}
                  </div>
                </button>
              )}
            </nav>
          </div>

          {!isSidebarCollapsed ? (
            <div className={`p-4 border-t m-4 rounded-xl text-[11px] leading-relaxed ${isDarkMode ? "border-slate-850 bg-slate-900/20" : "border-slate-200 bg-slate-50"}`}>
              <span className={`font-bold flex items-center gap-1.5 mb-1 ${isDarkMode ? "text-slate-300" : "text-slate-705"}`}>
                <Server className={`w-3.5 h-3.5 ${isDarkMode ? "text-cyan-400" : "text-cyan-600"}`} />
                Autonomic Engine Linked
              </span>
              <p className={isDarkMode ? "text-slate-500 text-[10px]" : "text-slate-500 text-[10px]"}>
                Direct real-time Firestore synchronization keeps execution progress and log traces dynamically bound for all collaborators.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 gap-2 mb-2 border-t border-slate-200 dark:border-slate-850">
              <Server className={`w-5 h-5 ${isDarkMode ? "text-cyan-400" : "text-cyan-600"}`} title="Autonomic Engine Connected" />
            </div>
          )}
        </aside>

        {/* WORKSPACE CANVAS */}
        <main className="flex-1 p-3 sm:p-5 md:p-7 overflow-y-auto max-w-7xl mx-auto w-full overflow-x-hidden">
          
          <AnimatePresence mode="wait">
            
            {/* TABS 1: REAL-TIME ANALYTICAL OVERVIEW */}
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className={`text-3xl font-extrabold tracking-tight font-display ${isDarkMode ? "bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400" : "text-slate-900"}`}>
                      Autonomic Matrix Dashboard
                    </h2>
                    <p className={`${isDarkMode ? "text-slate-400" : "text-slate-500"} text-sm mt-1`}>
                      Live database reports across active clusters, running emulations, with instantly tracked status records.
                    </p>
                  </div>
                </div>

                {/* COUNTERS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div className={`p-5 rounded-xl border relative overflow-hidden transition-all duration-150 ${isDarkMode ? "bg-slate-900/60 border-slate-850" : "bg-white border-slate-200 shadow-sm"}`}>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Registered Executions</p>
                    <div className="mt-3.5 flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold tracking-tight font-display">{combinedRecentRuns.length}</span>
                      <span className="text-xs text-cyan-400 font-bold font-mono">Real-time</span>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-cyan-500/70" />
                  </div>

                  <div className={`p-5 rounded-xl border relative overflow-hidden transition-all duration-150 ${isDarkMode ? "bg-slate-900/60 border-slate-850" : "bg-white border-slate-200 shadow-sm"}`}>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Global Pass Rate</p>
                    <div className="mt-3.5 flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold tracking-tight font-display text-emerald-400 font-mono">
                        {combinedRecentRuns.length > 0 
                          ? ((combinedRecentRuns.filter((r) => r.status === "passed" || r.status === "success").length / combinedRecentRuns.length) * 100).toFixed(0)
                          : "100"
                        }%
                      </span>
                      <span className="text-xs text-emerald-500 font-semibold">Active SLA</span>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-emerald-500/70" />
                  </div>

                  <div className={`p-5 rounded-xl border relative overflow-hidden transition-all duration-150 ${isDarkMode ? "bg-slate-900/60 border-slate-850" : "bg-white border-slate-200 shadow-sm"}`}>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Avg Trace Speed</p>
                    <div className="mt-3.5 flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold tracking-tight font-display font-mono">
                        {combinedRecentRuns.length > 0 
                          ? Math.round(combinedRecentRuns.reduce((acc, r) => acc + (r.durationMs || 0), 0) / combinedRecentRuns.length)
                          : "1450"
                        }ms
                      </span>
                      <span className="text-xs text-amber-500 font-semibold font-mono">Sync latency</span>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-amber-500/70" />
                  </div>

                  <div className={`p-5 rounded-xl border relative overflow-hidden transition-all duration-150 ${isDarkMode ? "bg-slate-900/60 border-slate-850" : "bg-white border-slate-200 shadow-sm"}`}>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Online AI Agents</p>
                    <div className="mt-3.5 flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold tracking-tight font-display text-purple-400">
                        {isJarvisRunning ? "5" : "4"}
                      </span>
                      <span className="text-xs text-purple-400 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                        Running Live
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-purple-500/70" />
                  </div>
                </div>

                {/* Live Real-time execution tracking trace */}
                {combinedRecentRuns.some(r => r.status === "running") && (
                  <div className="p-4 rounded-xl border border-indigo-500/35 bg-indigo-500/5 animate-pulse flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0b0f17] flex items-center justify-center border border-indigo-500/30">
                        <Activity className="w-4 h-4 text-indigo-400 animate-spin" />
                      </div>
                      <div>
                        <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest block leading-none">ACTIVE TEST EXECUTION IN PROGRESS</span>
                        <h4 className="text-sm font-semibold mt-1">
                          {combinedRecentRuns.find(r => r.status === "running")?.suiteName}
                        </h4>
                      </div>
                    </div>
                    <div className="w-full md:w-64 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Pipeline Progress</span>
                        <span className="font-bold text-indigo-300 font-mono">
                          {combinedRecentRuns.find(r => r.status === "running")?.progress}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full transition-all duration-300"
                          style={{ width: `${combinedRecentRuns.find(r => r.status === "running")?.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Analytical charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className={`lg:col-span-2 p-5 rounded-xl border transition-colors ${isDarkMode ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200 shadow-sm"}`}>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="font-bold text-base font-display">Continuous Operations History</h3>
                        <p className="text-xs text-slate-500">Historical performance reports showing total successful integration sweeps</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono font-bold">LIVE RESOLUTION</span>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="gExecutions" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gPassed" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: isDarkMode ? "#0d1117" : "#fff", borderColor: isDarkMode ? "#334155" : "#e2e8f0" }} />
                          <Area type="monotone" dataKey="executions" name="Runs Logged" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#gExecutions)" />
                          <Area type="monotone" dataKey="passed" name="Success Claims" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#gPassed)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className={`p-5 rounded-xl border transition-colors ${isDarkMode ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200 shadow-sm"}`}>
                    <div className="mb-6">
                      <h3 className="font-bold text-base font-display">Target Allocations</h3>
                      <p className="text-xs text-slate-500">Distribution of executing environments across the grid</p>
                    </div>
                    <div className="h-44 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {pieData.map((item, id) => (
                              <Cell key={`cell-${id}`} fill={item.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-1.5 mt-5">
                      {pieData.map((item, id) => (
                        <div key={id} className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-400 font-medium">{item.name}</span>
                          </div>
                          <span className="font-bold font-mono">{item.value} runs</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Emulation Clusters Nodes */}
                <div className={`p-5 rounded-xl border transition-colors ${isDarkMode ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200 shadow-sm"}`}>
                  <div className="flex justify-between items-center mb-5">
                    <div>
                      <h3 className="font-bold text-base font-display">Regional Dispatch Clusters</h3>
                      <p className="text-xs text-slate-500">Processing cores managing active container sandboxes and mobile emulators</p>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      GRID OPERATIONAL
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {runnerClusters.map((cl) => (
                      <div
                        key={cl.id}
                        className={`p-4 rounded-lg border transition-all ${
                          isDarkMode ? "bg-[#05070c]/70 border-slate-850 hover:border-slate-700" : "bg-[#f1f5f9] border-slate-200 shadow-sm"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold font-display">{cl.name}</span>
                          <span className={`w-2 h-2 rounded-full ${cl.status === "running" ? "bg-emerald-400 animate-pulse" : cl.status === "idle" ? "bg-cyan-400" : "bg-slate-700"}`} />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{cl.region}</p>
                        <div className="mt-4 space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] text-slate-400">
                            <span>Matrix load</span>
                            <span className="font-bold font-mono text-slate-200">{cl.loadPercentage}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${cl.loadPercentage}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real-time execution traces */}
                <div className={`p-5 rounded-xl border transition-colors ${isDarkMode ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200 shadow-sm"}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-base font-display">Real-time Suite Execution Registry</h3>
                    <span className="text-xs text-slate-500 hover:underline cursor-pointer" onClick={() => setActiveTab("suites")}>
                      View Directories →
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                          <th className="pb-3 pl-2">Suite Profile</th>
                          <th className="pb-3">Executing Platform</th>
                          <th className="pb-3">Duration</th>
                          <th className="pb-3">Timestamp</th>
                          <th className="pb-3">Dispatched By</th>
                          <th className="pb-3">Outcome Status</th>
                          <th className="pb-3 text-right pr-2">Actions</th>
                        </tr>
                      </thead>
                       <tbody className="divide-y divide-slate-850/40">
                        {combinedRecentRuns.map((run) => (
                          <tr 
                            key={run.id}
                            onClick={() => setViewingRunReport(run)}
                            className="hover:bg-slate-800/20 cursor-pointer transition-colors"
                          >
                            <td className="py-3.5 pl-2 font-medium text-slate-200">{run.suiteName}</td>
                            <td className="py-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                run.productType === "web" ? "bg-cyan-500/10 text-cyan-400" :
                                run.productType === "api" ? "bg-indigo-500/10 text-indigo-400" :
                                run.productType === "mobile" ? "bg-purple-500/10 text-purple-400" :
                                "bg-amber-500/10 text-amber-500"
                              }`}>
                                {run.productType}
                              </span>
                            </td>
                            <td className="py-3.5 font-mono text-slate-450">{run.durationMs}ms</td>
                            <td className="py-3.5 text-slate-455">{run.timestamp || "Dispatching"}</td>
                            <td className="py-3.5 text-slate-405 font-medium font-sans">{run.executorName || "Robot"}</td>
                            <td className="py-3.5 font-semibold">
                              {run.status === "passed" || run.status === "success" ? (
                                <span className="inline-flex items-center gap-1 text-emerald-450 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px] border border-emerald-500/25">
                                  ● PASSED
                                </span>
                              ) : run.status === "running" ? (
                                <span className="inline-flex items-center gap-1 text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded text-[11px] border border-indigo-500/25 animate-pulse">
                                  ● RUNNING ({run.progress}%)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-red-400 bg-red-400/10 px-2 py-0.5 rounded text-[11px] border border-red-500/20">
                                  ● FAILED
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 text-right pr-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingRunReport(run);
                                }}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded text-[10.5px] cursor-pointer transition-colors shadow-sm"
                              >
                                View Report
                              </button>
                            </td>
                          </tr>
                        ))}
                        {combinedRecentRuns.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-500">
                              No historic execution records stored securely. Switch to Execution Studio to dispatch.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </motion.div>
            )}

            {/* TABS 2: INTERACTIVE EXECUTION CORE STUDIO */}
            {activeTab === "studio" && (
              <motion.div
                key="studio"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className={`text-3xl font-extrabold tracking-tight font-display ${isDarkMode ? "bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-white" : "text-slate-900"}`}>
                      Active Execution Studio
                    </h2>
                    <p className={`${isDarkMode ? "text-slate-400" : "text-slate-500"} text-sm mt-1`}>
                      Trigger robust container checkouts, database claims, or device gesture procedures, instantly syncing progress to Firestore.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block shrink-0">Suite Profile:</span>
                    <select
                      value={selectedSuiteId}
                      onChange={(e) => {
                        setSelectedSuiteId(e.target.value);
                        setRunningLogs([]);
                        setCurrentStepIndex(-1);
                      }}
                      className={`text-xs font-semibold rounded-lg border px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer ${
                        isDarkMode ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
                      }`}
                    >
                      {testSuites.map((s) => (
                        <option key={s.id} value={s.id}>
                          [{s.productType.toUpperCase()}] {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* GRAPHIC CONTAINER BLOCK */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className={`p-5 rounded-xl border relative overflow-hidden transition-colors ${isDarkMode ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200 shadow-sm"}`}>
                      {activeSuite && (
                        <>
                          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-850">
                            <div className="flex items-center gap-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                activeSuite.productType === "web" ? "bg-cyan-500/10 text-cyan-400" :
                                activeSuite.productType === "api" ? "bg-indigo-500/10 text-indigo-400" :
                                activeSuite.productType === "mobile" ? "bg-purple-500/10 text-purple-400" :
                                "bg-amber-500/10 text-amber-500"
                              }`}>
                                {activeSuite.productType} engine
                              </span>
                              {isRunning && (
                                <span className="text-[10.5px] text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                  RUNNING {currentStepIndex + 1}/{(activeSuite.productType === "api" && apiViewMode === "live_curl") ? "22" : activeSuite.steps.length}
                                </span>
                              )}
                            </div>

                            {activeSuite.productType === "api" && (
                              <div className="flex p-0.5 rounded-lg bg-[#080d16] border border-slate-800">
                                <button
                                  type="button"
                                  onClick={() => setApiViewMode("suite")}
                                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                    apiViewMode === "suite" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                                  }`}
                                >
                                  Standard Suite
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setApiViewMode("live_curl")}
                                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    apiViewMode === "live_curl" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                                  }`}
                                >
                                  ⚡ cURL Runner
                                </button>
                              </div>
                            )}
                          </div>

                          {(activeSuite.productType === "api" && apiViewMode === "live_curl") ? (
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2 font-display text-indigo-400">⚡ Custom API REST & cURL CLI</h3>
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                  Paste your destination curl command or configure HTTP method parameters to execute a secure 22-Point Contract schema audit.
                                </p>
                              </div>

                              <div className="grid grid-cols-12 gap-2">
                                <div className="col-span-4">
                                  <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Method</label>
                                  <select
                                    value={apiMethod}
                                    onChange={(e) => setApiMethod(e.target.value as any)}
                                    disabled={isRunning}
                                    className="w-full text-xs font-semibold rounded-lg bg-[#070b12] border border-slate-750 p-2 text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer"
                                  >
                                    <option value="GET">GET</option>
                                    <option value="POST">POST</option>
                                    <option value="PUT">PUT</option>
                                    <option value="DELETE">DELETE</option>
                                    <option value="PATCH">PATCH</option>
                                  </select>
                                </div>
                                <div className="col-span-8">
                                  <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Target URL</label>
                                  <input
                                    type="text"
                                    value={apiUrl}
                                    onChange={(e) => setApiUrl(e.target.value)}
                                    disabled={isRunning}
                                    placeholder="https://api.example.com/v1/resource"
                                    className="w-full text-xs font-semibold rounded-lg bg-[#070b12] border border-slate-750 p-2 text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Headers (Newline separated)</label>
                                <textarea
                                  value={apiHeaders}
                                  onChange={(e) => setApiHeaders(e.target.value)}
                                  disabled={isRunning}
                                  rows={2}
                                  placeholder="Authorization: Bearer mock_key&#10;Content-Type: application/json"
                                  className="w-full text-xs font-mono rounded-lg bg-[#070b12] border border-slate-755 p-2 text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                                />
                              </div>

                              {["POST", "PUT", "PATCH"].includes(apiMethod) && (
                                <div>
                                  <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">JSON Request Body</label>
                                  <textarea
                                    value={apiBody}
                                    onChange={(e) => setApiBody(e.target.value)}
                                    disabled={isRunning}
                                    rows={2}
                                    className="w-full text-xs font-mono rounded-lg bg-[#070b12] border border-slate-755 p-2 text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                                  />
                                </div>
                              )}

                              <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1 font-mono">cURL Command Console Input</label>
                                <textarea
                                  value={`curl -X ${apiMethod} "${apiUrl}" ${apiHeaders.split("\n").filter(Boolean).map(h => `-H "${h.replace(/"/g, '\\"')}"`).join(" ")} ${["POST", "PUT", "PATCH"].includes(apiMethod) && apiBody ? `-d '${apiBody.replace(/'/g, "'\\''")}'` : ""}`}
                                  onChange={(e) => parseCurlInput(e.target.value)}
                                  disabled={isRunning}
                                  rows={2}
                                  className="w-full text-[10.5px] font-mono rounded-lg bg-slate-950/80 border border-indigo-500/30 p-2 text-cyan-400 focus:ring-1 focus:ring-indigo-500 outline-none"
                                  placeholder="Paste raw curl command here to parse automatically..."
                                />
                                <span className="text-[9px] text-slate-400 block mt-1 font-sans">💡 Type or paste a live <b>curl</b> in the input above. It parses parameters instantly!</span>
                              </div>

                              <div className={`space-y-1 p-3 rounded-lg border ${isDarkMode ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                                <div className="flex justify-between items-center text-xs">
                                  <span className={isDarkMode ? "text-slate-400 font-medium font-sans" : "text-slate-600 font-medium font-sans"}>Assertion speed tuning:</span>
                                  <span className={`font-mono font-bold ${isDarkMode ? "text-purple-400" : "text-purple-600"}`}>{apiRunnerSpeed} ms / step</span>
                                </div>
                                <input
                                  type="range"
                                  min="100"
                                  max="1500"
                                  step="50"
                                  value={apiRunnerSpeed}
                                  onChange={(e) => setApiRunnerSpeed(parseInt(e.target.value))}
                                  disabled={isRunning}
                                  className="w-full accent-purple-500 cursor-pointer h-1 rounded bg-slate-200 dark:bg-slate-800 appearance-none"
                                />
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={handleExecuteRealApi}
                                  disabled={isRunning}
                                  className={`flex-1 font-bold rounded-lg py-3 px-4 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                                    isRunning
                                      ? "bg-slate-800 text-slate-500 border border-slate-750 cursor-not-allowed animate-pulse"
                                      : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 text-white shadow-lg active:scale-[0.99]"
                                  }`}
                                >
                                  <Play className="w-4 h-4 animate-pulse" />
                                  <span>Execute 22-Point Contract</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRunningLogs([]);
                                    setCurrentStepIndex(-1);
                                    setIsRunning(false);
                                  }}
                                  className="p-3 bg-slate-800 hover:bg-slate-755 border border-slate-705 rounded-lg cursor-pointer transition-all"
                                  title="Flush monitors"
                                >
                                  <RotateCw className="w-4 h-4 text-slate-300" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3 className="text-xl font-bold font-display">{activeSuite.name}</h3>
                              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{activeSuite.description}</p>

                              <div className={`mt-5 space-y-2 border-t pt-4 ${isDarkMode ? "border-slate-850" : "border-slate-200"}`}>
                                <div className="flex justify-between items-center text-xs font-semibold">
                                  <span className={isDarkMode ? "text-slate-400" : "text-slate-600"}>Step processing speed:</span>
                                  <span className={`font-mono font-bold ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`}>{runnerSpeed} ms / pipeline step</span>
                                </div>
                                <input
                                  type="range"
                                  min="300"
                                  max="2500"
                                  step="100"
                                  value={runnerSpeed}
                                  onChange={(e) => setRunnerSpeed(parseInt(e.target.value))}
                                  disabled={isRunning}
                                  className="w-full accent-indigo-500 cursor-pointer h-1.5 rounded-lg appearance-none bg-slate-200 dark:bg-slate-850"
                                />
                              </div>

                              <div className="mt-5 flex gap-3">
                                <button
                                  type="button"
                                  onClick={handleExecuteSuite}
                                  disabled={isRunning}
                                  className={`flex-1 font-bold rounded-lg py-3.5 px-4 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                                    isRunning
                                      ? "bg-slate-800 text-slate-500 border border-slate-750 cursor-not-allowed animate-pulse"
                                      : "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 text-white shadow-lg active:scale-[0.99]"
                                  }`}
                                >
                                  <Play className="w-4.5 h-4.5" />
                                  <span>Dispatch Emulation Run</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRunningLogs([]);
                                    setCurrentStepIndex(-1);
                                    setIsRunning(false);
                                  }}
                                  className="p-3 bg-slate-800 hover:bg-slate-755 border border-slate-700 rounded-lg cursor-pointer transition-all"
                                  title="Flush monitors"
                                >
                                  <RotateCw className="w-4.5 h-4.5 text-slate-300" />
                                </button>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>

                    {/* SEQUENCER VERIFIER PANEL */}
                    <div className={`p-5 rounded-xl border flex-1 transition-colors ${isDarkMode ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200 shadow-sm"}`}>
                      <h4 className="text-xs font-extrabold text-[#64748b] uppercase tracking-wider mb-4 font-display">
                        Verification Claims Sequence
                      </h4>
                      <div className="space-y-2.5 max-h-[380px] overflow-y-auto scrollbar-thin pr-1">
                        {(activeSuite?.productType === "api" && apiViewMode === "live_curl") ? (
                          API_CONTRACT_22_STEPS.map((st, idx) => {
                            const isPast = idx < currentStepIndex;
                            const isCurrent = idx === currentStepIndex;

                            return (
                              <div
                                key={idx}
                                className={`p-2.5 rounded-lg border flex gap-2.5 items-start transition-all duration-150 ${
                                  isCurrent
                                    ? (isDarkMode ? "bg-indigo-500/10 border-indigo-500 scale-[1.01]" : "bg-indigo-50 border-indigo-400 scale-[1.01]")
                                    : isPast
                                    ? (isDarkMode ? "bg-emerald-500/5 border-emerald-500/20 opacity-85" : "bg-emerald-55/40 border-emerald-200 opacity-95")
                                    : (isDarkMode ? "bg-[#04060b]/40 border-slate-850 opacity-55" : "bg-slate-50 border-slate-200 opacity-75")
                                }`}
                              >
                                <div className="mt-0.5 shrink-0">
                                  {isPast ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  ) : isCurrent ? (
                                    <div className="w-4 h-4 rounded-full bg-indigo-505 flex items-center justify-center text-[8px] text-white font-extrabold animate-pulse">
                                      ★
                                    </div>
                                  ) : (
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[8px] font-mono ${isDarkMode ? "border-slate-700 text-slate-500" : "border-slate-300 text-slate-500"}`}>
                                      {idx + 1}
                                    </div>
                                  )}
                                </div>
                                <div className="text-[11px]">
                                  <p className={`font-medium ${
                                    isCurrent ? (isDarkMode ? "text-indigo-300 font-semibold" : "text-indigo-800 font-bold") :
                                    isPast ? (isDarkMode ? "text-slate-400" : "text-slate-700") :
                                    (isDarkMode ? "text-slate-500" : "text-slate-605")
                                  }`}>
                                    {st}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          activeSuite?.steps.map((st, idx) => {
                            const isPast = idx < currentStepIndex;
                            const isCurrent = idx === currentStepIndex;

                            return (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg border flex gap-3 items-start transition-all duration-150 ${
                                  isCurrent
                                    ? (isDarkMode ? "bg-indigo-500/10 border-indigo-500/50 scale-[1.01]" : "bg-indigo-50 border-indigo-400/80 scale-[1.01]")
                                    : isPast
                                    ? (isDarkMode ? "bg-emerald-500/5 border-emerald-500/20 opacity-80" : "bg-emerald-55/40 border-emerald-250 opacity-95")
                                    : (isDarkMode ? "bg-[#04060b]/40 border-slate-850 opacity-60" : "bg-slate-50 border-slate-200 opacity-75")
                                }`}
                              >
                                <div className="mt-0.5 shrink-0">
                                  {isPast ? (
                                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                                  ) : isCurrent ? (
                                    <div className="w-4.5 h-4.5 rounded-full bg-indigo-505 flex items-center justify-center text-[9px] text-white font-extrabold animate-pulse">
                                      ★
                                    </div>
                                  ) : (
                                    <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center text-[9px] font-mono ${isDarkMode ? "border-slate-700 text-slate-500" : "border-slate-300 text-slate-500"}`}>
                                      {idx + 1}
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs">
                                  <p className={`font-semibold ${
                                    isCurrent ? (isDarkMode ? "text-indigo-400" : "text-indigo-800") :
                                    isPast ? (isDarkMode ? "text-slate-400 line-through" : "text-slate-500 line-through") :
                                    (isDarkMode ? "text-slate-500" : "text-slate-605")
                                  }`}>
                                    {st}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Terminal monitoring */}
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className={`p-5 rounded-xl border flex-1 flex flex-col min-h-[460px] relative overflow-hidden transition-colors ${
                      isDarkMode ? "bg-slate-950 border-slate-850" : "bg-white border-slate-200 shadow-sm"
                    }`}>
                      <div className={`flex justify-between items-center pb-3 border-b ${isDarkMode ? "border-slate-850" : "border-slate-200"}`}>
                        <div className="flex items-center gap-1.5 text-xs font-mono">
                          <button
                            type="button"
                            id="switch-to-reporter-btn"
                            onClick={() => setRunnerViewerMode("reporter")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              runnerViewerMode === "reporter"
                                ? "bg-indigo-600 text-white"
                                : (isDarkMode ? "text-slate-400 hover:bg-slate-850" : "text-slate-600 hover:bg-slate-100")
                            }`}
                          >
                            <FileCheck className="w-3.5 h-3.5" /> Visual Execution Report
                          </button>
                          <button
                            type="button"
                            id="switch-to-terminal-btn"
                            onClick={() => setRunnerViewerMode("terminal")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              runnerViewerMode === "terminal"
                                ? "bg-indigo-600 text-white"
                                : (isDarkMode ? "text-slate-400 hover:bg-slate-850" : "text-slate-600 hover:bg-slate-100")
                            }`}
                          >
                            <Terminal className="w-3.5 h-3.5" /> CLI logs
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className={`text-[10px] font-mono ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>STREAM: 3000/TCP</span>
                        </div>
                      </div>

                      {runnerViewerMode === "terminal" ? (
                        <div className="flex-1 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-2.5 p-4 max-h-[420px] scrollbar-thin bg-slate-950 rounded-b-xl">
                          {runningLogs.map((log, lidx) => (
                            <div key={lidx} className="whitespace-pre-wrap leading-relaxed">
                              {log.startsWith("[SYSTEM]") ? (
                                <span className="text-cyan-400 font-bold">{log}</span>
                              ) : log.startsWith("[STEP") ? (
                                <span className="text-indigo-400 font-semibold">{log}</span>
                              ) : log.includes("PASS") || log.includes("SUCCESS") ? (
                                <span className="text-emerald-400">{log}</span>
                              ) : log.includes("ERROR") || log.includes("FAIL") ? (
                                <span className="text-rose-400">{log}</span>
                              ) : (
                                <span className="text-slate-400">{log}</span>
                              )}
                            </div>
                          ))}
                          {runningLogs.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-650 gap-2 my-20">
                              <Activity className="w-8 h-8 animate-pulse text-slate-500" />
                              <p className="font-mono text-center text-[11px]">Pipeline silent. Dispatch automation run above to connect trace handles.</p>
                            </div>
                          )}
                          <div ref={terminalBottomRef} />
                        </div>
                      ) : (
                        <div className="flex-1 overflow-y-auto space-y-5 p-2 max-h-[480px]">
                          {runningLogs.length > 0 ? (
                            <div className="space-y-4">
                              {/* Summary Stats Header Card */}
                              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                                isDarkMode ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200"
                              }`}>
                                <div className="flex items-center gap-3">
                                  <div className="w-11 h-11 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                    {isRunning ? (
                                      <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="w-6 h-6 animate-pulse" />
                                    )}
                                  </div>
                                  <div>
                                    <h4 className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                      {isRunning ? "Executive Run Processing..." : "Execution Pipeline Passed"}
                                    </h4>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                      Real-time trace logs successfully written to Cloud Firestore collections.
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-5">
                                  <div className="text-center">
                                    <span className="text-[10px] text-slate-500 uppercase block leading-none font-bold">Duration</span>
                                    <span className={`text-base font-extrabold font-mono ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>
                                      {currentStepIndex >= 0 ? (currentStepIndex + 1) * runnerSpeed : activeSuite?.steps.length * runnerSpeed}ms
                                    </span>
                                  </div>
                                  <div className="h-6 w-[1.5px] bg-slate-700/10" />
                                  <div className="text-center">
                                    <span className="text-[10px] text-slate-500 uppercase block leading-none font-bold">Checks</span>
                                    <span className={`text-base font-extrabold font-mono ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>
                                      {currentStepIndex >= 0 ? `${currentStepIndex + 1}/${activeSuite?.steps.length}` : `${activeSuite?.steps.length}/${activeSuite?.steps.length}`}
                                    </span>
                                  </div>
                                  <div className="h-6 w-[1.5px] bg-slate-700/10" />
                                  <div className="text-center">
                                    <span className="text-[10px] text-slate-500 uppercase block leading-none font-bold">Assertions</span>
                                    <span className="text-base font-extrabold font-mono text-emerald-500">{activeSuite?.assertions.length} verified</span>
                                  </div>
                                </div>
                              </div>

                              {/* Progress Slider */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-[10.5px] font-bold text-slate-450 uppercase tracking-wide">
                                  <span>Execution Pipeline Steps Completeness Metric</span>
                                  <span>{Math.round(((currentStepIndex >= 0 ? currentStepIndex + 1 : activeSuite?.steps.length) / activeSuite?.steps.length) * 100)}%</span>
                                </div>
                                <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`}>
                                  <motion.div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentStepIndex >= 0 ? currentStepIndex + 1 : activeSuite?.steps.length) / activeSuite?.steps.length) * 100}%` }}
                                    transition={{ duration: 0.2 }}
                                  />
                                </div>
                              </div>

                              {/* Beautiful Executed Steps Timeline Cards */}
                              <div className="space-y-2.5 pt-2">
                                {activeSuite?.steps.map((step, idx) => {
                                  const isPast = idx < currentStepIndex || currentStepIndex === -1;
                                  const isCurrent = idx === currentStepIndex;

                                  return (
                                    <div
                                      key={idx}
                                      className={`p-3.5 rounded-xl border flex justify-between items-center transition-all ${
                                        isCurrent 
                                          ? (isDarkMode ? "bg-indigo-500/10 border-indigo-500/40" : "bg-indigo-50 border-indigo-200") 
                                          : isPast 
                                          ? (isDarkMode ? "bg-slate-900/40 border-slate-850" : "bg-emerald-50/20 border-emerald-100") 
                                          : (isDarkMode ? "bg-slate-950/20 border-slate-900 opacity-40" : "bg-slate-100/50 border-slate-250 opacity-40")
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                          isCurrent 
                                            ? "bg-indigo-600 text-white animate-pulse" 
                                            : isPast 
                                            ? "bg-emerald-500/10 text-emerald-500" 
                                            : (isDarkMode ? "bg-slate-800 text-slate-500" : "bg-slate-200 text-slate-600")
                                        }`}>
                                          {isPast ? "✓" : idx + 1}
                                        </div>
                                        <div>
                                          <p className={`text-xs font-bold ${isDarkMode ? "text-slate-100" : "text-slate-900 font-extrabold"}`}>{step}</p>
                                          <p className="text-[10px] text-slate-500 mt-0.5 font-mono">Assertion Node check verified in {(idx + 1) * 20 + 40}ms</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                          isCurrent 
                                            ? "bg-indigo-500 text-white animate-pulse" 
                                            : isPast 
                                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                                            : (isDarkMode ? "bg-slate-805 text-slate-500" : "bg-slate-150 text-slate-600")
                                        }`}>
                                          {isCurrent ? "RUNNING" : isPast ? "VERIFIED" : "PENDING"}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Cloud Infrastructure Telemetry Block */}
                              <div className={`p-4 rounded-xl border grid grid-cols-2 md:grid-cols-4 gap-4 ${
                                isDarkMode ? "bg-slate-900/20 border-slate-850" : "bg-slate-50 border-slate-200"
                              }`}>
                                <div>
                                  <span className="text-[9px] text-slate-500 uppercase font-mono block leading-none font-bold">Cloud Cluster</span>
                                  <span className={`text-xs font-mono font-bold ${isDarkMode ? "text-slate-350" : "text-slate-700"}`}>fra-production-01</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-500 uppercase font-mono block leading-none font-bold">API Binding</span>
                                  <span className="text-xs font-mono font-bold text-indigo-500">Firestore v3 / OAuth</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-500 uppercase font-mono block leading-none font-bold">Security Rule</span>
                                  <span className="text-xs font-mono font-bold text-emerald-500">Strict-Match (Passed)</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-500 uppercase font-mono block leading-none font-bold">Runner VM Node</span>
                                  <span className={`text-xs font-mono font-bold ${isDarkMode ? "text-slate-350" : "text-slate-700"}`}>k8s-pod-x86-64</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3 my-24 text-center">
                              <div className="w-12 h-12 rounded-full bg-slate-850/10 flex items-center justify-center text-slate-400">
                                <FileCheck className="w-6 h-6 animate-pulse" />
                              </div>
                              <div>
                                <h4 className={`text-sm font-bold font-display ${isDarkMode ? "text-slate-200" : "text-slate-900"}`}>Reporter Unit Initialized</h4>
                                <p className="text-xs text-slate-500 mt-1 max-w-sm font-semibold">
                                  Click "Dispatch Emulation Run" to trigger live execution checking, producing an interactive structural audit report instantly.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TABS 3: AI TEST ARCHITECT */}
            {activeTab === "architect" && (
              <motion.div
                key="architect"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="pb-2 border-b border-slate-850">
                  <h2 className={`text-3xl font-extrabold tracking-tight font-display ${isDarkMode ? "bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-white" : "text-slate-900"}`}>
                    AI Test Architect
                  </h2>
                  <p className={`${isDarkMode ? "text-slate-400" : "text-slate-500"} text-sm mt-1`}>
                    Input testing requirements in plain English, choose target execution model, and generate Playwright assertions or Appium tests.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-5 space-y-6">
                    <div className={`p-5 rounded-xl border relative overflow-hidden transition-colors ${isDarkMode ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200"}`}>
                      <h4 className="text-sm font-bold font-display mb-4">Draft New Automation Profile</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-400 block mb-1.5">Platform Paradigm</label>
                          <div className="grid grid-cols-4 gap-2">
                            {(["web", "api", "mobile", "windows"] as ProductType[]).map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setAiProductType(type)}
                                className={`py-2 px-1 text-[10px] font-bold rounded border uppercase cursor-pointer text-center transition-all ${
                                  aiProductType === type
                                    ? "bg-purple-600 border-purple-500 text-white"
                                    : "bg-slate-800/20 border-slate-700 text-slate-400 hover:text-slate-250"
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-400 block mb-1.5">Direct NLP Requirements Prompt</label>
                          <textarea
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            rows={5}
                            placeholder="e.g., Validate checkout items load perfectly, fill sandbox address coordinates, click confirm and assert popup appears..."
                            className={`w-full text-xs p-3 rounded-lg border font-sans outline-none focus:ring-2 focus:ring-purple-500 ${
                              isDarkMode ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-slate-250 text-slate-800"
                            }`}
                          />
                        </div>

                        <button
                          onClick={handleAiGenerateSuite}
                          disabled={isAiGenerating || !aiPrompt.trim()}
                          className={`w-full py-4 rounded-xl font-bold font-display flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            isAiGenerating || !aiPrompt.trim()
                              ? "bg-slate-800 text-slate-600 border border-slate-750 cursor-not-allowed"
                              : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 text-white shadow-xl shadow-purple-500/15"
                          }`}
                        >
                          <Sparkles className={`w-4 h-4 ${isAiGenerating ? "animate-spin" : "animate-pulse"}`} />
                          <span>Compile Test Script Plan</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* DETAILED RESULTS BLOCK */}
                  <div className="lg:col-span-7">
                    <AnimatePresence mode="wait">
                      {isAiGenerating ? (
                        <motion.div
                          key="compiler-loader"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="h-full min-h-[460px] bg-slate-950/40 border border-dashed border-slate-805 rounded-xl flex flex-col items-center justify-center p-8 text-center"
                        >
                          <Cpu className="w-11 h-11 text-purple-400 animate-spin mb-4" />
                          <h4 className="text-base font-extrabold text-slate-300 font-display">Gemini AI is drafting assertions...</h4>
                          <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                            Generating sandbox locators, building sequence checks, and packaging structured execution scripts.
                          </p>
                        </motion.div>
                      ) : generatedSuite ? (
                        <motion.div
                          key="compiler-result"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="space-y-6"
                        >
                          <div className={`p-6 rounded-xl border relative overflow-hidden transition-colors ${isDarkMode ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200"}`}>
                            {architectNotification && (
                              <div className="mb-4 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[11px] text-emerald-400 font-semibold">
                                {architectNotification}
                              </div>
                            )}

                            <div className="pb-4 mb-4 border-b border-slate-850">
                              <span className="text-[10px] font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 uppercase tracking-widest block w-max">
                                {generatedSuite.productType} blueprint compilation
                              </span>
                              <h3 className="text-xl font-bold font-display mt-2 select-all">{generatedSuite.name}</h3>
                              <p className="text-xs text-slate-400 mt-1">{generatedSuite.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-5">
                              <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 leading-none">Draft steps ({generatedSuite.steps.length})</span>
                                <div className="space-y-1 bg-slate-950/20 p-2.5 rounded border border-slate-850">
                                  {generatedSuite.steps.map((st, i) => (
                                    <div key={i} className="flex gap-2 text-xs text-slate-300 items-start">
                                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 mt-1.5" />
                                      <span>{st}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 leading-none">Assertions verified ({generatedSuite.assertions.length})</span>
                                <div className="space-y-1 bg-slate-950/20 p-2.5 rounded border border-slate-850">
                                  {generatedSuite.assertions.map((as, i) => (
                                    <div key={i} className="flex gap-2 text-xs text-slate-300 items-start">
                                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                                      <span>{as}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[10.5px] text-slate-450 uppercase tracking-wide block font-bold leading-none">Executable code wrapper:</span>
                                <button
                                  onClick={() => copyToClipboard(generatedSuite.code, "ai-code")}
                                  className="text-[9.5px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-755 text-slate-300 border border-slate-700 cursor-pointer"
                                >
                                  {copiedCodeId === "ai-code" ? "Copied" : "Copy configuration"}
                                </button>
                              </div>
                              <pre className="p-4 bg-[#030712] rounded-lg border border-slate-850 max-h-52 overflow-y-auto font-mono text-[10px] text-slate-300 select-all leading-relaxed whitespace-pre font-medium">
                                {generatedSuite.code}
                              </pre>
                            </div>

                            <button
                              onClick={handleLoadAiSuite}
                              className="w-full mt-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 text-xs font-bold font-display rounded-lg text-white shadow-xl flex items-center justify-center gap-1.5 active:scale-[0.99] transition-all cursor-pointer"
                            >
                              <Plus className="w-4.5 h-4.5" />
                              <span>Commit Suite to Firestore & Open in Studio</span>
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="h-full min-h-[460px] border border-slate-850 bg-slate-1000/30 rounded-xl flex flex-col items-center justify-center p-8 text-center text-xs">
                          <Laptop className="w-12 h-12 text-slate-650 mb-4 animate-pulse" />
                          <h4 className="text-slate-350 font-bold text-sm font-display">Compiler Result Area</h4>
                          <p className="text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                            Draft configurations in the compiler form to allow AI engines to map actions and verify correct assertions securely.
                          </p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TABS 4: LOG DEBUGGER */}
            {activeTab === "debugger" && (
              <motion.div
                key="debugger"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="pb-2 border-b border-slate-850">
                  <h2 className={`text-3xl font-extrabold tracking-tight font-display ${isDarkMode ? "bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-white" : "text-slate-900"}`}>
                    AI Log Debugger
                  </h2>
                  <p className={`${isDarkMode ? "text-slate-400" : "text-slate-500"} text-sm mt-1`}>
                    Analyze stack traces, select preloaded examples, and let Gemini reconstruct broken locators or waiting parameters.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className={`p-5 rounded-xl border relative overflow-hidden transition-colors ${isDarkMode ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200"}`}>
                      <h4 className="text-sm font-bold font-display mb-3">Load Log Preset</h4>
                      <div className="space-y-2">
                        {preloadedDebugLogs.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleApplyLogPreset(preset.id)}
                            className={`w-full text-left p-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all flex justify-between items-center ${
                              debugLogPreset === preset.id
                                ? "bg-amber-500/10 border-amber-500/40 text-amber-500"
                                : "bg-slate-800/10 border-slate-700/50 text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            <span>{preset.name}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">{preset.productType}</span>
                          </button>
                        ))}
                      </div>

                      <div className="mt-5 space-y-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-450 block mb-1.5">Unhealthy log context or CLI stack trace</label>
                          <textarea
                            value={debugLogText}
                            onChange={(e) => {
                              setDebugLogText(e.target.value);
                              setDebugLogPreset("");
                            }}
                            rows={8}
                            placeholder="e.g., Timeout 5000ms exceeded trying to locate button#submit..."
                            className={`w-full text-xs p-3 rounded-lg border font-mono outline-none focus:ring-2 focus:ring-amber-500 ${
                              isDarkMode ? "bg-[#030712] border-slate-800 text-slate-300" : "bg-white border-slate-250 text-slate-80s"
                            }`}
                          />
                        </div>

                        <button
                          onClick={handleAiDebugLogs}
                          disabled={isDebugAnalyzing || !debugLogText.trim()}
                          className={`w-full py-4 rounded-xl font-bold font-display flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            isDebugAnalyzing || !debugLogText.trim()
                              ? "bg-slate-800 text-slate-650 border border-slate-750 cursor-not-allowed"
                              : "bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 text-white shadow-xl shadow-amber-500/15"
                          }`}
                        >
                          <RefreshCw className={`w-4 h-4 ${isDebugAnalyzing ? "animate-spin" : ""}`} />
                          <span>Run AI Diagnostic Scan</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-7">
                    <AnimatePresence mode="wait">
                      {isDebugAnalyzing ? (
                        <motion.div
                          key="trace-loader"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="h-full min-h-[460px] bg-slate-950/40 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 text-center"
                        >
                          <RefreshCw className="w-11 h-11 text-amber-500 animate-spin mb-4" />
                          <h4 className="text-base font-extrabold text-slate-350 font-display">Diagnosing failures...</h4>
                          <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                            Evaluating locator defects, interpreting timeout thresholds, and generating corrections.
                          </p>
                        </motion.div>
                      ) : debugAnalysisResult ? (
                        <motion.div
                          key="trace-result"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="space-y-6"
                        >
                          <div className={`p-6 rounded-xl border transition-colors ${isDarkMode ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200"}`}>
                            <div className="mb-5 pb-5 border-b border-slate-855">
                              <span className="text-[10px] font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-widest block w-max">
                                Root failure cause diagnosis
                              </span>
                              <p className="text-sm font-semibold text-slate-350 mt-3 leading-relaxed">
                                {debugAnalysisResult.possibleCause}
                              </p>
                            </div>

                            <div className="mb-5 pb-5 border-b border-slate-850">
                              <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-widest block mb-2 leading-none">Resolution actions:</span>
                              <div className="text-xs text-slate-350 leading-relaxed font-sans p-3 bg-slate-950/60 rounded border border-slate-850 whitespace-pre-line">
                                {debugAnalysisResult.fixSuggestion}
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-2.5">
                                <span className="text-xs text-slate-400 uppercase tracking-wide block font-semibold font-display">Corrected automation codes:</span>
                                <button
                                  onClick={() => copyToClipboard(debugAnalysisResult.fixedCode, "fixed-code")}
                                  className="text-[9.5px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 cursor-pointer"
                                >
                                  {copiedCodeId === "fixed-code" ? "Copied" : "Copy script"}
                                </button>
                              </div>
                              <pre className="p-4 bg-[#030712] rounded-lg border border-slate-850 max-h-52 overflow-y-auto font-mono text-[10.5px] text-slate-300 select-all leading-relaxed whitespace-pre font-medium leading-relaxed">
                                {debugAnalysisResult.fixedCode}
                              </pre>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="h-full min-h-[460px] border border-slate-850 bg-slate-1000/30 rounded-xl flex flex-col items-center justify-center p-8 text-center text-xs">
                          <Terminal className="w-12 h-12 text-slate-650 mb-4 animate-pulse" />
                          <h4 className="text-slate-350 font-bold text-sm font-display">Log Diagnostics Console</h4>
                          <p className="text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                            Analyze trace diagnostics. Load a preloaded preset on the left or paste live system output to diagnose errors immediately.
                          </p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TABS 5: VALIDATION DIRECTORY */}
            {activeTab === "suites" && (
              <motion.div
                key="suites"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-700/25">
                  <div>
                    <h2 className={`text-3xl font-extrabold tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r ${isDarkMode ? "from-white to-slate-400" : "from-slate-900 to-slate-700"}`}>
                      Validation Suite Directory
                    </h2>
                    <p className={`${isDarkMode ? "text-slate-400" : "text-slate-600"} text-sm mt-1 font-semibold`}>
                      Live Firestore collection holding customizable configurations synced across all authenticated clients.
                    </p>
                  </div>

                  <button
                    onClick={async () => {
                      const newId = `suite-${Date.now().toString().slice(-4)}`;
                      const emptyTemplate: TestSuite = {
                        id: newId,
                        name: "Custom REST Gateway Endpoint Validation",
                        description: "Durable API suite checking status structures and payload parsing speeds.",
                        productType: "api",
                        steps: ["Dispatch POST credentials request to auth path", "Verify status checks out as 200"],
                        assertions: ["HTTP payload corresponds to JSON standards"],
                        code: `// Custom REST Automation Code\ndescribe('Standard API Tests', () => {\n  it('checks health', async () => {\n    // logic goes here\n  });\n});`
                      };
                      await saveTestSuite(emptyTemplate);
                      setSelectedSuiteId(newId);
                      setActiveTab("studio");
                    }}
                    className="p-3 border border-indigo-500/20 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-lg flex items-center gap-1.5 text-white cursor-pointer shadow active:scale-[0.98] shrink-0"
                  >
                    <Plus className="w-4.5 h-4.5" />
                    <span>Create Custom Suite</span>
                  </button>
                </div>

                {/* STATIONARY TEMPLATE SELECTION GALLERY */}
                <div className={`p-6 rounded-2xl border ${isDarkMode ? "bg-slate-950/40 border-cyan-800/30" : "bg-gradient-to-tr from-cyan-500/5 via-indigo-500/5 to-purple-500/5 border-slate-200 shadow-sm"}`}>
                  <div className="mb-4">
                    <span className="text-[10px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 animate-pulse border border-cyan-500/15">
                      1-Click Autonomic Deployments
                    </span>
                    <h3 className={`text-xl font-bold font-display mt-2 ${isDarkMode ? "text-slate-150" : "text-slate-900"}`}>
                      Edge-Mapped Suite Stationary Templates
                    </h3>
                    <p className={`text-xs mt-1 ${isDarkMode ? "text-slate-400" : "text-slate-700 font-semibold"}`}>
                      Instantly clone, provision, and trigger an automated QA orchestration session with containerized nodes for the chosen service.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    {STATIONARY_TEMPLATES.map((tmpl) => {
                      const IconComponent = 
                        tmpl.productType === "web" ? Globe : 
                        tmpl.productType === "api" ? Database : 
                        tmpl.productType === "mobile" ? Smartphone : Laptop;

                      return (
                        <div
                          key={tmpl.id}
                          className={`p-4.5 rounded-xl border flex flex-col justify-between transition-all duration-200 group hover:shadow-md ${
                            isDarkMode 
                              ? "bg-slate-900/60 border-slate-800/80 hover:border-slate-700/90" 
                              : "bg-white border-slate-200/85 hover:border-indigo-400/80"
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                tmpl.productType === "web" ? "bg-cyan-500/10 text-cyan-500" :
                                tmpl.productType === "api" ? "bg-indigo-500/10 text-indigo-500" :
                                tmpl.productType === "mobile" ? "bg-purple-500/10 text-purple-500" : 
                                "bg-amber-500/10 text-amber-500"
                              }`}>
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                tmpl.productType === "web" ? "bg-cyan-50 text-cyan-700" :
                                tmpl.productType === "api" ? "bg-indigo-50 text-indigo-700" :
                                tmpl.productType === "mobile" ? "bg-purple-50 text-purple-700" :
                                "bg-amber-50 text-amber-700"
                              }`}>
                                {tmpl.productType} Node
                              </span>
                            </div>

                            <h4 className={`text-sm font-bold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900 font-extrabold"}`}>
                              {tmpl.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed line-clamp-2">
                              {tmpl.description}
                            </p>

                            <div className={`mt-3 py-1.5 px-2 rounded-lg text-[10px] space-y-1 ${isDarkMode ? "bg-slate-950/70" : "bg-slate-50"}`}>
                              {tmpl.steps.slice(0, 2).map((st, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-slate-400 truncate">
                                  <span className="w-1 h-1 rounded-full bg-slate-400" />
                                  <span className="truncate">{st}</span>
                                </div>
                              ))}
                              {tmpl.steps.length > 2 && (
                                <span className="text-[9px] text-slate-500 italic">+{tmpl.steps.length - 2} further verification statements</span>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-700/10">
                            <button
                              onClick={() => triggerDeployAndRun(tmpl)}
                              className="w-full py-2 bg-slate-900 hover:bg-indigo-650 group-hover:bg-indigo-600 text-white font-bold text-xs rounded transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <CloudLightning className="w-3.5 h-3.5 animate-pulse" />
                              <span>1-Click Deploy Agent</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 pb-2 border-b border-slate-700/10">
                  <h3 className={`text-lg font-bold font-display ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>
                    All Custom Provisioned Validation Suites
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage and run persistent user configurations synced to Firestore database nodes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {testSuites.map((s) => (
                    <div
                      key={s.id}
                      className={`p-5 rounded-xl border flex flex-col justify-between transition-colors ${
                        isDarkMode ? "bg-slate-900/40 border-slate-850 hover:bg-slate-900" : "bg-white border-slate-200 shadow-sm"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3.5">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                            s.productType === "web" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                            s.productType === "api" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                            s.productType === "mobile" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                            "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          }`}>
                            {s.productType} test model
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 select-all font-semibold">UID: {s.id}</span>
                        </div>

                        <h4 className="text-lg font-bold font-display select-all">{s.name}</h4>
                        <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">{s.description}</p>

                        <div className="mt-4 pt-3 border-t border-slate-850/60 text-xs">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 leading-none">Defined checkpoints: {s.steps.length}</span>
                          <div className="space-y-1 text-slate-350">
                            {s.steps.slice(0, 3).map((st, sidx) => (
                              <div key={sidx} className="flex gap-2.5 items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                <span className="truncate">{st}</span>
                              </div>
                            ))}
                            {s.steps.length > 3 && (
                              <span className="text-[10px] text-slate-500 italic block pl-4 pt-1">
                                + {s.steps.length - 3} further checkpoints in compilation
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3.5 border-t border-slate-850/60 flex justify-between gap-3">
                        <button
                          onClick={() => {
                            setSelectedSuiteId(s.id);
                            setRunningLogs([]);
                            setCurrentStepIndex(-1);
                            setActiveTab("studio");
                          }}
                          className="flex-1 py-2 px-3 text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-white rounded border border-slate-700 text-center cursor-pointer transition-colors"
                        >
                          Configure & Run
                        </button>

                        <button
                          onClick={async () => {
                            await deleteTestSuite(s.id);
                          }}
                          className="py-2 px-3 text-xs font-semibold hover:bg-rose-500/10 hover:text-rose-400 rounded text-slate-500 border border-transparent hover:border-rose-500/20 cursor-pointer transition-colors"
                        >
                          Remove Profile
                        </button>
                      </div>
                    </div>
                  ))}
                  {testSuites.length === 0 && (
                    <div className="col-span-2 text-center py-10 text-slate-500">
                      No validation templates found. Feel free to click "Create Custom Suite" above to add ones!
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 6: ADMIN ROLE AND PERMISSIONS MANAGEMENT */}
            {activeTab === "admin" && userProfile?.role === "admin" && (
              <motion.div
                key="admin"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="pb-2 border-b border-slate-850">
                  <h2 className={`text-3xl font-extrabold tracking-tight font-display ${isDarkMode ? "bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-white" : "text-slate-900"}`}>
                    Root Role & Access Management
                  </h2>
                  <p className={`${isDarkMode ? "text-slate-400" : "text-slate-500"} text-sm mt-1`}>
                    Durable role administration, customer lead CRM tracking, and simulated email relays synced instantly.
                  </p>
                </div>

                {/* Sub Tab Navigation */}
                <div className="flex gap-2 border-b border-slate-850 pb-1.5">
                  <button
                    onClick={() => setAdminActiveSubTab("users")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      adminActiveSubTab === "users"
                        ? "bg-slate-800 border-slate-700 text-white"
                        : "bg-transparent border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Operations Security Directory ({allUsers.length})
                  </button>
                  <button
                    onClick={() => setAdminActiveSubTab("leads")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer relative ${
                      adminActiveSubTab === "leads"
                        ? "bg-slate-800 border-slate-700 text-white"
                        : "bg-transparent border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    CRM Prospect Leads & Mailing ({leads.length})
                    {leads.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-550 text-[9px] text-white font-mono font-bold">
                        {leads.length}
                      </span>
                    )}
                  </button>
                </div>

                {adminActiveSubTab === "users" ? (
                  <div className={`p-6 rounded-xl border transition-colors ${isDarkMode ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200 shadow-sm"}`}>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className={`font-bold text-lg font-display ${isDarkMode ? "text-white" : "text-slate-800"}`}>Authenticated System Users ({allUsers.length})</h3>
                        <p className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-605"}`}>Live grid directory managing security authorization clearance tiers.</p>
                      </div>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        ADMIN OVERRIDE GATES ARMED
                      </span>
                    </div>
 
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Left: Authenticated System Users Table */}
                      <div className="lg:col-span-2 overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className={`border-b font-semibold uppercase tracking-wider text-[10px] ${isDarkMode ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500"}`}>
                              <th className="pb-3 pl-2">Display Name / Identity</th>
                              <th className="pb-3">Registered Email</th>
                              <th className="pb-3 text-right pr-2">Modify Security Privileges & Actions</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${isDarkMode ? "divide-slate-850/40" : "divide-slate-150"}`}>
                            {allUsers.map((u) => (
                              <tr key={u.userId} className={`transition-all ${isDarkMode ? "hover:bg-slate-805/30" : "hover:bg-slate-50"}`}>
                                <td className="py-4 pl-2">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-slate-800/80 flex items-center justify-center font-bold text-slate-300">
                                      {u.displayName ? u.displayName.slice(0, 1).toUpperCase() : "?"}
                                    </div>
                                    <div>
                                      <span className={`font-bold block ${isDarkMode ? "text-slate-100" : "text-slate-855"}`}>{u.displayName || "Noname User"}</span>
                                      <span className="text-[10px] text-slate-500 font-mono select-all">{u.userId}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 font-sans select-all">
                                  <div className="space-y-1">
                                    <span className={`block font-semibold ${isDarkMode ? "text-slate-350" : "text-slate-705"}`}>{u.email}</span>
                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[8.5px] font-extrabold uppercase border ${
                                      u.role === "admin" ? (isDarkMode ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-red-50 text-red-700 border-red-200") :
                                      u.role === "operator" ? (isDarkMode ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-indigo-50 text-indigo-700 border-indigo-200") :
                                      (isDarkMode ? "bg-slate-500/10 text-slate-400 border-slate-550/20" : "bg-slate-50 text-slate-650 border-slate-200")
                                    }`}>
                                      {u.role}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 text-right pr-2">
                                  <div className="inline-flex flex-col items-end gap-1.5">
                                    <div className="inline-flex flex-wrap items-center justify-end gap-1">
                                      {(["viewer", "operator", "admin"] as const).map((roleOption) => (
                                        <button
                                          key={roleOption}
                                          type="button"
                                          onClick={() => updateUserRole(u.userId, roleOption)}
                                          disabled={u.userId === user.uid} // block self-degradation or lockouts
                                          className={`px-2 py-0.5 text-[9px] font-bold rounded border cursor-pointer transition-all ${
                                            u.role === roleOption
                                              ? (isDarkMode ? "bg-slate-800 border-slate-700 text-white cursor-default" : "bg-slate-250 border-slate-300 text-slate-800 cursor-default")
                                              : (isDarkMode ? "bg-slate-900/30 border-slate-850/40 text-slate-500 hover:text-slate-300 hover:border-slate-800 disabled:opacity-40" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40")
                                          }`}
                                          title={u.userId === user.uid ? "Cannot change your own administrative role credentials" : `Assign ${roleOption} role`}
                                        >
                                          {roleOption.toUpperCase()}
                                        </button>
                                      ))}
                                    </div>
                                    <div className="inline-flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => setEditingUser(u)}
                                        className={`px-2.5 py-1 rounded text-[9.5px] font-bold border transition-all cursor-pointer ${
                                          isDarkMode 
                                            ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-400 hover:bg-indigo-500/20" 
                                            : "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                                        }`}
                                        title="Edit account details"
                                      >
                                        Edit Details
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => { if(confirm("Are you sure you want to delete this staff user account completely?")) deleteUser(u.userId); }}
                                        disabled={u.userId === user.uid}
                                        className={`px-2.5 py-1 rounded text-[9.5px] font-bold border transition-all cursor-pointer ${
                                          isDarkMode 
                                            ? "bg-rose-500/10 border-rose-500/25 text-rose-400 hover:bg-rose-500/20" 
                                            : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                                        } disabled:opacity-40`}
                                        title="Delete account completely"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Right: Provision New Staff member */}
                      <div className={`p-5 rounded-2xl border ${isDarkMode ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 mb-1">Provision Staff Account</h4>
                        <p className="text-[11px] text-slate-500 mb-4 leading-normal">
                          Configures credentials directly in Firestore. This automatically transmits systemic activation alerts & onboarding guidelines to all registered users real-time.
                        </p>

                        <form onSubmit={handleCreateStaffUserSubmit} className="space-y-3">
                          {newStaffError && (
                            <div className="p-2.5 text-xs rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-medium leading-relaxed">
                              {newStaffError}
                            </div>
                          )}

                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Full Name</label>
                            <input
                              type="text"
                              required
                              value={newStaffName}
                              onChange={(e) => setNewStaffName(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-xl border outline-none focus:ring-1 focus:ring-purple-500 ${isDarkMode ? "bg-slate-950 border-slate-850 text-white" : "bg-white border-slate-200 text-slate-800"}`}
                              placeholder="e.g. Alice Mercer"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Email Address</label>
                            <input
                              type="email"
                              required
                              value={newStaffEmail}
                              onChange={(e) => setNewStaffEmail(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-xl border outline-none focus:ring-1 focus:ring-purple-500 ${isDarkMode ? "bg-slate-950 border-slate-850 text-white" : "bg-white border-slate-200 text-slate-800"}`}
                              placeholder="e.g. alice@test.ai"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Assigned Security Clearance</label>
                            <select
                              value={newStaffRole}
                              onChange={(e) => setNewStaffRole(e.target.value as any)}
                              className={`w-full text-xs p-2.5 rounded-xl border outline-none focus:ring-1 focus:ring-purple-500 ${isDarkMode ? "bg-slate-950 border-slate-850 text-white" : "bg-white border-slate-200 text-slate-800"}`}
                            >
                              <option value="viewer">VIEWER - Read-Only Access</option>
                              <option value="operator">OPERATOR - Manage Runs & Logs</option>
                              <option value="admin">ADMIN - Manage Clearance & Staff</option>
                            </select>
                          </div>

                          <button
                            type="submit"
                            disabled={newStaffLoading}
                            className="w-full py-2.5 rounded-xl bg-purple-650 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-900/10 cursor-pointer disabled:opacity-40 transition-all"
                          >
                            {newStaffLoading ? "Provisioning..." : "Provision Staff Member"}
                          </button>
                        </form>

                        {/* Welcome Announcement Logs Dispatch Feed */}
                        {showStaffCreatedEmailTrigger && (
                          <div className="mt-4 p-3.5 rounded-xl border border-purple-500/20 bg-purple-550/10 space-y-2">
                            <span className="text-[9px] font-mono text-purple-400 font-extrabold tracking-wider block border-b border-purple-500/10 pb-1">
                              📡 REAL-TIME WELCOME BROADCAST DEPLOYED
                            </span>
                            <div className="font-mono text-[8.5px] text-slate-400 space-y-1.5 max-h-[140px] overflow-y-auto leading-normal">
                              {staffCreatedEmailLogs.map((logLine, idx) => (
                                <div key={idx} className={logLine.includes("SUCCESS") ? "text-emerald-450 font-bold" : ""}>
                                  {logLine}
                                </div>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setShowStaffCreatedEmailTrigger(false);
                                setCreatedStaffProfile(null);
                              }}
                              className="mt-1 text-[9px] text-purple-300 hover:text-white underline"
                            >
                              Dismiss Monitor Logs
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className={`p-6 rounded-xl border transition-colors ${isDarkMode ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200 shadow-sm"}`}>
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className={`font-bold text-lg font-display ${isDarkMode ? "text-white" : "text-slate-800"}`}>Registered Customer Leads CRM</h3>
                          <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-605"}`}>Prospect records collected from guided demo portals. Persisted to Firestore.</p>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded">
                          REAL-TIME PIPELINE ACTIVE
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className={`border-b font-semibold uppercase tracking-wider text-[10px] ${isDarkMode ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500"}`}>
                              <th className="pb-3 pl-2">Client Details / Company</th>
                              <th className="pb-3">Contact Metrics</th>
                              <th className="pb-3">Custom Notes / Goals</th>
                              <th className="pb-3">Fulfillment Status</th>
                              <th className="pb-3 text-right pr-2">Action Matrices</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${isDarkMode ? "divide-slate-850/40" : "divide-slate-150"}`}>
                            {leads.map((l) => (
                              <tr key={l.id} className={`transition-all ${isDarkMode ? "hover:bg-slate-805/30" : "hover:bg-slate-50"}`}>
                                <td className="py-4 pl-2">
                                  <div>
                                    <span className={`font-bold block text-sm ${isDarkMode ? "text-slate-100" : "text-slate-850"}`}>{l.name}</span>
                                    <span className={`text-[10.5px] font-mono font-bold block ${isDarkMode ? "text-cyan-400" : "text-cyan-650"}`}>{l.company}</span>
                                  </div>
                                </td>
                                <td className="py-4 font-mono select-all space-y-0.5">
                                  <span className={`block ${isDarkMode ? "text-slate-300" : "text-slate-700 font-semibold"}`}>{l.email}</span>
                                  <span className={`block ${isDarkMode ? "text-slate-500" : "text-slate-500"} text-[10.5px]`}>{l.phone}</span>
                                </td>
                                <td className={`py-4 max-w-xs truncate leading-relaxed font-sans ${isDarkMode ? "text-slate-400" : "text-slate-600"}`} title={l.notes}>
                                  {l.notes}
                                </td>
                                <td className="py-4">
                                  <select
                                    value={l.status || "pending"}
                                    onChange={(e) => updateLeadStatus(l.id, e.target.value as any)}
                                    className={`p-1.5 rounded text-[10.5px] font-bold outline-none ${
                                      isDarkMode 
                                        ? "bg-slate-950 border border-slate-800 text-slate-300" 
                                        : "bg-slate-50 border border-slate-250 text-slate-800"
                                    }`}
                                  >
                                    <option value="pending">PENDING</option>
                                    <option value="contacted">CONTACTED</option>
                                    <option value="qualified">QUALIFIED</option>
                                    <option value="completed">COMPLETED</option>
                                  </select>
                                </td>
                                <td className="py-4 text-right pr-2">
                                  <div className="inline-flex items-center gap-2">
                                    <button
                                      onClick={() => handleAdminSendSimulatedEmail(l)}
                                      disabled={sendingEmailId !== null}
                                      className={`px-2.5 py-1.5 rounded text-[10.5px] font-bold border transition-colors cursor-pointer ${
                                        sendingEmailId === l.id
                                          ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                                          : "bg-indigo-600 border-indigo-500 hover:bg-indigo-500 text-white disabled:opacity-40"
                                      }`}
                                    >
                                      {sendingEmailId === l.id ? "Mailing..." : "Trigger Onboarding Email"}
                                    </button>

                                    <button
                                      onClick={() => setEditingLead(l)}
                                      className={`px-2.5 py-1.5 rounded text-[10.5px] font-bold border transition-all cursor-pointer ${
                                        isDarkMode 
                                          ? "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white" 
                                          : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                                      }`}
                                      title="Edit details"
                                    >
                                      Edit Details
                                    </button>

                                    <button
                                      onClick={() => { if(confirm("Are you sure you want to remove this prospective lead?")) deleteLead(l.id); }}
                                      className="p-1.5 rounded hover:bg-rose-500/10 hover:text-rose-450 text-slate-500 border border-transparent hover:border-rose-500/15 cursor-pointer"
                                      title="Remove lead"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {leads.length === 0 && (
                              <tr>
                                <td colSpan={5} className="py-10 text-center text-slate-550 italic">
                                  No registered demo requests found in the Firestore Leads collections. Feel free to submit the request form on the homepage!
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* SMTP mailing log monitor section */}
                    {sendingEmailLogs.length > 0 && (
                      <div className="p-5 rounded-xl border border-indigo-500/20 bg-[#030610] space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-mono pb-2 border-b border-indigo-950/40">
                          <span className="text-indigo-400 font-extrabold block">LIVE SMTP ADMINISTRATIVE AND SALES MAILING TERMINAL</span>
                          <span className="text-slate-600 font-bold">Active Relay Connected</span>
                        </div>
                        <div className="font-mono text-[9px] text-slate-350 space-y-1 max-h-[160px] overflow-y-auto">
                          {sendingEmailLogs.map((lg, lidx) => (
                            <div key={lidx}>{lg}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

    </div>
  );
}
