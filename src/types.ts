export type ProductType = "api" | "mobile" | "windows" | "web";

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  productType: ProductType;
  steps: string[];
  assertions: string[];
  code: string;
}

export interface TestRun {
  id: string;
  suiteId: string;
  suiteName: string;
  productType: ProductType;
  startedAt?: any;
  timestamp?: string;
  status: "running" | "passed" | "failed" | "pending";
  progress: number;
  durationMs: number;
  logs: string[];
  executorId: string;
  executorName: string;
}

export interface RunnerCluster {
  id: string;
  name: string;
  region: string;
  status: "idle" | "running" | "offline";
  loadPercentage: number;
  activeType: ProductType | "none";
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  notes: string;
  status: "new" | "contacted" | "demoed" | "onboarded";
  createdAt?: any;
}
