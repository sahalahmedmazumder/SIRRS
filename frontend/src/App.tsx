
import { useEffect, useState } from "react";
import "./App.css";

import Login from "./components/Login";
import Register from "./components/Register";

import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";

import AllIssuesPage from "./pages/AllIssuesPage";
import DashboardPage from "./pages/DashboardPage";
import SubmitIssuePage from "./pages/SubmitIssuePage";
import UserManagementPage from "./pages/UserManagementPage";

import { API_BASE_URL } from "./services/api";

import type { Issue, IssueStatus } from "./types/issue";
import type { User } from "./types/user";

import { mapApiIssues } from "./utils/issueUtils";

type ActivePage =
  | "dashboard"
  | "all-issues"
  | "submit-issue"
  | "user-management";

type AuthPage = "login" | "register";

function readSavedUser(): User | null {
  try {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

function App() {
  // AUTHENTICATION

  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("access_token")
  );

  const [currentUser, setCurrentUser] = useState<User | null>(
    readSavedUser
  );

  const [authPage, setAuthPage] = useState<AuthPage>("login");

  const [isAuthChecking, setIsAuthChecking] = useState(
    () => Boolean(localStorage.getItem("access_token"))
  );

  const [authError, setAuthError] = useState("");

  const userRole = currentUser?.role ?? null;

  // APPLICATION STATE

  const [activePage, setActivePage] =
    useState<ActivePage>("dashboard");

  const [issues, setIssues] = useState<Issue[]>([]);

  const [staffUsers, setStaffUsers] = useState<User[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // LOGOUT

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user");

    setToken(null);
    setCurrentUser(null);
    setIssues([]);
    setStaffUsers([]);

    setActivePage("dashboard");
    setAuthPage("login");

    setIsAuthChecking(false);
    setAuthError("");

    setSuccessMessage("");
    setErrorMessage("");
  }

  // LOGIN SUCCESS

  function handleLoginSuccess() {
    const savedToken = localStorage.getItem("access_token");
    const savedUser = readSavedUser();

    if (!savedToken || !savedUser) {
      setAuthError("Login information is incomplete. Please try again.");
      handleLogout();
      return;
    }

    setAuthError("");
    setCurrentUser(savedUser);
    setToken(savedToken);
    setActivePage("dashboard");
    setIsAuthChecking(true);
  }

  // REGISTRATION SUCCESS

  function handleRegisterSuccess() {
    setAuthPage("login");
  }

  // LOAD ISSUES

  async function refreshIssues(): Promise<void> {
    const savedToken = localStorage.getItem("access_token");

    if (!savedToken) {
      setIssues([]);
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/issues/`,
      {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      }
    );

    if (response.status === 401) {
      handleLogout();
      throw new Error("Your session has expired. Please log in again.");
    }

    const data = await response.json().catch(() => []);

    if (!response.ok) {
      throw new Error(data.detail || "Unable to load issues.");
    }

    if (!Array.isArray(data)) {
      throw new Error("Unexpected issues response from the server.");
    }

    setIssues(mapApiIssues(data));
  }

  // LOAD STAFF USERS

  async function refreshStaffUsers(): Promise<void> {
    if (!token || userRole !== "Admin") {
      setStaffUsers([]);
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/admin/users/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json().catch(() => []);

    if (response.status === 401) {
      handleLogout();
      throw new Error("Your session has expired. Please log in again.");
    }

    if (!response.ok) {
      throw new Error(
        data.detail || "Unable to load staff users."
      );
    }

    if (!Array.isArray(data)) {
      throw new Error("Unexpected staff response from the server.");
    }

    setStaffUsers(
      data.filter(
        (user: User) => user.role === "Staff"
      )
    );
  }

  // VERIFY SESSION AND LOAD DATA

  useEffect(() => {
    let cancelled = false;

    async function initializeApplication() {
      if (!token) {
        setIssues([]);
        setStaffUsers([]);
        setIsAuthChecking(false);
        return;
      }

      setIsAuthChecking(true);
      setIsLoading(true);
      setAuthError("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/issues/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (cancelled) return;

        if (response.status === 401) {
          handleLogout();
          return;
        }

        const data = await response.json().catch(() => []);

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to verify your session."
          );
        }

        if (!Array.isArray(data)) {
          throw new Error("Unexpected response from the server.");
        }

        if (!cancelled) {
          setIssues(mapApiIssues(data));
        }

        if (userRole === "Admin") {
          const staffResponse = await fetch(
            `${API_BASE_URL}/api/admin/users/`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const staffData = await staffResponse.json().catch(() => []);

          if (!staffResponse.ok) {
            throw new Error(
              staffData.detail || "Unable to load staff users."
            );
          }

          if (!Array.isArray(staffData)) {
            throw new Error("Unexpected staff response from the server.");
          }

          if (!cancelled) {
            setStaffUsers(
              staffData.filter(
                (user: User) => user.role === "Staff"
              )
            );
          }
        } else {
          setStaffUsers([]);
        }
      } catch (error) {
        if (!cancelled) {
          setAuthError(
            error instanceof Error
              ? error.message
              : "Unable to connect to the backend."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsAuthChecking(false);
        }
      }
    }

    void initializeApplication();

    return () => {
      cancelled = true;
    };
  }, [token, userRole]);

  // NAVIGATION

  function handleNavigate(page: ActivePage) {
    setActivePage(page);
    setSuccessMessage("");
    setErrorMessage("");
  }

  // UPDATE ISSUE STATUS

  async function handleStatusChange(
    issueId: string,
    status: IssueStatus
  ): Promise<void> {
    if (!token || userRole !== "Staff") {
      throw new Error("You are not authorized to update this issue.");
    }

    if (status === "Open") return;

    setErrorMessage("");
    setSuccessMessage("");

    const response = await fetch(
      `${API_BASE_URL}/api/issues/${issueId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      handleLogout();
      throw new Error("Your session has expired.");
    }

    if (!response.ok) {
      throw new Error(
        data.detail || "Unable to update issue status."
      );
    }

    await refreshIssues();

    setSuccessMessage(`Issue status updated to ${status}.`);
  }

  // DELETE ISSUE

  async function handleDeleteIssue(issueId: string): Promise<void> {
    if (!token || userRole !== "Reporter") {
      throw new Error("You are not authorized to delete this issue.");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/issues/${issueId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      handleLogout();
      throw new Error("Your session has expired.");
    }

    if (!response.ok) {
      throw new Error(
        data.detail || "Unable to delete issue."
      );
    }

    await refreshIssues();

    setSuccessMessage("Issue deleted successfully.");
  }

  // ASSIGN ISSUE TO STAFF

  async function handleAssignIssue(
    issueId: string,
    staffId: string
  ): Promise<void> {
    if (!token || userRole !== "Admin") {
      throw new Error("Only Admin can assign issues.");
    }

    if (!staffId) {
      throw new Error("Please select a staff member.");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/admin/issues/${issueId}/assign`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          staff_id: staffId,
        }),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      handleLogout();
      throw new Error("Your session has expired.");
    }

    if (!response.ok) {
      throw new Error(
        data.detail || "Unable to assign this issue."
      );
    }

    await refreshIssues();

    setSuccessMessage("Issue assigned to staff successfully.");
  }

  // EDIT ISSUE NAVIGATION

  function handleEditIssue(issue: Issue) {
    setActivePage("all-issues");
    setSuccessMessage(
      `Find "${issue.title}" in All Issues to edit it.`
    );
  }

  // PAGE INFORMATION

  const pageTitles: Record<ActivePage, string> = {
    dashboard:
      userRole === "Reporter"
        ? "Reporter Dashboard"
        : userRole === "Staff"
          ? "Staff Dashboard"
          : "Admin Dashboard",

    "all-issues": "All Issues",
    "submit-issue": "Submit an Issue",
    "user-management": "User Management",
  };

  const pageSubtitles: Record<ActivePage, string> = {
    dashboard: "Your SIRRS workspace overview.",
    "all-issues": "Review and manage reported issues.",
    "submit-issue": "Submit a new issue for review.",
    "user-management": "Manage system users and their roles.",
  };

  // AUTHENTICATION LOADING

  if (isAuthChecking) {
    return (
      <div className="loading-state">
        Verifying your session...
      </div>
    );
  }

  // AUTHENTICATION ERROR

  if (token && authError) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h2>Unable to verify your session</h2>
          <p>{authError}</p>

          <button
            className="primary-button"
            type="button"
            onClick={handleLogout}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // LOGIN AND REGISTER

  if (!token) {
    if (authPage === "register") {
      return (
        <Register
          onSuccess={handleRegisterSuccess}
          onLoginClick={() => setAuthPage("login")}
        />
      );
    }

    return (
      <Login
        onSuccess={handleLoginSuccess}
        onRegisterClick={() => setAuthPage("register")}
      />
    );
  }

  // VALIDATE USER

  if (
    !currentUser ||
    !userRole ||
    !["Reporter", "Staff", "Admin"].includes(userRole)
  ) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h2>Account information unavailable</h2>

          <p>
            Please log in again to refresh your account information.
          </p>

          <button
            className="primary-button"
            type="button"
            onClick={handleLogout}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // ROLE PERMISSIONS

  const allowedPages: ActivePage[] = [
    "dashboard",
    "all-issues",
  ];

  if (userRole === "Reporter") {
    allowedPages.push("submit-issue");
  }

  if (userRole === "Admin") {
    allowedPages.push("user-management");
  }

  // MAIN APPLICATION

  return (
    <div className="app-shell">
      <Sidebar
        role={userRole}
        activePage={activePage}
        onNavigate={handleNavigate}
      />

      <main className="main-content">
        <Header
          title={pageTitles[activePage]}
          subtitle={pageSubtitles[activePage]}
          user={currentUser}
          onLogout={handleLogout}
        />

        <section className="page-content">
          {successMessage && (
            <div className="success-message dashboard-message">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="error-message dashboard-message">
              {errorMessage}
            </div>
          )}

          {activePage === "dashboard" && (
            <DashboardPage
              role={userRole}
              userName={currentUser.name}
              currentUserId={currentUser.user_id}
              issues={issues}
              onNavigateToIssues={() =>
                handleNavigate("all-issues")
              }
              onEditIssue={handleEditIssue}
              onDeleteIssue={handleDeleteIssue}
              onStatusChange={handleStatusChange}
            />
          )}

          {activePage === "all-issues" && (
            <AllIssuesPage
              token={token}
              role={userRole}
              currentUserId={currentUser.user_id}
              issues={issues}
              staffUsers={staffUsers}
              onAssignIssue={handleAssignIssue}
              onRefresh={refreshIssues}
            />
          )}

          {activePage === "submit-issue" &&
            userRole === "Reporter" && (
              <SubmitIssuePage
                token={token}
                onCreated={async () => {
                  await refreshIssues();
                  setSuccessMessage(
                    "Your issue has been submitted successfully."
                  );
                  setActivePage("all-issues");
                }}
                onCancel={() => handleNavigate("dashboard")}
              />
            )}

          {activePage === "user-management" &&
            userRole === "Admin" && (
              <UserManagementPage />
            )}

          <footer className="page-footer">
            © 2026 SIRRS · Smart Issue Reporting and Resolution System
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
