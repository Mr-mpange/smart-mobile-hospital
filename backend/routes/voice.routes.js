const express = require('express');
const VoiceController = require('../controllers/voice.controller');

const router = express.Router();

/**
 * Voice Routes
 * Webhook endpoints for Twilio/Africa's Talking Voice API
 */

// Incoming call webhook
router.post('/incoming', VoiceController.handleIncoming);

// Menu selection
router.post('/menu', VoiceController.handleMenu);

// Doctor selection
router.post('/select-doctor', VoiceController.handleDoctorSelection);

// Process symptoms recording
router.post('/process-symptoms', VoiceController.processSymptoms);

// Wait for doctor
router.post('/wait-for-doctor', VoiceController.waitForDoctor);

// Call completed
router.post('/call-completed', VoiceController.handleCallCompleted);

// Call status updates
router.post('/call-status', VoiceController.handleCallStatus);

// Transcription callback
router.post('/transcription', VoiceController.handleTranscription);

// Doctor call webhook
router.post('/doctor-call', VoiceController.handleDoctorCall);

// Doctor response
router.post('/doctor-response', VoiceController.handleDoctorResponse);

// Doctor call status
router.post('/doctor-call-status', VoiceController.handleDoctorCallStatus);

// Doctor answered callback
router.post('/doctor-answered', VoiceController.handleDoctorAnswered);

module.exports = router;
