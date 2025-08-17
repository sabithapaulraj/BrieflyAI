const request = require('supertest');
const express = require('express');

// Mock external dependencies before importing server
jest.mock('@google/generative-ai');
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  })
}));

// Mock environment variables
process.env.GEMINI_API_KEY = 'test-api-key';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'test-password';

// Import the app after mocking
const app = require('../server');

describe('MangoDesk Meeting Summarizer API', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0); // Use random port for testing
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'OK',
        message: 'MangoDesk Meeting Summarizer API is running'
      });
    });
  });

  describe('POST /api/generate-summary', () => {
    beforeEach(() => {
      // Mock Google Generative AI
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => 'Mocked AI summary response'
          }
        })
      };
      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue(mockModel)
      };
      GoogleGenerativeAI.mockImplementation(() => mockGenAI);
    });

    it('should generate summary with valid input', async () => {
      const testData = {
        transcript: 'This is a test meeting transcript.',
        instruction: 'Summarize in bullet points'
      };

      const response = await request(app)
        .post('/api/generate-summary')
        .send(testData)
        .expect(200);

      expect(response.body).toHaveProperty('summary');
      expect(response.body.summary).toBe('Mocked AI summary response');
    });

    it('should return 400 when transcript is missing', async () => {
      const testData = {
        instruction: 'Summarize in bullet points'
      };

      const response = await request(app)
        .post('/api/generate-summary')
        .send(testData)
        .expect(400);

      expect(response.body.error).toBe('Transcript and instruction are required');
    });

    it('should return 400 when instruction is missing', async () => {
      const testData = {
        transcript: 'This is a test meeting transcript.'
      };

      const response = await request(app)
        .post('/api/generate-summary')
        .send(testData)
        .expect(400);

      expect(response.body.error).toBe('Transcript and instruction are required');
    });

    it('should return 500 when Gemini API key is not configured', async () => {
      // Temporarily remove API key
      const originalKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      const testData = {
        transcript: 'This is a test meeting transcript.',
        instruction: 'Summarize in bullet points'
      };

      const response = await request(app)
        .post('/api/generate-summary')
        .send(testData)
        .expect(500);

      expect(response.body.error).toBe('Gemini API key not configured');

      // Restore API key
      if (originalKey) {
        process.env.GEMINI_API_KEY = originalKey;
      }
    });
  });

  describe('POST /api/send-email', () => {
    it('should send email with valid data', async () => {
      const testData = {
        summary: 'This is a test summary.',
        recipients: ['test@example.com']
      };

      const response = await request(app)
        .post('/api/send-email')
        .send(testData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Email sent successfully');
    });

    it('should return 400 when summary is missing', async () => {
      const testData = {
        recipients: ['test@example.com']
      };

      const response = await request(app)
        .post('/api/send-email')
        .send(testData)
        .expect(400);

      expect(response.body.error).toBe('Summary and at least one recipient email are required');
    });

    it('should return 400 when recipients array is empty', async () => {
      const testData = {
        summary: 'This is a test summary.',
        recipients: []
      };

      const response = await request(app)
        .post('/api/send-email')
        .send(testData)
        .expect(400);

      expect(response.body.error).toBe('Summary and at least one recipient email are required');
    });

    it('should return 400 when recipients is not an array', async () => {
      const testData = {
        summary: 'This is a test summary.',
        recipients: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/send-email')
        .send(testData)
        .expect(400);

      expect(response.body.error).toBe('Summary and at least one recipient email are required');
    });

    it('should return 500 when email configuration is missing', async () => {
      // Temporarily remove email config
      const originalUser = process.env.EMAIL_USER;
      const originalPass = process.env.EMAIL_PASS;
      delete process.env.EMAIL_USER;
      delete process.env.EMAIL_PASS;

      const testData = {
        summary: 'This is a test summary.',
        recipients: ['test@example.com']
      };

      const response = await request(app)
        .post('/api/send-email')
        .send(testData)
        .expect(500);

      expect(response.body.error).toBe('Email configuration not set up');

      // Restore email config
      if (originalUser) process.env.EMAIL_USER = originalUser;
      if (originalPass) process.env.EMAIL_PASS = originalPass;
    });
  });

  describe('POST /api/upload-transcript', () => {
    it('should upload and process .txt file', async () => {
      const testContent = 'This is a test transcript content.';
      
      const response = await request(app)
        .post('/api/upload-transcript')
        .attach('transcript', Buffer.from(testContent), {
          filename: 'test-transcript.txt',
          contentType: 'text/plain'
        })
        .expect(200);

      expect(response.body).toHaveProperty('transcript');
      expect(response.body.transcript).toBe(testContent);
    });

    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app)
        .post('/api/upload-transcript')
        .expect(400);

      expect(response.body.error).toBe('No file uploaded');
    });

    it('should reject non-text files', async () => {
      const response = await request(app)
        .post('/api/upload-transcript')
        .attach('transcript', Buffer.from('test content'), {
          filename: 'test.pdf',
          contentType: 'application/pdf'
        })
        .expect(400);

      expect(response.body.error).toBe('Only .txt files are allowed');
    });
  });

  describe('Error handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/generate-summary')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });

    it('should handle missing routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });
  });
});
