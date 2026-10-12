

import { useEffect, useState, type FormEvent } from "react";

import "./App.css";

const API_BASE_URL = "http://127.0.0.1:8000";



type Priority = "High" | "Medium" | "Low";

type IssueStatus = "Open" | "In Progress" | "Resolved";



type Issue = {

  id: string;

  title: string;

  category: string;

  description: string;

  location: string;

  date: string;

  priority: Priority;

  status: IssueStatus;

};



type IssueFormData = {

  title: string;

  category: string;

  description: string;

  location: string;

  priority: Priority;

};



const emptyForm: IssueFormData = {

  title: "",

  category: "IT & Equipment",

  description: "",

  location: "",

  priority: "Medium",

};



const initialStats = {

  total: 128,

  open: 24,

  inProgress: 18,

  resolved: 86,

};



function App() {

  const [allIssues, setAllIssues] = useState<Issue[]>([]);

  const [formData, setFormData] = useState<IssueFormData>(emptyForm);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newIssueCount, setNewIssueCount] = useState(0);

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);





  function formatIssueDate(value: string): string {
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return value;
    return parsedDate.toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  }

  function mapApiIssue(data: {
    id: string; title: string; category: string; description: string;
    location: string; priority: Priority; status: IssueStatus; created_at: string;
  }): Issue {
    return {
      id: data.id, title: data.title, category: data.category,
      description: data.description, location: data.location,
      priority: data.priority, status: data.status,
      date: formatIssueDate(data.created_at),
    };
  }

  useEffect(() => {
    async function loadIssues() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = await fetch(`${API_BASE_URL}/api/issues`);
        if (!response.ok) throw new Error(`Failed to load issues (${response.status}).`);
        const data = await response.json();
        setAllIssues(data.map(mapApiIssue));
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to connect to the backend.");
      } finally {
        setIsLoading(false);
      }
    }
    loadIssues();
  }, []);

  const displayedIssues = [...allIssues].slice(0, 6);



  const stats = [

    {

      label: "Total Issues",

      value: initialStats.total + newIssueCount,

      change: newIssueCount

        ? `${newIssueCount} added this session`

        : "+12 this week",

      icon: "▤",

      color: "blue",

    },

    {

      label: "Open Issues",

      value: initialStats.open + newIssueCount,

      change: "Awaiting review",

      icon: "◷",

      color: "orange",

    },

    {

      label: "In Progress",

      value: initialStats.inProgress,

      change: "Being worked on",

      icon: "↻",

      color: "purple",

    },

    {

      label: "Resolved",

      value: initialStats.resolved,

      change: "67% resolution rate",

      icon: "✓",

      color: "green",

    },

  ];



  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = formData.title.trim();
    const description = formData.description.trim();
    const location = formData.location.trim();

    if (!title || !description || !location) {
      setErrorMessage("Please complete all required fields.");
      setSuccessMessage("");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category: formData.category, description, location, priority: formData.priority }),
      });
      const responseData = await response.json();
      if (!response.ok) {
        const detail = typeof responseData.detail === "string" ? responseData.detail : "Please check your information and try again.";
        throw new Error(detail);
      }

      const newIssue = mapApiIssue(responseData);
      setAllIssues((current) => [newIssue, ...current.filter((issue) => issue.id !== newIssue.id)]);
      setNewIssueCount((count) => count + 1);
      setSuccessMessage(`Issue ${newIssue.id} — "${newIssue.title}" was submitted successfully.`);
      setFormData(emptyForm);
      setSelectedIssue(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to submit the issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setFormData(emptyForm);
    setSuccessMessage("");
    setErrorMessage("");
  }



  return (

    <div className="app-shell">

      <aside className="sidebar">

        <a className="brand" href="#dashboard" aria-label="SIRRS home">

          <span className="brand-mark">S</span>

          <span className="brand-copy">

            <strong>SIRRS</strong>

            <small>Issue Resolution System</small>

          </span>

        </a>



        <div className="sidebar-label">WORKSPACE</div>



        <nav className="sidebar-nav" aria-label="Main navigation">

          <a className="nav-link active" href="#dashboard">

            <span className="nav-icon">▦</span>

            Dashboard

          </a>

          <a className="nav-link" href="#issues">

            <span className="nav-icon">▤</span>

            All Issues

            <span className="nav-count">{initialStats.open + newIssueCount}</span>

          </a>

          <a className="nav-link" href="#my-reports">

            <span className="nav-icon">♧</span>

            My Reports

          </a>

          <a className="nav-link" href="#assigned">

            <span className="nav-icon">☑</span>

            Assigned to Me

          </a>

        </nav>



        <div className="sidebar-label management-label">MANAGEMENT</div>



        <nav className="sidebar-nav" aria-label="Management navigation">

          <a className="nav-link" href="#analytics">

            <span className="nav-icon">▥</span>

            Analytics

          </a>

          <a className="nav-link" href="#settings">

            <span className="nav-icon">⚙</span>

            Settings

          </a>

        </nav>



        <div className="sidebar-bottom">

          <div className="help-card">

            <div className="help-icon">?</div>

            <strong>Need assistance?</strong>

            <p>Learn how to report and track an issue.</p>

            <a href="#report-issue">

              Report an issue <span>↗</span>

            </a>

          </div>



          <div className="sidebar-profile">

            <div className="avatar">SA</div>

            <div className="profile-copy">

              <strong>SIRRS User</strong>

              <small>Demo account</small>

            </div>

            <button

              className="more-button"

              type="button"

              aria-label="More account options"

              title="Demo account"

            >

              ⋯

            </button>

          </div>

        </div>

      </aside>



      <main className="main-content" id="dashboard">

        <header className="topbar">

          <div className="breadcrumb">

            Workspace <span>/</span> <strong>Dashboard</strong>

          </div>



          <div className="topbar-actions">

            <span className="system-status">

              <span className="online-dot" />

              Demo mode

            </span>



            <button

              className="icon-button notification-button"

              type="button"

              aria-label="Notifications"

              title="Notifications"

              onClick={() =>

                window.alert("Notifications will be available in a later step.")

              }

            >

              ♧

            </button>



            <div className="topbar-divider" />

            <div className="topbar-date">Monday, October 12, 2026</div>

          </div>

        </header>



        <section className="page-content">

          <div className="welcome-row">

            <div>

              <div className="eyebrow">OVERVIEW</div>

              <h1>Dashboard</h1>

              <p className="page-description">

                Monitor issues, track progress, and keep everything running

                smoothly.

              </p>

            </div>



            <a className="primary-button" href="#report-issue">

              <span>＋</span> Report an Issue

            </a>

          </div>



          <section className="stats-grid" aria-label="Issue statistics">

            {stats.map((stat) => (

              <article className="stat-card" key={stat.label}>

                <div className="stat-top">

                  <span className="stat-label">{stat.label}</span>

                  <span className={`stat-icon ${stat.color}`}>

                    {stat.icon}

                  </span>

                </div>

                <div className="stat-value">{stat.value}</div>

                <div className="stat-footer">{stat.change}</div>

              </article>

            ))}

          </section>



          <section className="dashboard-grid">

            <article className="panel recent-panel" id="issues">

              <div className="panel-header">

                <div>

                  <h2>Recent Issues</h2>

                  <p>A quick look at the latest reported issues.</p>

                </div>

                <a className="text-link" href="#report-issue">

                  Report new <span>→</span>

                </a>

              </div>



              <div className="table-wrap">

                <table className="issues-table">

                  <thead>

                    <tr>

                      <th>ISSUE</th>

                      <th>PRIORITY</th>

                      <th>STATUS</th>

                      <th>REPORTED</th>

                    </tr>

                  </thead>

                  <tbody>

                    {isLoading ? (
                      <tr><td colSpan={4}>Loading issues...</td></tr>
                    ) : displayedIssues.length === 0 ? (
                      <tr><td colSpan={4}>No issues found.</td></tr>
                    ) : displayedIssues.map((issue) => (

                      <tr key={issue.id}>

                        <td>

                          <button

                            className="issue-title issue-title-button"

                            type="button"

                            onClick={() => setSelectedIssue(issue)}

                          >

                            {issue.title}

                          </button>

                          <div className="issue-meta">

                            {issue.id} <span>·</span> {issue.location}

                          </div>

                        </td>

                        <td>

                          <span

                            className={`priority ${issue.priority.toLowerCase()}`}

                          >

                            <span className="priority-dot" />

                            {issue.priority}

                          </span>

                        </td>

                        <td>

                          <span

                            className={`status ${issue.status

                              .toLowerCase()

                              .replace(" ", "-")}`}

                          >

                            {issue.status}

                          </span>

                        </td>

                        <td className="date-cell">{issue.date}</td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>



              <div className="panel-footer">

                <span>

                  Showing {displayedIssues.length} recent issues

                </span>

                <a href="#report-issue">Report another issue →</a>

              </div>

            </article>



            <article className="panel workflow-panel">

              <div className="panel-header">

                <div>

                  <h2>Issue Overview</h2>

                  <p>Current resolution progress.</p>

                </div>

              </div>



              <div className="resolution-summary">

                <div className="resolution-number">

                  {Math.round(

                    ((initialStats.resolved) /

                      (initialStats.total + newIssueCount)) *

                      100

                  )}

                  %

                </div>

                <div className="resolution-caption">Resolution rate</div>

                <div className="progress-track">

                  <div

                    className="progress-fill"

                    style={{

                      width: `${

                        (initialStats.resolved /

                          (initialStats.total + newIssueCount)) *

                        100

                      }%`,

                    }}

                  />

                </div>

                <div className="progress-labels">

                  <span>{initialStats.resolved} resolved</span>

                  <span>{initialStats.total + newIssueCount} total</span>

                </div>

              </div>



              <div className="overview-divider" />



              <div className="status-breakdown">

                <div className="breakdown-row">

                  <span className="breakdown-dot open-dot" />

                  <span>Open</span>

                  <strong>{initialStats.open + newIssueCount}</strong>

                </div>

                <div className="breakdown-row">

                  <span className="breakdown-dot progress-dot" />

                  <span>In Progress</span>

                  <strong>{initialStats.inProgress}</strong>

                </div>

                <div className="breakdown-row">

                  <span className="breakdown-dot resolved-dot" />

                  <span>Resolved</span>

                  <strong>{initialStats.resolved}</strong>

                </div>

              </div>

            </article>

          </section>



          <section className="panel categories-panel" id="categories">

            <div className="panel-header">

              <div>

                <h2>Browse by Category</h2>

                <p>Common areas where issues are reported.</p>

              </div>

              <a className="text-link" href="#report-issue">

                Report an issue <span>→</span>

              </a>

            </div>



            <div className="categories-grid">

              <a className="category-card" href="#report-issue">

                <span className="category-icon category-blue">⌘</span>

                <span className="category-info">

                  <strong>IT & Equipment</strong>

                  <small>32 issues</small>

                </span>

                <span className="category-arrow">↗</span>

              </a>



              <a className="category-card" href="#report-issue">

                <span className="category-icon category-orange">⚒</span>

                <span className="category-info">

                  <strong>Maintenance</strong>

                  <small>28 issues</small>

                </span>

                <span className="category-arrow">↗</span>

              </a>



              <a className="category-card" href="#report-issue">

                <span className="category-icon category-purple">⌂</span>

                <span className="category-info">

                  <strong>Facilities</strong>

                  <small>24 issues</small>

                </span>

                <span className="category-arrow">↗</span>

              </a>



              <a className="category-card" href="#report-issue">

                <span className="category-icon category-green">♡</span>

                <span className="category-info">

                  <strong>Safety & Security</strong>

                  <small>18 issues</small>

                </span>

                <span className="category-arrow">↗</span>

              </a>

            </div>

          </section>



          <section className="panel report-panel" id="report-issue">

            <div className="panel-header">

              <div>

                <h2>Report a New Issue</h2>

                <p>

                  Provide the details below so the appropriate team can review

                  it.

                </p>

              </div>

              <span className="form-required-note">* Required fields</span>

            </div>



            <form

              className="report-form"

              onSubmit={handleSubmit}

              onReset={handleReset}

            >

              {successMessage && (

                <div className="success-message" role="status">

                  <span>✓</span> {successMessage}

                </div>

              )}
              {errorMessage && (<div className="error-message" role="alert">{errorMessage}</div>)}



              <div className="form-grid">

                <div className="form-field">

                  <label htmlFor="issue-title">Issue title *</label>

                  <input

                    id="issue-title"

                    name="title"

                    type="text"

                    placeholder="e.g. Projector not working"

                    value={formData.title}

                    onChange={(event) =>

                      setFormData({

                        ...formData,

                        title: event.target.value,

                      })

                    }

                    maxLength={120}

                    required

                  />

                </div>



                <div className="form-field">

                  <label htmlFor="issue-category">Category *</label>

                  <select

                    id="issue-category"

                    name="category"

                    value={formData.category}

                    onChange={(event) =>

                      setFormData({

                        ...formData,

                        category: event.target.value,

                      })

                    }

                    required

                  >

                    <option>IT & Equipment</option>

                    <option>Maintenance</option>

                    <option>Facilities</option>

                    <option>Safety & Security</option>

                    <option>Plumbing</option>

                    <option>Other</option>

                  </select>

                </div>



                <div className="form-field form-field-full">

                  <label htmlFor="issue-description">Description *</label>

                  <textarea

                    id="issue-description"

                    name="description"

                    placeholder="Explain what happened and include useful details..."

                    value={formData.description}

                    onChange={(event) =>

                      setFormData({

                        ...formData,

                        description: event.target.value,

                      })

                    }

                    rows={4}

                    maxLength={2000}

                    required

                  />

                </div>



                <div className="form-field">

                  <label htmlFor="issue-location">Location *</label>

                  <input

                    id="issue-location"

                    name="location"

                    type="text"

                    placeholder="e.g. Building A, Room 302"

                    value={formData.location}

                    onChange={(event) =>

                      setFormData({

                        ...formData,

                        location: event.target.value,

                      })

                    }

                    maxLength={200}

                    required

                  />

                </div>



                <div className="form-field">

                  <label htmlFor="issue-priority">Priority *</label>

                  <select

                    id="issue-priority"

                    name="priority"

                    value={formData.priority}

                    onChange={(event) =>

                      setFormData({

                        ...formData,

                        priority: event.target.value as Priority,

                      })

                    }

                    required

                  >

                    <option value="Low">Low</option>

                    <option value="Medium">Medium</option>

                    <option value="High">High</option>

                  </select>

                </div>



                <div className="form-field form-field-full">

                  <label htmlFor="issue-attachment">

                    Attachment (optional)

                  </label>

                  <input

                    id="issue-attachment"

                    name="attachment"

                    type="file"

                    accept="image/*,.pdf"

                  />

                  <small className="field-help">

                    Image and PDF selection is available. File uploading and

                    storage will be implemented with the backend.

                  </small>

                </div>

              </div>



              <div className="form-actions">

                <button className="secondary-button" type="reset">

                  Reset form

                </button>

                <button className="primary-button" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Issue →"}
                </button>

              </div>

            </form>

          </section>



          {selectedIssue && (

            <div

              className="modal-backdrop"

              role="presentation"

              onClick={() => setSelectedIssue(null)}

            >

              <section

                className="issue-modal"

                role="dialog"

                aria-modal="true"

                aria-labelledby="issue-modal-title"

                onClick={(event) => event.stopPropagation()}

              >

                <div className="modal-heading">

                  <div>

                    <span className="modal-issue-id">{selectedIssue.id}</span>

                    <h2 id="issue-modal-title">{selectedIssue.title}</h2>

                  </div>

                  <button

                    className="modal-close"

                    type="button"

                    aria-label="Close issue details"

                    onClick={() => setSelectedIssue(null)}

                  >

                    ×

                  </button>

                </div>



                <div className="modal-details">

                  <div>

                    <span>Category</span>

                    <strong>{selectedIssue.category}</strong>

                  </div>

                  <div>

                    <span>Location</span>

                    <strong>{selectedIssue.location}</strong>

                  </div>

                  <div>

                    <span>Priority</span>

                    <strong>{selectedIssue.priority}</strong>

                  </div>

                  <div>

                    <span>Status</span>

                    <strong>{selectedIssue.status}</strong>

                  </div>

                  <div>

                    <span>Reported</span>

                    <strong>{selectedIssue.date}</strong>

                  </div>

                </div>



                <div className="modal-description">

                  <h3>Description</h3>

                  <p>{selectedIssue.description}</p>

                </div>



                <button

                  className="primary-button modal-done"

                  type="button"

                  onClick={() => setSelectedIssue(null)}

                >

                  Close details

                </button>

              </section>

            </div>

          )}



          <footer className="page-footer">

            <span>

              © 2026 SIRRS · Smart Issue Reporting and Resolution System

            </span>

            <span>Built for better issue management.</span>

          </footer>

        </section>

      </main>

    </div>

  );

}



export default App;
