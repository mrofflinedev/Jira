import { useState, useEffect } from 'react';
import api from './api';
import Auth from './Auth';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('username'));
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  // Create form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Edit modal state
  const [editingIssue, setEditingIssue] = useState(null);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const response = await api.get('issues/');
      setIssues(response.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchIssues();
    }
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    setCurrentUser(null);
    setIssues([]);
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const response = await api.post('issues/', {
        title,
        description,
        priority,
        status: 'TODO',
      });
      setIssues([response.data, ...issues]);
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
    } catch (error) {
      console.error('Error creating issue:', error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await api.patch(`issues/${id}/`, { status: newStatus });
      setIssues(issues.map((issue) => (issue.id === id ? response.data : issue)));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleUpdateIssue = async (e) => {
    e.preventDefault();
    if (!editingIssue || !editingIssue.title.trim()) return;

    try {
      const response = await api.patch(`issues/${editingIssue.id}/`, {
        title: editingIssue.title,
        description: editingIssue.description,
        priority: editingIssue.priority,
        status: editingIssue.status,
      });
      setIssues(issues.map((issue) => (issue.id === editingIssue.id ? response.data : issue)));
      setEditingIssue(null);
    } catch (error) {
      console.error('Error updating issue:', error);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete(`issues/${id}/`);
      setIssues(issues.filter((issue) => issue.id !== id));
    } catch (error) {
      console.error('Error deleting issue:', error);
    }
  };

  if (!currentUser) {
    return <Auth onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.description && issue.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = priorityFilter === 'ALL' || issue.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const todoCount = issues.filter((i) => i.status === 'TODO').length;
  const progressCount = issues.filter((i) => i.status === 'IN_PROGRESS').length;
  const doneCount = issues.filter((i) => i.status === 'DONE').length;

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const columns = [
    { key: 'TODO', label: 'To Do', emptyText: 'No pending tasks. Add one above!' },
    { key: 'IN_PROGRESS', label: 'In Progress', emptyText: 'Nothing in progress right now.' },
    { key: 'DONE', label: 'Done', emptyText: 'Completed issues will show up here.' },
  ];

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="header">
        <div>
          <h1>Jira Workspace</h1>
          <p className="welcome-text">
            Welcome back, <strong>{currentUser}</strong> — here is what’s on your board today.
          </p>
        </div>
        <div className="header-right">
          <div className="user-pill">
            <span className="avatar-circle">{currentUser.charAt(0).toUpperCase()}</span>
            <span>{currentUser}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Sign Out
          </button>
        </div>
      </header>

      {/* Summary Stats Strip */}
      <div className="stats-strip">
        <div className="stat-box">
          <span className="stat-label">Total Issues</span>
          <span className="stat-value">{issues.length}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">To Do</span>
          <span className="stat-value blue">{todoCount}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">In Progress</span>
          <span className="stat-value amber">{progressCount}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Completed</span>
          <span className="stat-value green">{doneCount}</span>
        </div>
      </div>

      {/* Create Issue Panel */}
      <section className="create-section">
        <div className="section-heading">Quick Create Issue</div>
        <form onSubmit={handleCreateIssue} className="issue-form">
          <input
            type="text"
            placeholder="What needs to be done? (e.g., Fix navbar alignment)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Add extra details or acceptance criteria..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="HIGH">High Priority</option>
          </select>
          <button type="submit">+ Add Ticket</button>
        </form>
      </section>

      {/* Search & Filter Toolbar */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search tickets by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="filter-select"
        >
          <option value="ALL">All Priorities</option>
          <option value="HIGH">High Priority</option>
          <option value="MEDIUM">Medium Priority</option>
          <option value="LOW">Low Priority</option>
        </select>
        {(searchQuery || priorityFilter !== 'ALL') && (
          <button
            type="button"
            className="clear-filter-btn"
            onClick={() => {
              setSearchQuery('');
              setPriorityFilter('ALL');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* 3-Column Kanban Board */}
      {loading ? (
        <div className="loading-state">Loading your workspace...</div>
      ) : (
        <div className="board">
          {columns.map((col) => {
            const colIssues = filteredIssues.filter((issue) => issue.status === col.key);
            return (
              <div key={col.key} className="column">
                <div className="column-header">
                  <h2>{col.label}</h2>
                  <span className="col-badge">{colIssues.length}</span>
                </div>

                {colIssues.length === 0 ? (
                  <div className="empty-column">{col.emptyText}</div>
                ) : (
                  colIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="card"
                      onClick={() => setEditingIssue(issue)}
                      title="Click to edit ticket details"
                    >
                      <div className="card-header">
                        <div className="card-tags">
                          <span className="issue-key">JIRA-{issue.id}</span>
                          <span className={`badge ${issue.priority.toLowerCase()}`}>
                            {issue.priority}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleDelete(e, issue.id)}
                          className="delete-btn"
                          title="Delete issue"
                        >
                          ×
                        </button>
                      </div>

                      <h3>{issue.title}</h3>
                      {issue.description && <p>{issue.description}</p>}

                      <div className="card-meta">
                        <span className="meta-user">
                          Assigned: <strong>{issue.assignee_username || currentUser}</strong>
                        </span>
                        <span className="meta-date">{formatDate(issue.created_at)}</span>
                      </div>

                                            <select
                        value={issue.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="TODO">Move to: To Do</option>
                        <option value="IN_PROGRESS">Move to: In Progress</option>
                        <option value="DONE">Move to: Done</option>
                      </select>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Issue Modal */}
      {editingIssue && (
        <div className="modal-overlay" onClick={() => setEditingIssue(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="issue-key">JIRA-{editingIssue.id}</span>
                <h2>Edit Issue Details</h2>
              </div>
              <button className="delete-btn" onClick={() => setEditingIssue(null)}>
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateIssue} className="modal-form">
              <label>Summary</label>
              <input
                type="text"
                value={editingIssue.title}
                onChange={(e) =>
                  setEditingIssue({ ...editingIssue, title: e.target.value })
                }
                required
              />

              <label>Description</label>
              <textarea
                rows="4"
                placeholder="Add more context..."
                value={editingIssue.description}
                onChange={(e) =>
                  setEditingIssue({ ...editingIssue, description: e.target.value })
                }
              />

              <div className="modal-row">
                <div>
                  <label>Priority</label>
                  <select
                    value={editingIssue.priority}
                    onChange={(e) =>
                      setEditingIssue({ ...editingIssue, priority: e.target.value })
                    }
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div>
                  <label>Status</label>
                  <select
                    value={editingIssue.status}
                    onChange={(e) =>
                      setEditingIssue({ ...editingIssue, status: e.target.value })
                    }
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEditingIssue(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

              