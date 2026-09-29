import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const res = await axios.get('http://localhost:5000/api/notes');
    setNotes(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return alert("Both fields are required");
    await axios.post('http://localhost:5000/api/notes', { title, content });
    setTitle('');
    setContent('');
    fetchNotes();
  };

  const togglePin = async (note) => {
    const res = await axios.patch(`http://localhost:5000/api/notes/${note._id}/pin`, {
      pinned: !note.pinned,
    });
    setNotes((currentNotes) =>
      currentNotes.map((currentNote) =>
        currentNote._id === note._id ? res.data : currentNote
      )
    );
  };

  const pinnedNotes = notes.filter((note) => note.pinned);
  const unpinnedNotes = notes.filter((note) => !note.pinned);

  const renderNote = (note) => (
    <article className={`note-card${note.pinned ? ' note-card-pinned' : ''}`} key={note._id}>
      <div className="note-card-heading">
        <h3>{note.title}</h3>
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
      </header>

      <div className="workspace">
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
