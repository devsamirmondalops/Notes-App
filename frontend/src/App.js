import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('notes-token'));
  const [email, setEmail] = useState(() => localStorage.getItem('notes-email') || '');
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [appError, setAppError] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    const loadNotes = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/notes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (active) {
          setNotes(response.data);
          setAppError('');
        }
      } catch (error) {
        if (!active) return;
        if (error.response?.status === 401) {
          localStorage.removeItem('notes-token');
          localStorage.removeItem('notes-email');
          setToken(null);
          setEmail('');
        } else {
          setAppError('Unable to load your notes. Please try again.');
        }
      }
    };
    loadNotes();
    return () => { active = false; };
  }, [token, apiUrl]);

  const handleAuth = async (event) => {
    event.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const endpoint = authMode === 'login' ? 'login' : 'register';
      const response = await axios.post(`${apiUrl}/api/auth/${endpoint}`, {
        email: authEmail,
        password,
      });
      localStorage.setItem('notes-token', response.data.token);
      localStorage.setItem('notes-email', response.data.user.email);
      setEmail(response.data.user.email);
      setToken(response.data.token);
      setPassword('');
    } catch (error) {
      setAuthError(error.response?.data?.error || 'Unable to connect. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('notes-token');
    localStorage.removeItem('notes-email');
    setToken(null);
    setEmail('');
    setNotes([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return setAppError('Both title and note are required.');
    try {
      const response = await axios.post(`${apiUrl}/api/notes`, { title, content }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTitle('');
      setContent('');
      setNotes((currentNotes) => [...currentNotes, response.data]);
    } catch (error) {
      setAppError(error.response?.data?.error || 'Unable to save this note.');
    }
  };

  const togglePin = async (note) => {
    try {
      const res = await axios.patch(`${apiUrl}/api/notes/${note._id}/pin`, {
        pinned: !note.pinned,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setNotes((currentNotes) => currentNotes.map((currentNote) =>
        currentNote._id === note._id ? res.data : currentNote
      ));
    } catch (error) {
      setAppError('Unable to update this note.');
    }
  };

  const toggleCompleted = (note) => {
    setNotes((currentNotes) => currentNotes.map((currentNote) =>
      currentNote._id === note._id
        ? { ...currentNote, completed: !currentNote.completed }
        : currentNote
    ));
  };

  const deleteNote = async (note) => {
    try {
      await axios.delete(`${apiUrl}/api/notes/${note._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes((currentNotes) => currentNotes.filter((currentNote) => currentNote._id !== note._id));
    } catch (error) {
      setAppError('Unable to delete this note. Please try again.');
    }
  };

  if (!token) {
    const registering = authMode === 'register';
    return (
      <main className="auth-page">
        <section className="auth-intro">
          <a className="brand" href="/" aria-label="Noted home">
            <span className="brand-mark" aria-hidden="true">N</span>
            <span>Noted<span className="brand-period">.</span></span>
          </a>
          <div className="auth-message">
            <p className="eyebrow">A QUIETER PLACE TO THINK</p>
            <h1>Keep the thoughts<br />you want to find again.</h1>
            <p>Your notebook, ready whenever inspiration shows up.</p>
          </div>
          <span className="auth-index">01 / YOUR PRIVATE NOTEBOOK</span>
        </section>
        <section className="auth-panel" aria-labelledby="auth-title">
          <div className="auth-form-wrap">
            <p className="eyebrow">WELCOME {registering ? 'ABOARD' : 'BACK'}</p>
            <h2 id="auth-title">{registering ? 'Create your account' : 'Sign in to Noted'}</h2>
            <p className="auth-subtitle">{registering ? 'A fresh page starts here.' : 'Your notes are waiting for you.'}</p>
            <form className="auth-form" onSubmit={handleAuth}>
              <label htmlFor="auth-email">Email address</label>
              <input id="auth-email" type="email" autoComplete="email" placeholder="you@example.com" required value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} />
              <label htmlFor="auth-password">Password</label>
              <input id="auth-password" type="password" autoComplete={registering ? 'new-password' : 'current-password'} placeholder={registering ? 'At least 8 characters' : 'Enter your password'} minLength={registering ? 8 : undefined} required value={password} onChange={(event) => setPassword(event.target.value)} />
              {authError && <p className="form-error" role="alert">{authError}</p>}
              <button className="auth-submit" type="submit" disabled={authLoading}>
                {authLoading ? 'Please wait...' : registering ? 'Create account' : 'Sign in'}
                <span aria-hidden="true">↗</span>
              </button>
            </form>
            <p className="auth-switch">
              {registering ? 'Already have an account?' : 'New to Noted?'}{' '}
              <button type="button" onClick={() => {
                setAuthError('');
                setAuthMode(registering ? 'login' : 'register');
              }}>{registering ? 'Sign in' : 'Create an account'}</button>
            </p>
          </div>
          <span className="auth-footnote">YOUR IDEAS BELONG TO YOU</span>
        </section>
      </main>
    );
  }

  const pinnedNotes = notes.filter((note) => note.pinned);
  const unpinnedNotes = notes.filter((note) => !note.pinned);

  const renderNote = (note) => (
    <article className={`note-card${note.pinned ? ' note-card-pinned' : ''}`} key={note._id}>
      <div className="note-card-heading">
        <h3>{note.title}</h3>
        <div className="note-actions">
          <button
            className={`pin-button${note.pinned ? ' is-pinned' : ''}`}
            type="button"
            aria-label={note.pinned ? `Unpin ${note.title}` : `Pin ${note.title}`}
            aria-pressed={Boolean(note.pinned)}
            onClick={() => togglePin(note)}
            title={note.pinned ? 'Unpin note' : 'Pin note'}
          >
            <span aria-hidden="true">📌</span>
            {note.pinned ? 'Pinned' : 'Pin'}
          </button>
          <button
            className={`complete-button${note.completed ? ' is-complete' : ''}`}
            type="button"
            aria-label={note.completed ? `Mark ${note.title} incomplete` : `Mark ${note.title} as completed`}
            aria-pressed={Boolean(note.completed)}
            onClick={() => toggleCompleted(note)}
            title={note.completed ? 'Mark as incomplete' : 'Mark as completed'}
          >
            {note.completed ? 'Completed' : 'Mark complete'}
          </button>
          <button
            className="delete-button"
            type="button"
            aria-label={`Delete ${note.title}`}
            onClick={() => deleteNote(note)}
            title="Delete note"
          >
            Delete
          </button>
        </div>
      </div>
      <p>{note.content}</p>
    </article>
  );

  return (
    <main className="notes-app">
      <header className="app-header">
        <a className="brand" href="/" aria-label="Notes home">
          <span className="brand-mark" aria-hidden="true">N</span>
          <span>Noted<span className="brand-period">.</span></span>
        </a>
        <span className="header-caption">A little space for big thoughts</span>
        <div className="account-controls">
          <span>{email}</span>
          <button type="button" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      <div className="workspace">
        {appError && <p className="app-error" role="alert">{appError}</p>}
        <section className="composer" aria-labelledby="composer-title">
          <p className="eyebrow">YOUR NOTEBOOK</p>
          <h1 id="composer-title">Make room<br />for a new thought.</h1>
          <form onSubmit={handleSubmit}>
            <label htmlFor="note-title">Title</label>
            <input
              id="note-title"
              placeholder="Give this note a name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <label htmlFor="note-content">Your note</label>
            <textarea
              id="note-content"
              placeholder="Start writing here..."
              rows="5"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button className="add-button" type="submit">Add to notebook <span aria-hidden="true">↗</span></button>
          </form>
        </section>

        <section className="notes-column" aria-label="Your notes">
          <div className="notes-heading">
            <div>
              <p className="eyebrow">COLLECTION</p>
              <h2>Your notes <span>{notes.length}</span></h2>
            </div>
          </div>

          <section className="note-section" aria-labelledby="pinned-heading">
            <h3 className="section-label" id="pinned-heading"><span aria-hidden="true">📌</span> Pinned</h3>
            {pinnedNotes.length ? (
              <div className="note-list">{pinnedNotes.map(renderNote)}</div>
            ) : (
              <p className="empty-state">Pin a note to keep it close at hand.</p>
            )}
          </section>

          <section className="note-section" aria-labelledby="all-notes-heading">
            <h3 className="section-label" id="all-notes-heading">All notes</h3>
            {unpinnedNotes.length ? (
              <div className="note-list">{unpinnedNotes.map(renderNote)}</div>
            ) : notes.length === 0 ? (
              <p className="empty-state">Your notebook is ready for its first thought.</p>
            ) : (
              <p className="empty-state">Everything else is tucked away above.</p>
            )}
          </section>
        </section>
      </div>
      <footer className="app-footer">Made for the thoughts worth keeping.</footer>
    </main>
  );
}

export default App;
