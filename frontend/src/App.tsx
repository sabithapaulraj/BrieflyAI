import React, { useState } from 'react';
import './App.css';

interface Status {
  type: 'success' | 'error' | 'loading' | null;
  message: string;
}

function App() {
  const [transcript, setTranscript] = useState('');
  const [instruction, setInstruction] = useState('');
  const [summary, setSummary] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientInput, setRecipientInput] = useState('');
  const [status, setStatus] = useState<Status>({ type: null, message: '' });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
      setStatus({ type: 'error', message: 'Please upload a .txt file' });
      return;
    }

    const formData = new FormData();
    formData.append('transcript', file);

    try {
      setStatus({ type: 'loading', message: 'Uploading file...' });
      const response = await fetch('/api/upload-transcript', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setTranscript(data.transcript);
        setStatus({ type: 'success', message: 'File uploaded successfully!' });
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to upload file' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to upload file' });
    }
  };

  const generateSummary = async () => {
    if (!transcript.trim() || !instruction.trim()) {
      setStatus({ type: 'error', message: 'Please provide both transcript and instruction' });
      return;
    }

    try {
      setStatus({ type: 'loading', message: 'Generating summary...' });
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript, instruction }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSummary(data.summary);
        setStatus({ type: 'success', message: 'Summary generated successfully!' });
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to generate summary' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to generate summary' });
    }
  };

  const addRecipient = () => {
    const email = recipientInput.trim();
    if (email && !recipients.includes(email)) {
      setRecipients([...recipients, email]);
      setRecipientInput('');
    }
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleRecipientKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addRecipient();
    }
  };

  const sendEmail = async () => {
    if (!summary.trim()) {
      setStatus({ type: 'error', message: 'Please generate a summary first' });
      return;
    }

    if (recipients.length === 0) {
      setStatus({ type: 'error', message: 'Please add at least one recipient' });
      return;
    }

    try {
      setStatus({ type: 'loading', message: 'Sending email...' });
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ summary, recipients }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatus({ type: 'success', message: 'Email sent successfully!' });
        setRecipients([]);
        setRecipientInput('');
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to send email' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to send email' });
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🤖 MangoDesk Meeting Summarizer</h1>
        <p>AI-powered meeting notes summarizer and sharer</p>
      </div>

      {status.type && (
        <div className={`status ${status.type}`}>
          {status.type === 'loading' && <span className="loading-spinner"></span>}
          <span>{status.message}</span>
        </div>
      )}

      {/* Transcript Input Section */}
      <div className="section">
        <h2>📝 Meeting Transcript</h2>
        <div className="form-group">
          <label htmlFor="file-input">Upload Transcript File (.txt)</label>
          <div className="file-upload" onClick={() => document.getElementById('file-input')?.click()}>
            <input
              id="file-input"
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
            />
            <p>Click to upload a .txt file or drag and drop</p>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="transcript-textarea">Or Paste Transcript Text</label>
          <textarea
            id="transcript-textarea"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your meeting transcript here..."
          />
        </div>
      </div>

      {/* Instruction Input Section */}
      <div className="section">
        <h2>🎯 Custom Instructions</h2>
        <div className="form-group">
          <label htmlFor="instruction-input">How would you like the summary formatted?</label>
          <input
            id="instruction-input"
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g., 'Summarize in bullet points for executives' or 'Highlight only action items'"
          />
        </div>
        <button 
          className="button" 
          onClick={generateSummary}
          disabled={!transcript.trim() || !instruction.trim()}
        >
          Generate Summary
        </button>
      </div>

      {/* Summary Section */}
      {summary && (
        <div className="section">
          <h2>📋 Generated Summary</h2>
          <div className="form-group">
            <label htmlFor="summary-textarea">Edit the summary if needed:</label>
            <textarea
              id="summary-textarea"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="AI-generated summary will appear here..."
            />
          </div>
        </div>
      )}

      {/* Email Section */}
      {summary && (
        <div className="section">
          <h2>📧 Share via Email</h2>
          <div className="form-group">
            <label htmlFor="recipient-input">Recipient Email Addresses</label>
            <div className="recipients-input">
              {recipients.map((email) => (
                <span key={email} className="recipient-tag">
                  {email}
                  <button aria-label={`Remove ${email}`} onClick={() => removeRecipient(email)}>×</button>
                </span>
              ))}
              <input
                id="recipient-input"
                type="email"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                onKeyPress={handleRecipientKeyPress}
                placeholder="Enter email address and press Enter or comma"
              />
            </div>
            <button 
              className="button secondary" 
              onClick={addRecipient}
              disabled={!recipientInput.trim()}
            >
              Add Recipient
            </button>
          </div>
          <button 
            className="button" 
            onClick={sendEmail}
            disabled={recipients.length === 0}
          >
            Send Email
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
