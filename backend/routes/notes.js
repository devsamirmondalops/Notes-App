const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

// POST - create new note
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    const newNote = new Note({ title, content });
    await newNote.save();
    res.status(201).json(newNote);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET - retrieve all notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find();
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
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { pinned: req.body.pinned },
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
