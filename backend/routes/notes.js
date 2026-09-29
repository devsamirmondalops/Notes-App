const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);

// POST - create new note
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    const newNote = new Note({ title, content, user: req.user.id });
    await newNote.save();
    res.status(201).json(newNote);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET - retrieve all notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH - update a note's pinned state
router.patch('/:id/pin', async (req, res) => {
  try {
    if (typeof req.body.pinned !== 'boolean') {
      return res.status(400).json({ error: 'Pinned state must be a boolean' });
    }
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { pinned: req.body.pinned },
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH - update a note's completion state
router.patch('/:id/complete', async (req, res) => {
  try {
    if (typeof req.body.completed !== 'boolean') {
      return res.status(400).json({ error: 'Completion state must be a boolean' });
    }
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { completed: req.body.completed },
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE - remove a note owned by the current user
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
