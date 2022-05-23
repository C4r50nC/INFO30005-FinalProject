const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var PatientSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    screenName: {
      type: String,
      required: true,
      unique: true,
    },
    records: [
      {
        record: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Record',
          required: true,
        },
      },
    ],
    clinician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinician',
      required: true,
    },
    timeSeries: {
      bloodGlucoseLevel: { type: Boolean, default: false },
      weight: { type: Boolean, default: false },
      dosesInsulinTaken: { type: Boolean, default: false },
      exercise: { type: Boolean, default: false },
    },
    createdAt: { type: Date, default: null },
    supportMessage: { type: String, default: '' },
    notes: [
      {
        text: { type: String, required: true },
        createdAt: { type: String, required: true },
      },
    ],
    safetyLimits: {
      bloodGlucoseLevel: {
        min: { type: Number, default: null },
        max: { type: Number, default: null },
      },
      weight: {
        min: { type: Number, default: null },
        max: { type: Number, default: null },
      },
      dosesInsulinTaken: {
        min: { type: Number, default: null },
        max: { type: Number, default: null },
      },
      exercise: {
        min: { type: Number, default: null },
        max: { type: Number, default: null },
      },
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  },
);

module.exports = mongoose.model('Patient', PatientSchema);
