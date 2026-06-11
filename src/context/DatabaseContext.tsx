/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  serverTimestamp,
  limit
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { TestSuite, TestRun, Lead } from "../types";
import { useAuth, UserProfile } from "./AuthContext";
import { initialTestSuites } from "../mockData";

interface DatabaseContextType {
  testSuites: TestSuite[];
  recentRuns: TestRun[];
  allUsers: UserProfile[];
  leads: Lead[];
  loadingSuites: boolean;
  loadingRuns: boolean;
  loadingLeads: boolean;
  saveTestSuite: (suite: Omit<TestSuite, "ownerId" | "createdAt">) => Promise<void>;
  deleteTestSuite: (id: string) => Promise<void>;
  createTestRun: (run: Omit<TestRun, "executorId" | "executorName" | "startedAt">) => Promise<void>;
  updateTestRun: (id: string, updates: Partial<Pick<TestRun, "status" | "progress" | "durationMs" | "logs">>) => Promise<void>;
  updateUserRole: (targetUserId: string, targetRole: "admin" | "operator" | "viewer") => Promise<void>;
  updateUser: (id: string, name: string, email: string, role: "admin" | "operator" | "viewer") => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  createStaffUser: (displayName: string, email: string, role: "admin" | "operator" | "viewer") => Promise<any>;
  registerLead: (lead: Omit<Lead, "status" | "createdAt">) => Promise<void>;
  updateLeadStatus: (id: string, status: Lead["status"]) => Promise<void>;
  updateLead: (id: string, updates: Partial<Omit<Lead, "id" | "createdAt">>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile } = useAuth();
  
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [recentRuns, setRecentRuns] = useState<TestRun[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  
  const [loadingSuites, setLoadingSuites] = useState(true);
  const [loadingRuns, setLoadingRuns] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(true);

  // 1. Sync Test Suites & Populate Defaults if Empty
  useEffect(() => {
    if (!user) {
      setTestSuites([]);
      setLoadingSuites(false);
      return;
    }

    if (user.uid.startsWith("simulated-")) {
      const saved = localStorage.getItem("sim_test_suites");
      if (saved) {
        setTestSuites(JSON.parse(saved));
      } else {
        localStorage.setItem("sim_test_suites", JSON.stringify(initialTestSuites));
        setTestSuites(initialTestSuites);
      }
      setLoadingSuites(false);
      return;
    }

    const q = query(collection(db, "testSuites"));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        // If Firestore directory is default-empty, seed standard templates
        console.log("Database suites directory empty. Seeding templates...");
        for (const suite of initialTestSuites) {
          try {
            await setDoc(doc(db, "testSuites", suite.id), {
              ...suite,
              ownerId: user.uid,
              createdAt: serverTimestamp()
            });
          } catch (err) {
            console.error("Failed seeding template:", suite.id, err);
          }
        }
      } else {
        const suitesList: TestSuite[] = [];
        snapshot.forEach((docSnap) => {
          suitesList.push(docSnap.data() as TestSuite);
        });
        setTestSuites(suitesList);
        setLoadingSuites(false);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "testSuites");
      setLoadingSuites(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Sync Recent Runs (last 30) list
  useEffect(() => {
    if (!user) {
      setRecentRuns([]);
      setLoadingRuns(false);
      return;
    }

    if (user.uid.startsWith("simulated-")) {
      const saved = localStorage.getItem("sim_test_runs");
      if (saved) {
        setRecentRuns(JSON.parse(saved));
      } else {
        setRecentRuns([]);
      }
      setLoadingRuns(false);
      return;
    }

    const q = query(
      collection(db, "testRuns"),
      orderBy("startedAt", "desc"),
      limit(30)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const runsList: any[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        // Convert timestamp server format back to readable trace
        let readableTime = "Trace just started";
        if (data.startedAt) {
          try {
            // Check if Firebase server timestamp has resolved
            const date = data.startedAt.toDate ? data.startedAt.toDate() : new Date(data.startedAt);
            readableTime = date.toISOString().replace("T", " ").slice(0, 16);
          } catch {
            readableTime = "Trace pending";
          }
        }
        runsList.push({
          ...data,
          timestamp: readableTime
        });
      });
      setRecentRuns(runsList);
      setLoadingRuns(false);
    }, (err) => {
      // In first loads, if no runs or composite index needed, query won't throw unless strictly failing schema
      handleFirestoreError(err, OperationType.LIST, "testRuns");
      setLoadingRuns(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 3. Sync User profiles list (Admin capability only)
  useEffect(() => {
    if (!user || userProfile?.role !== "admin") {
      setAllUsers([]);
      return;
    }

    if (user.uid.startsWith("simulated-")) {
      const saved = localStorage.getItem("sim_users");
      if (saved) {
        setAllUsers(JSON.parse(saved));
      } else {
        const defaultUsers = [
          userProfile,
          {
            userId: "simulated-user-operator",
            email: "operator@example.com",
            displayName: "Operator Assistant",
            role: "operator",
            isDarkMode: false,
            createdAt: new Date().toISOString()
          },
          {
            userId: "simulated-user-viewer",
            email: "viewer@example.com",
            displayName: "Guest Viewer",
            role: "viewer",
            isDarkMode: false,
            createdAt: new Date().toISOString()
          }
        ];
        localStorage.setItem("sim_users", JSON.stringify(defaultUsers));
        setAllUsers(defaultUsers);
      }
      return;
    }

    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        usersList.push(docSnap.data() as UserProfile);
      });
      setAllUsers(usersList);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "users");
    });

    return () => unsubscribe();
  }, [user, userProfile]);

  // 4. Save customizable test suite
  const saveTestSuite = async (suite: Omit<TestSuite, "ownerId" | "createdAt">) => {
    if (!user) return;
    if (user.uid.startsWith("simulated-")) {
      const saved = localStorage.getItem("sim_test_suites");
      const suites = saved ? JSON.parse(saved) : [...initialTestSuites];
      const index = suites.findIndex((s: any) => s.id === suite.id);
      const newSuite = {
        ...suite,
        ownerId: user.uid,
        createdAt: new Date().toISOString()
      };
      if (index >= 0) {
        suites[index] = newSuite;
      } else {
        suites.push(newSuite);
      }
      localStorage.setItem("sim_test_suites", JSON.stringify(suites));
      setTestSuites(suites);
      return;
    }

    const suiteRef = doc(db, "testSuites", suite.id);
    try {
      await setDoc(suiteRef, {
        ...suite,
        ownerId: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `testSuites/${suite.id}`);
    }
  };

  // 5. Delete test suite
  const deleteTestSuite = async (id: string) => {
    if (!user) return;
    if (user.uid.startsWith("simulated-")) {
      const saved = localStorage.getItem("sim_test_suites");
      const suites = saved ? JSON.parse(saved) : [...initialTestSuites];
      const filtered = suites.filter((s: any) => s.id !== id);
      localStorage.setItem("sim_test_suites", JSON.stringify(filtered));
      setTestSuites(filtered);
      return;
    }

    const suiteRef = doc(db, "testSuites", id);
    try {
      await deleteDoc(suiteRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `testSuites/${id}`);
    }
  };

  // 6. Register a new automated execution run
  const createTestRun = async (run: Omit<TestRun, "executorId" | "executorName" | "startedAt">) => {
    if (!user) return;
    if (user.uid.startsWith("simulated-")) {
      const saved = localStorage.getItem("sim_test_runs");
      const runs = saved ? JSON.parse(saved) : [];
      const newRun = {
        ...run,
        executorId: user.uid,
        executorName: userProfile?.displayName || user.displayName || "QA Robot",
        startedAt: new Date().toISOString(),
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 16)
      };
      runs.unshift(newRun);
      localStorage.setItem("sim_test_runs", JSON.stringify(runs));
      setRecentRuns(runs);
      return;
    }

    const runRef = doc(db, "testRuns", run.id);
    try {
      await setDoc(runRef, {
        ...run,
        executorId: user.uid,
        executorName: userProfile?.displayName || user.displayName || "QA Robot",
        startedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `testRuns/${run.id}`);
    }
  };

  // 7. Update running test state, streaming logs/progress
  const updateTestRun = async (id: string, updates: Partial<Pick<TestRun, "status" | "progress" | "durationMs" | "logs">>) => {
    if (!user) return;
    if (user.uid.startsWith("simulated-")) {
      const saved = localStorage.getItem("sim_test_runs");
      const runs = saved ? JSON.parse(saved) : [];
      const index = runs.findIndex((r: any) => r.id === id);
      if (index >= 0) {
        runs[index] = { ...runs[index], ...updates };
        localStorage.setItem("sim_test_runs", JSON.stringify(runs));
        setRecentRuns(runs);
      }
      return;
    }

    const runRef = doc(db, "testRuns", id);
    try {
      await updateDoc(runRef, updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `testRuns/${id}`);
    }
  };

  // 8. Administrative role-management adjustment
  const updateUserRole = async (targetUserId: string, targetRole: "admin" | "operator" | "viewer") => {
    if (!user || userProfile?.role !== "admin") return;
    if (user.uid.startsWith("simulated-")) {
      const saved = localStorage.getItem("sim_users");
      const users = saved ? JSON.parse(saved) : [];
      const index = users.findIndex((u: any) => u.userId === targetUserId);
      if (index >= 0) {
        users[index].role = targetRole;
        localStorage.setItem("sim_users", JSON.stringify(users));
        setAllUsers(users);
      }
      return;
    }

    const userRef = doc(db, "users", targetUserId);
    try {
      await updateDoc(userRef, {
        role: targetRole
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${targetUserId}`);
    }
  };

  const updateUser = async (id: string, name: string, email: string, role: "admin" | "operator" | "viewer") => {
    if (!user || userProfile?.role !== "admin") return;
    if (user.uid.startsWith("simulated-")) {
      const saved = localStorage.getItem("sim_users");
      const users = saved ? JSON.parse(saved) : [];
      const index = users.findIndex((u: any) => u.userId === id);
      if (index >= 0) {
        users[index] = { ...users[index], displayName: name, email, role };
        localStorage.setItem("sim_users", JSON.stringify(users));
        setAllUsers(users);
      }
      return;
    }

    const userRef = doc(db, "users", id);
    try {
      await updateDoc(userRef, {
        displayName: name,
        email,
        role
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${id}`);
    }
  };

  const deleteUser = async (id: string) => {
    if (!user || userProfile?.role !== "admin") return;
    if (user.uid.startsWith("simulated-")) {
      const saved = localStorage.getItem("sim_users");
      const users = saved ? JSON.parse(saved) : [];
      const filtered = users.filter((u: any) => u.userId !== id);
      localStorage.setItem("sim_users", JSON.stringify(filtered));
      setAllUsers(filtered);
      return;
    }

    const userRef = doc(db, "users", id);
    try {
      await deleteDoc(userRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${id}`);
    }
  };

  const createStaffUser = async (displayName: string, email: string, role: "admin" | "operator" | "viewer") => {
    if (!user || userProfile?.role !== "admin") return null;
    const staffUid = `staff-${Date.now().toString().slice(-6)}`;
    const newProfile = {
      userId: staffUid,
      email: email,
      displayName: displayName,
      role: role,
      isDarkMode: true,
      createdAt: new Date().toISOString()
    };

    if (user.uid.startsWith("simulated-")) {
      const saved = localStorage.getItem("sim_users");
      const users = saved ? JSON.parse(saved) : [];
      users.push(newProfile);
      localStorage.setItem("sim_users", JSON.stringify(users));
      setAllUsers(users);
      return newProfile;
    }

    const userRef = doc(db, "users", staffUid);
    try {
      await setDoc(userRef, newProfile);
      return newProfile;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${staffUid}`);
    }
  };

  // 9. Sync Leads (Admin only)
  useEffect(() => {
    if (!user || userProfile?.role !== "admin") {
      setLeads([]);
      setLoadingLeads(false);
      return;
    }

    if (user.uid.startsWith("simulated-")) {
      const saved = localStorage.getItem("sim_leads");
      if (saved) {
        setLeads(JSON.parse(saved));
      } else {
        const defaultLeads = [
          {
            id: "lead-sim-1",
            name: "Enterprise Bank QA",
            email: "finance-leads@enterprisebank.com",
            company: "Enterprise Bank Inc.",
            phone: "+1 (555) 0192",
            notes: "Interested in contract assurance engine for ISO8583 message checks.",
            status: "new",
            createdAt: new Date(Date.now() - 36000000).toISOString().replace("T", " ").slice(0, 16)
          }
        ];
        localStorage.setItem("sim_leads", JSON.stringify(defaultLeads));
        setLeads(defaultLeads as any);
      }
      setLoadingLeads(false);
      return;
    }

    const q = collection(db, "leads");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsList: Lead[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let readableTime = "Pending";
        let sortVal = 0;
        if (data.createdAt) {
          try {
            const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
            readableTime = date.toISOString().replace("T", " ").slice(0, 16);
            sortVal = date.getTime();
          } catch {
            readableTime = "Pending";
          }
        }
        leadsList.push({
          ...data,
          createdAt: readableTime,
          _sortVal: sortVal // helpful for client-side sorting
        } as any);
      });
      // Sort client-side by time descending
      leadsList.sort((a: any, b: any) => b._sortVal - a._sortVal);
      setLeads(leadsList);
      setLoadingLeads(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "leads");
      setLoadingLeads(false);
    });

    return () => unsubscribe();
  }, [user, userProfile]);

