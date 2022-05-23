const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    // 'YYYY-MM-DD'
    recordDate: { type: String, required: true },
    data: {
      bloodGlucoseLevel: {
        fullName: {
          type: String,
          default: 'blood glucose level',
          immutable: true,
        },
        status: {
          type: String,
          enum: ['recorded', 'unrecorded', 'no need'],
          default: 'unrecorded',
        },
        value: { type: Number, default: 0 },
        comment: { type: String, default: '' },
        submittedAt: { type: String, default: null },
        submittedAtTs: { type: Number, default: 0 },
      },
      weight: {
        fullName: { type: String, default: 'weight', immutable: true },
        status: {
          type: String,
          enum: ['recorded', 'unrecorded', 'no need'],
          default: 'unrecorded',
        },
        value: { type: Number, default: 0 },
        comment: { type: String, default: '' },
        submittedAt: { type: String, default: null },
        submittedAtTs: { type: Number, default: 0 },
      },
      dosesInsulinTaken: {
        fullName: {
          type: String,
          default: 'doses of insulin taken',
          immutable: true,
        },
        status: {
          type: String,
          enum: ['recorded', 'unrecorded', 'no need'],
          default: 'unrecorded',
        },
        value: { type: Number, default: 0 },
        comment: { type: String, default: '' },
        submittedAt: { type: String, default: null },
        submittedAtTs: { type: Number, default: 0 },
      },
      exercise: {
        fullName: { type: String, default: 'exercise', immutable: true },
        status: {
          type: String,
          enum: ['recorded', 'unrecorded', 'no need'],
          default: 'unrecorded',
        },
        value: { type: Number, default: 0 },
        comment: { type: String, default: '' },
        submittedAt: { type: String, default: null },
        submittedAtTs: { type: Number, default: 0 },
      },
    },
  },
  {
    timestamps: true,
  },
);

const Record = mongoose.model('Record', recordSchema);
module.exports = Record;
