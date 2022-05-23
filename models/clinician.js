const mongoose = require('mongoose');

const clinicianSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    screenName: { type: String, required: true, unique: true },
    patients: [
      {
        patient: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Patient',
          required: true,
        },
      },
    ],
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
  },
  {
    timestamps: true,
  },
);

const Clinician = mongoose.model('Clinician', clinicianSchema);
module.exports = Clinician;
