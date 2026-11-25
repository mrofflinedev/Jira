import { useCallback, useEffect, useState } from 'react';
import api from './api';
import Auth from './Auth.jsx';
import './App.css';

const COLUMNS = [
  { key: 'TODO', label: 'To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'DONE', label: 'Done' },
];

function App() {
  const [issues, setIssues] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(localStorage.getItem('access_token'))
  );
  const [username, setUsername] = useState(
    () => localStorage.getItem('username') || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [editingIssue, setEditingIssue] = useState(null);

  const handleLogout = useCallback(() => {
    ['access_token', 'refresh_token', 'username'].forEach((key) =>
      localStorage.removeItem(key)
    );
    setIsAuthenticated(false);
    setUsername('');
    setIssues([]);
  }, []);

  const fetchIssues = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get('issues/');
      setIssues(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      console.error('Error fetching issues:', requestError);
      setError('Could not load issues. Please try again.');
      if (requestError.response?.status === 401) handleLogout();
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    if (isAuthenticated) fetchIssues();
  }, [fetchIssues, isAuthenticated]);

  useEffect(() => {
    if (!editingIssue) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') setEditingIssue(null);
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [editingIssue]);

  const handleLogin = (loggedInUsername) => {
    setUsername(loggedInUsername);
    setIsAuthenticated(true);
  };

  const handleCreateIssue = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;

    setError('');
    try {
      const response = await api.post('issues/', {
        title: title.trim(),
        description: description.trim(),
        priority,
        status: 'TODO',
      });
      setIssues((currentIssues) => [response.data, ...currentIssues]);
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
    } catch (requestError) {
      console.error('Error creating issue:', requestError);
      setError('Could not create the issue.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setError('');
    try {
      const response = await api.patch(`issues/${id}/`, { status: newStatus });
      setIssues((currentIssues) =>
        currentIssues.map((issue) => (issue.id === id ? response.data : issue))
      );
    } catch (requestError) {
      console.error('Error updating status:', requestError);
      setError('Could not update the issue status.');
    }
  };

  const handleUpdateIssue = async (event) => {
    event.preventDefault();
    if (!editingIssue || !editingIssue.title.trim()) return;

    setError('');
    try {
      const response = await api.patch(`issues/${editingIssue.id}/`, {
        title: editingIssue.title.trim(),
        description: editingIssue.description?.trim() || '',
        priority: editingIssue.priority,
        status: editingIssue.status,
      });
      setIssues((currentIssues) =>
        currentIssues.map((issue) =>
          issue.id === editingIssue.id ? response.data : issue
        )
      );
      setEditingIssue(null);
    } catch (requestError) {
      console.error('Error updating issue:', requestError);
      setError('Could not save the issue changes.');
    }
  };

  const handleDelete = async (event, id) => {
    event.stopPropagation();
    setError('');
    try {
      await api.delete(`issues/${id}/`);
      setIssues((currentIssues) =>
        currentIssues.filter((issue) => issue.id !== id)
      );
      if (editingIssue?.id === id) setEditingIssue(null);
    } catch (requestError) {
      console.error('Error deleting issue:', requestError);
      setError('Could not delete the issue.');
    }
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredIssues = issues.filter((issue) => {
    const issueTitle = issue.title || '';
    const issueDescription = issue.description || '';
    const matchesSearch =
      !normalizedSearch ||
      issueTitle.toLowerCase().includes(normalizedSearch) ||
      issueDescription.toLowerCase().includes(normalizedSearch);
    const matchesPriority =
      priorityFilter === 'ALL' || issue.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  if (!isAuthenticated) return <Auth onLoginSuccess={handleLogin} />;

  return (
    <div className="app-container">
      <header className="header">
        <h1>Jira Issue Tracker</h1>
        <div className="header-right">
          {username && <span className="user-badge">{username}</span>}
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      {error && (
        <div className="app-error" role="alert">
          {error}
          <button type="button" onClick={() => setError('')} aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleCreateIssue} className="issue-form">
        <input
          type="text"
          placeholder="Issue summary (e.g., Fix login bug)"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
          required
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
          aria-label="Issue priority"
        >
          <option value="LOW">Low Priority</option>
          <option value="MEDIUM">Medium Priority</option>
          <option value="HIGH">High Priority</option>
        </select>
        <button type="submit" disabled={!title.trim()}>
          + Create Issue
        </button>
      </form>

      <div className="filter-bar">
        <input
          type="search"
          placeholder="Search issues by keyword..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="search-input"
        />
        <select
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
          className="filter-select"
          aria-label="Filter by priority"
        >
          <option value="ALL">All Priorities</option>
          <option value="HIGH">High Priority Only</option>
          <option value="MEDIUM">Medium Priority Only</option>
          <option value="LOW">Low Priority Only</option>
        </select>
      </div>

      {isLoading ? (
        <div className="loading-state" role="status">Loading issues...</div>
      ) : (
        <>
          <div className="board" aria-label="Issue board">
            {COLUMNS.map((column) => {
              const columnIssues = filteredIssues.filter(
                (issue) => issue.status === column.key
              );
              return (
                <section key={column.key} className="column">
                  <h2>
                    {column.label}{' '}
                    <span className="col-count">({columnIssues.length})</span>
                  </h2>
                  {columnIssues.length === 0 && (
                    <p className="empty-column">No issues</p>
                  )}
                  {columnIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="card"
                      role="button"
                      tabIndex={0}
                      onClick={() => setEditingIssue({
                        ...issue,
                        title: issue.title || '',
                        description: issue.description || '',
                        priority: issue.priority || 'MEDIUM',
                        status: issue.status || 'TODO',
                      })}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setEditingIssue({
                            ...issue,
                            title: issue.title || '',
                            description: issue.description || '',
                            priority: issue.priority || 'MEDIUM',
                            status: issue.status || 'TODO',
                          });
                        }
                      }}
                      title="Click to edit issue"
                    >
                      <div className="card-header">
                        <span className={`badge ${(issue.priority || 'medium').toLowerCase()}`}>
                          {issue.priority || 'MEDIUM'}
                        </span>
                        <button
                          type="button"
                          onClick={(event) => handleDelete(event, issue.id)}
                          className="delete-btn"
                          title="Delete issue"
                          aria-label={`Delete ${issue.title || 'issue'}`}
                        >
                          ×
                        </button>
                      </div>
                      <h3>{issue.title}</h3>
                      {issue.description && <p>{issue.description}</p>}
                      <select
                        value={issue.status || 'TODO'}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) =>
                          handleStatusChange(issue.id, event.target.value)
                        }
                        className="status-select"
                        aria-label={`Status for ${issue.title}`}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </div>
                  ))}
                </section>
              );
            })}
          </div>
          {filteredIssues.length === 0 && issues.length > 0 && (
            <p className="no-results">No issues match the current filters.</p>
          )}
        </>
      )}

      {editingIssue && (
        <div
          className="modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditingIssue(null);
          }}
        >
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-issue-title"
          >
            <div className="modal-header">
              <h2 id="edit-issue-title">Edit Issue</h2>
              <button
                type="button"
                className="delete-btn"
                onClick={() => setEditingIssue(null)}
                aria-label="Close edit dialog"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateIssue} className="modal-form">
              <label htmlFor="edit-summary">Summary</label>
              <input
                id="edit-summary"
                type="text"
                value={editingIssue.title}
                onChange={(event) =>
                  setEditingIssue({ ...editingIssue, title: event.target.value })
                }
                maxLength={200}
                required
              />

              <label htmlFor="edit-description">Description</label>
              <textarea
                id="edit-description"
                rows="4"
                value={editingIssue.description || ''}
                onChange={(event) =>
                  setEditingIssue({
                    ...editingIssue,
                    description: event.target.value,
                  })
                }
              />

              <div className="modal-row">
                <div>
                  <label htmlFor="edit-priority">Priority</label>
                  <select
                    id="edit-priority"
                    value={editingIssue.priority}
                    onChange={(event) =>
                      setEditingIssue({
                        ...editingIssue,
                        priority: event.target.value,
                      })
                    }
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-status">Status</label>
                  <select
                    id="edit-status"
                    value={editingIssue.status}
                    onChange={(event) =>
                      setEditingIssue({
                        ...editingIssue,
                        status: event.target.value,
                      })
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
                <button
                  type="submit"
                  className="save-btn"
                  disabled={!editingIssue.title.trim()}
                >
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
