// Utility function tests that don't require external dependencies

describe('Utility Functions', () => {
  describe('Email validation', () => {
    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Additional check for consecutive dots
      return emailRegex.test(email) && !email.includes('..');
    };

    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test..test@example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('File validation', () => {
    const isValidTextFile = (filename, mimetype) => {
      const validExtensions = ['.txt'];
      const validMimeTypes = ['text/plain', 'application/octet-stream'];
      
      const hasValidExtension = validExtensions.some(ext => 
        filename.toLowerCase().endsWith(ext)
      );
      const hasValidMimeType = validMimeTypes.includes(mimetype);
      
      return hasValidExtension || hasValidMimeType;
    };

    it('should validate correct text files', () => {
      expect(isValidTextFile('document.txt', 'text/plain')).toBe(true);
      expect(isValidTextFile('meeting-notes.txt', 'application/octet-stream')).toBe(true);
      expect(isValidTextFile('TRANSCRIPT.TXT', 'text/plain')).toBe(true);
    });

    it('should reject invalid file types', () => {
      expect(isValidTextFile('document.pdf', 'application/pdf')).toBe(false);
      expect(isValidTextFile('image.jpg', 'image/jpeg')).toBe(false);
      expect(isValidTextFile('document.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe(false);
    });
  });

  describe('Input sanitization', () => {
    const sanitizeInput = (input) => {
      if (typeof input !== 'string') return '';
      return input.trim().replace(/[<>]/g, '');
    };

    it('should sanitize user input', () => {
      expect(sanitizeInput('  test input  ')).toBe('test input');
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeInput('normal text')).toBe('normal text');
    });

    it('should handle non-string inputs', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
      expect(sanitizeInput(123)).toBe('');
      expect(sanitizeInput({})).toBe('');
    });
  });

  describe('Array validation', () => {
    const isValidRecipientsArray = (recipients) => {
      return Array.isArray(recipients) && 
             recipients.length > 0 && 
             recipients.every(email => typeof email === 'string' && email.trim().length > 0);
    };

    it('should validate correct recipients arrays', () => {
      expect(isValidRecipientsArray(['test@example.com'])).toBe(true);
      expect(isValidRecipientsArray(['user1@test.com', 'user2@test.com'])).toBe(true);
    });

    it('should reject invalid recipients arrays', () => {
      expect(isValidRecipientsArray([])).toBe(false);
      expect(isValidRecipientsArray([''])).toBe(false);
      expect(isValidRecipientsArray(['test@example.com', ''])).toBe(false);
      expect(isValidRecipientsArray('not-an-array')).toBe(false);
      expect(isValidRecipientsArray(null)).toBe(false);
    });
  });

  describe('String length validation', () => {
    const isValidLength = (str, minLength = 1, maxLength = 10000) => {
      if (typeof str !== 'string') return false;
      const length = str.trim().length;
      return length >= minLength && length <= maxLength;
    };

    it('should validate string lengths', () => {
      expect(isValidLength('test', 1, 10)).toBe(true);
      expect(isValidLength('a', 1, 10)).toBe(true);
      expect(isValidLength('', 1, 10)).toBe(false);
      expect(isValidLength('very long string that exceeds limit', 1, 10)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidLength(null)).toBe(false);
      expect(isValidLength(undefined)).toBe(false);
      expect(isValidLength(123)).toBe(false);
    });
  });

  describe('Transcript processing', () => {
    const processTranscript = (transcript) => {
      if (!transcript || typeof transcript !== 'string') return '';
      return transcript.trim().replace(/\s+/g, ' ');
    };

    it('should process transcript text', () => {
      expect(processTranscript('  Hello   world  ')).toBe('Hello world');
      expect(processTranscript('Meeting\n\nnotes')).toBe('Meeting notes');
      expect(processTranscript('')).toBe('');
    });

    it('should handle invalid inputs', () => {
      expect(processTranscript(null)).toBe('');
      expect(processTranscript(undefined)).toBe('');
      expect(processTranscript(123)).toBe('');
    });
  });

  describe('Summary formatting', () => {
    const formatSummary = (summary) => {
      if (!summary || typeof summary !== 'string') return '';
      return summary.trim().replace(/\n{3,}/g, '\n\n');
    };

    it('should format summary text', () => {
      expect(formatSummary('  Summary  ')).toBe('Summary');
      expect(formatSummary('Line 1\n\n\n\nLine 2')).toBe('Line 1\n\nLine 2');
    });

    it('should handle invalid inputs', () => {
      expect(formatSummary(null)).toBe('');
      expect(formatSummary(undefined)).toBe('');
      expect(formatSummary(123)).toBe('');
    });
  });
});
