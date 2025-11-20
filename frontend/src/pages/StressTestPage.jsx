import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputBox from '../components/InputBox';
import ForgeButton from '../components/ForgeButton';
import { forgeAPI, savedAPI } from '../services/api';
import { FaSearch, FaLightbulb, FaSave, FaArrowUp, FaArrowDown, FaExclamationTriangle, FaRocket } from 'react-icons/fa';

function StressTestPage({ isAuthenticated }) {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleForge = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setOutput(null);

    try {
      const result = await forgeAPI.transform(inputText, 'stress_test');
      setOutput(result);
    } catch (error) {
      console.error('Forge error:', error);
      alert('Failed to stress test idea. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (!output) return;

    try {
      const title = inputText.substring(0, 50) + (inputText.length > 50 ? '...' : '');
      await savedAPI.save(
        title,
        inputText,
        output,
        'stress_test'
      );
      alert('Saved to your library.');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save. Please try again.');
    }
  };

  return (
    <div className="page-container process-page stress-test-page">
      <div className="process-header">
        <div className="process-header-icon">
          <FaSearch />
        </div>
        <h1>Idea Stress Test Engine</h1>
        <p className="process-description-header">
          Get a reality check on your ideas with best-case scenarios, risks, and improvement suggestions.
        </p>
      </div>

      <div className="process-guidance">
        <div className="guidance-card">
          <FaLightbulb className="guidance-icon" />
          <div>
            <h3>What to Input</h3>
            <p>Describe your business idea, product concept, or strategic plan. Be as detailed as possible for a thorough analysis.</p>
            <ul>
              <li>Business ideas</li>
              <li>Product concepts</li>
              <li>Strategic plans</li>
              <li>Startup pitches</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="process-input-section">
        <label className="process-input-label">Describe Your Idea</label>
        <InputBox 
          value={inputText} 
          onChange={setInputText}
          placeholder="Example: A subscription service that delivers personalized meal plans based on dietary restrictions and preferences..."
        />
      </div>

      <ForgeButton onClick={handleForge} loading={loading} disabled={!inputText.trim()} />

      {output && output.results?.stressTest && (
        <div className="process-output-section">
          <div className="output-header">
            <h2>Reality Check Results</h2>
            {isAuthenticated && (
              <button onClick={handleSave} className="save-button-process">
                <FaSave /> Save This Forge
              </button>
            )}
          </div>
          
          <div className="stress-test-results">
            <div className="stress-test-card best-case">
              <div className="stress-test-header">
                <FaArrowUp className="stress-test-icon" />
                <h3>Best Case Scenario</h3>
              </div>
              <p>{output.results.stressTest.best_case}</p>
            </div>

            <div className="stress-test-card worst-case">
              <div className="stress-test-header">
                <FaArrowDown className="stress-test-icon" />
                <h3>Worst Case Scenario</h3>
              </div>
              <p>{output.results.stressTest.worst_case}</p>
            </div>

            <div className="stress-test-card pitch">
              <div className="stress-test-header">
                <FaRocket className="stress-test-icon" />
                <h3>One-Line Pitch</h3>
              </div>
              <p className="pitch-text">{output.results.stressTest.one_line_pitch}</p>
            </div>

            {output.results.stressTest.hidden_risks && output.results.stressTest.hidden_risks.length > 0 && (
              <div className="stress-test-card risks">
                <div className="stress-test-header">
                  <FaExclamationTriangle className="stress-test-icon" />
                  <h3>Hidden Risks</h3>
                </div>
                <ul>
                  {output.results.stressTest.hidden_risks.map((risk, idx) => (
                    <li key={idx}>{risk}</li>
                  ))}
                </ul>
              </div>
            )}

            {output.results.stressTest.improvement_suggestion && (
              <div className="stress-test-card improvement">
                <div className="stress-test-header">
                  <FaRocket className="stress-test-icon" />
                  <h3>10× Improvement Suggestion</h3>
                </div>
                <p>{output.results.stressTest.improvement_suggestion}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="loading">Stress testing your idea...</div>
      )}
    </div>
  );
}

export default StressTestPage;

