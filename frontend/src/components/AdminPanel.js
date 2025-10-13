import React, { useState } from 'react';
import { authAPI } from '../services/api';
import '../styles/AdminPanel.css';

const AdminPanel = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const showMessage = (msg, type = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleTriggerAgents = async () => {
    setLoading(true);
    try {
      const result = await authAPI.triggerAgents();
      showMessage(`✅ ${result.message}`, 'success');
    } catch (error) {
      showMessage(`❌ Error: ${error.response?.data?.detail || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerEventCollection = async () => {
    setLoading(true);
    try {
      const result = await authAPI.triggerEventCollection();
      showMessage(`✅ ${result.message}`, 'success');
    } catch (error) {
      showMessage(`❌ Error: ${error.response?.data?.detail || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerNLPProcessing = async () => {
    setLoading(true);
    try {
      const result = await authAPI.triggerNLPProcessing();
      showMessage(`✅ ${result.message}`, 'success');
    } catch (error) {
      showMessage(`❌ Error: ${error.response?.data?.detail || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>🤖 Agent Control Panel</h2>
        <p>Manually trigger AI agents for event collection and processing</p>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="agent-controls">
        <div className="control-group">
          <h3>🎯 Event Collector Agent</h3>
          <p>Collects new events from various sources</p>
          <button 
            className="btn btn-primary"
            onClick={handleTriggerEventCollection}
            disabled={loading}
          >
            {loading ? '⏳ Running...' : '🔄 Run Event Collector'}
          </button>
        </div>

        <div className="control-group">
          <h3>🧠 NLP Agent</h3>
          <p>Processes and enriches event data</p>
          <button 
            className="btn btn-primary"
            onClick={handleTriggerNLPProcessing}
            disabled={loading}
          >
            {loading ? '⏳ Running...' : '🔄 Run NLP Agent'}
          </button>
        </div>

        <div className="control-group">
          <h3>🚀 Run Both Agents</h3>
          <p>Execute Event Collector followed by NLP processing</p>
          <button 
            className="btn btn-success"
            onClick={handleTriggerAgents}
            disabled={loading}
          >
            {loading ? '⏳ Running...' : '🚀 Run All Agents'}
          </button>
        </div>
      </div>

      <div className="admin-info">
        <h4>ℹ️ Information</h4>
        <ul>
          <li><strong>Event Collector:</strong> Searches for new events and adds them to the database</li>
          <li><strong>NLP Agent:</strong> Processes events to add summaries, tags, and sentiment analysis</li>
          <li><strong>Run All:</strong> Executes both agents in sequence for complete processing</li>
          <li><strong>Note:</strong> These operations may take a few minutes to complete</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminPanel;
