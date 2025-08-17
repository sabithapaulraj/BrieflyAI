import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock fetch globally
global.fetch = jest.fn();

describe('MangoDesk Meeting Summarizer App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial render', () => {
    it('should render the main heading', () => {
      render(<App />);
      expect(screen.getByText('🤖 MangoDesk Meeting Summarizer')).toBeInTheDocument();
    });

    it('should render the subtitle', () => {
      render(<App />);
      expect(screen.getByText('AI-powered meeting notes summarizer and sharer')).toBeInTheDocument();
    });

    it('should render all main sections', () => {
      render(<App />);
      expect(screen.getByText('📝 Meeting Transcript')).toBeInTheDocument();
      expect(screen.getByText('🎯 Custom Instructions')).toBeInTheDocument();
    });
  });

  describe('Transcript input', () => {
    it('should allow typing in transcript textarea', () => {
      render(<App />);
      const textarea = screen.getByPlaceholderText('Paste your meeting transcript here...');
      fireEvent.change(textarea, { target: { value: 'Test transcript content' } });
      expect(textarea).toHaveValue('Test transcript content');
    });

    it('should handle file upload', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ transcript: 'Uploaded file content' })
      });

      render(<App />);
      
      const file = new File(['Test file content'], 'test.txt', { type: 'text/plain' });
      const fileInput = screen.getByLabelText('Upload Transcript File (.txt)');
      fireEvent.change(fileInput, { target: { files: [file] } });
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/upload-transcript', {
          method: 'POST',
          body: expect.any(FormData)
        });
      });
    });
  });

  describe('Custom instructions', () => {
    it('should allow typing in instruction input', () => {
      render(<App />);
      const input = screen.getByPlaceholderText(/Summarize in bullet points/);
      fireEvent.change(input, { target: { value: 'Test instruction' } });
      expect(input).toHaveValue('Test instruction');
    });
  });

  describe('Generate summary', () => {
    it('should be disabled when transcript and instruction are empty', () => {
      render(<App />);
      const button = screen.getByText('Generate Summary');
      expect(button).toBeDisabled();
    });

    it('should be enabled when both transcript and instruction are provided', () => {
      render(<App />);
      
      const textarea = screen.getByPlaceholderText('Paste your meeting transcript here...');
      const input = screen.getByPlaceholderText(/Summarize in bullet points/);
      
      fireEvent.change(textarea, { target: { value: 'Test transcript' } });
      fireEvent.change(input, { target: { value: 'Test instruction' } });
      
      const button = screen.getByText('Generate Summary');
      expect(button).not.toBeDisabled();
    });

    it('should call API and display summary on success', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ summary: 'Generated summary content' })
      });

      render(<App />);
      
      const textarea = screen.getByPlaceholderText('Paste your meeting transcript here...');
      const input = screen.getByPlaceholderText(/Summarize in bullet points/);
      const button = screen.getByText('Generate Summary');
      
      fireEvent.change(textarea, { target: { value: 'Test transcript' } });
      fireEvent.change(input, { target: { value: 'Test instruction' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/generate-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: 'Test transcript',
            instruction: 'Test instruction'
          })
        });
      });

      await waitFor(() => {
        expect(screen.getByText('📋 Generated Summary')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Generated summary content')).toBeInTheDocument();
      });
    });

    it('should show error message on API failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'API Error' })
      });

      render(<App />);
      const textarea = screen.getByPlaceholderText('Paste your meeting transcript here...');
      const input = screen.getByPlaceholderText(/Summarize in bullet points/);
      const button = screen.getByText('Generate Summary');
      fireEvent.change(textarea, { target: { value: 'Test transcript' } });
      fireEvent.change(input, { target: { value: 'Test instruction' } });
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText(/API Error/i)).toBeInTheDocument();
      });
    });

    it('should show error for missing transcript and instruction', async () => {
      render(<App />);
      const button = screen.getByText('Generate Summary');
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText(/Please provide both transcript and instruction/i)).toBeInTheDocument();
      });
    });
  });

  describe('Email functionality', () => {
    beforeEach(() => {
      // Mock successful summary generation
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ summary: 'Generated summary content' })
      });
    });

    it('should show email section after summary is generated', async () => {
      render(<App />);
      
      const textarea = screen.getByPlaceholderText('Paste your meeting transcript here...');
      const input = screen.getByPlaceholderText(/Summarize in bullet points/);
      const button = screen.getByText('Generate Summary');
      
      fireEvent.change(textarea, { target: { value: 'Test transcript' } });
      fireEvent.change(input, { target: { value: 'Test instruction' } });
      fireEvent.click(button);

  expect(await screen.findByText('📧 Share via Email')).toBeInTheDocument();
    });

    it('should add recipient email', async () => {
      render(<App />);
      
      // Generate summary first
      const textarea = screen.getByPlaceholderText('Paste your meeting transcript here...');
      const input = screen.getByPlaceholderText(/Summarize in bullet points/);
      const generateButton = screen.getByText('Generate Summary');
      
      fireEvent.change(textarea, { target: { value: 'Test transcript' } });
      fireEvent.change(input, { target: { value: 'Test instruction' } });
      fireEvent.click(generateButton);

  const emailInput = await screen.findByPlaceholderText('Enter email address and press Enter or comma');
  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  fireEvent.keyDown(emailInput, { key: 'Enter', code: 'Enter' });
  await waitFor(() => {
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });
    });

    it('should remove recipient email', async () => {
      render(<App />);
      
      // Generate summary first
      const textarea = screen.getByPlaceholderText('Paste your meeting transcript here...');
      const input = screen.getByPlaceholderText(/Summarize in bullet points/);
      const generateButton = screen.getByText('Generate Summary');
      
      fireEvent.change(textarea, { target: { value: 'Test transcript' } });
      fireEvent.change(input, { target: { value: 'Test instruction' } });
      fireEvent.click(generateButton);

      const emailInput = await screen.findByPlaceholderText('Enter email address and press Enter or comma');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.keyDown(emailInput, { key: 'Enter', code: 'Enter' });
      await waitFor(() => {
        const removeButton = screen.getByText('×');
        fireEvent.click(removeButton);
        expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();
      });
    });

    it('should send email successfully', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ summary: 'Generated summary content' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, message: 'Email sent successfully' })
        });

      render(<App />);
      
      // Generate summary
      const textarea = screen.getByPlaceholderText('Paste your meeting transcript here...');
      const input = screen.getByPlaceholderText(/Summarize in bullet points/);
      const generateButton = screen.getByText('Generate Summary');
      
      fireEvent.change(textarea, { target: { value: 'Test transcript' } });
      fireEvent.change(input, { target: { value: 'Test instruction' } });
      fireEvent.click(generateButton);

      const emailInput = await screen.findByPlaceholderText('Enter email address and press Enter or comma');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.keyDown(emailInput, { key: 'Enter', code: 'Enter' });
      const sendButton = await screen.findByText('Send Email');
      fireEvent.click(sendButton);
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summary: 'Generated summary content',
            recipients: ['test@example.com']
          })
        });
        expect(screen.getByText('Email sent successfully')).toBeInTheDocument();
      });
    });
  });

  describe('Error handling', () => {
    it('should show error for invalid file type', async () => {
      render(<App />);
      
  const file = new File(['Test content'], 'test.pdf', { type: 'application/pdf' });
  const fileInput = screen.getByLabelText('Upload Transcript File (.txt)');
  fireEvent.change(fileInput, { target: { files: [file] } });
  expect(await screen.findByText('Please upload a .txt file')).toBeInTheDocument();
    });

    it('should show error for missing transcript and instruction', async () => {
      render(<App />);
      const button = screen.getByText('Generate Summary');
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText(/Please provide both transcript and instruction/i)).toBeInTheDocument();
      });
    });
  });
});
