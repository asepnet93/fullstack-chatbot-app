import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleUploadClick = (acceptType) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = acceptType;
      fileInputRef.current.click();
    }
    setShowUploadOptions(false);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset input value
    }
  };

  const getFileEmoji = (file) => {
    if (!file) return '';
    const fileType = file.type;
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('audio/')) return '🎵';
    return '📄';
  };

const sendMessage = async () => {
  if (!inputMessage.trim() && !selectedFile) return;

  const userMessageText = selectedFile ? selectedFile.name : inputMessage;
  const userMessage = {
    text: userMessageText,
    sender: 'user',
    file: selectedFile,
  };
  setMessages(prev => [...prev, userMessage]);
  
  setInputMessage('');
  setLoading(true);

  try {
    let endpoint = '';
    let requestData;

    // BUAT CONVERSATION HISTORY
    const conversationHistory = messages.slice(-4).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    if (selectedFile) {
      const formData = new FormData();
      if (selectedFile.type.startsWith('image/')) {
        endpoint = '/api/analyze-image';
        formData.append('image', selectedFile);
        formData.append('prompt', inputMessage || 'Analisis gambar ini.');
        formData.append('history', JSON.stringify(conversationHistory)); // KIRIM HISTORY
      } else if (selectedFile.type.startsWith('audio/')) {
        endpoint = '/api/generate-from-audio';
        formData.append('audio', selectedFile);
        formData.append('prompt', inputMessage || 'Transkripsikan dan analisis audio ini.');
        formData.append('history', JSON.stringify(conversationHistory));
      } else {
        endpoint = '/api/generate-from-document';
        formData.append('document', selectedFile);
        formData.append('prompt', inputMessage || 'Analisis isi dokumen ini.');
        formData.append('history', JSON.stringify(conversationHistory));
      }
      requestData = formData;
    } else {
      endpoint = '/api/chat';
      requestData = { 
        prompt: inputMessage,
        history: conversationHistory // KIRIM HISTORY UNTUK CHAT BIASA
      };
    }

    const config = selectedFile 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : { headers: { 'Content-Type': 'application/json' } };

    const response = await axios.post(
      `http://localhost:3000${endpoint}`, 
      requestData, 
      config
    );

    const botText = response.data.response || 'Tidak ada respons dari server.';
    const botMessage = { text: botText, sender: 'bot' };
    setMessages(prev => [...prev, botMessage]);

  } catch (error) {
    console.error('🔴 Error:', error);
    // ... error handling
  } finally {
    setLoading(false);
    removeFile();
  }
};

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    removeFile();
  };

  // Component to render file preview
  const FilePreview = ({ file, onRemove }) => {
    if (!file) return null;

    const isImage = file.type.startsWith('image/');
    
    return (
      <div className="file-preview-section">
        <div className="file-preview-wrapper">
          {isImage ? (
            <div className="preview-image">
              <img src={URL.createObjectURL(file)} alt="Preview" />
            </div>
          ) : (
            <div className="preview-icon">{getFileEmoji(file)}</div>
          )}
          <div className="preview-details">
            <p className="preview-name">{file.name}</p>
            <p className="preview-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button onClick={onRemove} className="preview-remove" title="Remove file">
            &times;
          </button>
        </div>
      </div>
    );
  };
  
  // Welcome screen component
  const WelcomeScreen = () => (
    <div className="welcome-message">
      <h2>Selamat Datang!</h2>
      <p>Tanya apa saja atau unggah file untuk dianalisis oleh AI.</p>
      <div className="features">
        <div className="feature-item"><span>🖼️</span><strong>Gambar</strong></div>
        <div className="feature-item"><span>🎵</span><strong>Audio</strong></div>
        <div className="feature-item"><span>📄</span><strong>Dokumen</strong></div>
        <div className="feature-item"><span>💬</span><strong>Chat Teks</strong></div>
      </div>
    </div>
  );

  return (
    <div className="app">
      <div className="chat-container">
        <div className="header">
          <div className="header-content">
            <h1>🤖 AI Assistant</h1>
            <p>Analisis Teks, Gambar, Audio & Dokumen</p>
          </div>
          <button className="clear-btn" onClick={clearChat} title="Clear Chat">
            🗑️
          </button>
        </div>

        <div className="messages-container">
          {messages.length === 0 && !loading && <WelcomeScreen />}
          {messages.map((msg, index) => (
            <div key={index} className={`message-wrapper ${msg.sender}`}>
              <div className={`message ${msg.sender}`}>{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div className="message-wrapper bot">
              <div className="message bot loading">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <FilePreview file={selectedFile} onRemove={removeFile} />
        
        <div className="input-section">
          {showUploadOptions && (
            <div className="upload-options-menu">
              <button className="upload-option-btn" onClick={() => handleUploadClick('image/*')}>
                <span>🖼️</span> Gambar
              </button>
              <button className="upload-option-btn" onClick={() => handleUploadClick('audio/*')}>
                <span>🎵</span> Audio
              </button>
              <button className="upload-option-btn" onClick={() => handleUploadClick('.pdf,.doc,.docx,.txt')}>
                <span>📄</span> Dokumen
              </button>
            </div>
          )}
          <div className="input-container">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <button
              className="file-attach-btn"
              onClick={() => setShowUploadOptions(!showUploadOptions)}
              disabled={loading}
              title="Attach a file"
            >
              📎
            </button>
            <input
              type="text"
              className="message-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedFile ? "Tambahkan deskripsi untuk file..." : "Ketik pesan Anda..."}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || (!inputMessage.trim() && !selectedFile)}
              className="send-btn"
              title="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;