const mongoose = require('mongoose');
const { FileRefSchema, emptyFileRef } = require('./schemas/fileRef');

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Project title is required'], trim: true, maxlength: 150 },
    // URL-friendly id, auto-generated from the title (unique, enforced in the controller)
    slug: { type: String, trim: true, lowercase: true, index: true },
    shortDescription: { type: String, default: '', trim: true, maxlength: 400 },
    fullDescription: { type: String, default: '', trim: true, maxlength: 6000 },
    // Free text so the owner can invent new categories (MERN, E-commerce, Admin Dashboard, ...)
    category: { type: String, default: 'MERN', trim: true, maxlength: 60 },
    techStack: { type: [String], default: [] },
    features: { type: [String], default: [] },
    thumbnail: { type: FileRefSchema, default: emptyFileRef },
    gallery: { type: [FileRefSchema], default: [] },
    githubUrl: { type: String, default: '', trim: true },
    liveUrl: { type: String, default: '', trim: true },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0, index: true },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', ProjectSchema);