  // 10. Register a brand new prospective Lead (can be requested by unauthenticated guests during checkout!)
  const registerLead = async (lead: Omit<Lead, "status" | "createdAt">) => {
    if (user && user.uid.startsWith("simulated-")) {
      const saved = localStorage.getItem("sim_leads");
      const leadsList = saved ? JSON.parse(saved) : [];
      const newLead = {
        ...lead,
        status: "new" as const,
        createdAt: new Date().toISOString().replace("T", " ").slice(0, 16)
      };
      leadsList.unshift(newLead);
      localStorage.setItem("sim_leads", JSON.stringify(leadsList));
      setLeads(leadsList);
      return;
    }

    const leadRef = doc(db, "leads", lead.id);
    try {
      await setDoc(leadRef, {
        ...lead,
        status: "new",
        createdAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `leads/${lead.id}`);
    }
  };

  // 11. Update lead state status
  const updateLeadStatus = async (id: string, status: Lead["status"]) => {
    if (!user || userProfile?.role !== "admin") return;
    if (user.uid.startsWith("simulated-")) {
      const saved = localStorage.getItem("sim_leads");
      const leadsList = saved ? JSON.parse(saved) : [];
      const index = leadsList.findIndex((l: any) => l.id === id);
      if (index >= 0) {
        leadsList[index].status = status;
        localStorage.setItem("sim_leads", JSON.stringify(leadsList));
        setLeads(leadsList);
      }
      return;
    }

    const leadRef = doc(db, "leads", id);
    try {
      await updateDoc(leadRef, { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `leads/${id}`);
    }
  };

  const updateLead = async (id: string, updates: Partial<Omit<Lead, "id" | "createdAt">>) => {
    if (!user || userProfile?.role !== "admin") return;
    if (user.uid.startsWith("simulated-")) {
      const saved = localStorage.getItem("sim_leads");
      const leadsList = saved ? JSON.parse(saved) : [];
      const index = leadsList.findIndex((l: any) => l.id === id);
      if (index >= 0) {
        leadsList[index] = { ...leadsList[index], ...updates };
        localStorage.setItem("sim_leads", JSON.stringify(leadsList));
        setLeads(leadsList);
      }
      return;
    }

    const leadRef = doc(db, "leads", id);
    try {
      await updateDoc(leadRef, updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `leads/${id}`);
    }
  };

  // 12. Delete lead record
  const deleteLead = async (id: string) => {
    if (!user || userProfile?.role !== "admin") return;
    if (user.uid.startsWith("simulated-")) {
      const saved = localStorage.getItem("sim_leads");
      const leadsList = saved ? JSON.parse(saved) : [];
      const filtered = leadsList.filter((l: any) => l.id !== id);
      localStorage.setItem("sim_leads", JSON.stringify(filtered));
      setLeads(filtered);
      return;
    }

    const leadRef = doc(db, "leads", id);
    try {
      await deleteDoc(leadRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `leads/${id}`);
    }
  };

  return (
    <DatabaseContext.Provider
      value={{
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
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error("useDatabase must be used inside a DatabaseProvider scope.");
  }
  return context;
};
