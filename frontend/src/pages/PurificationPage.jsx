import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EnhancedInputBox from '../components/EnhancedInputBox';
import EnhancedForgeButton from '../components/EnhancedForgeButton';
import AnimatedOutput from '../components/AnimatedOutput';
import { forgeAPI, savedAPI } from '../services/api';
import { FaFileAlt, FaLightbulb, FaSave, FaCheckCircle } from 'react-icons/fa';

function PurificationPage({ isAuthenticated }) {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  const purificationExamples = [
    {
      title: 'Rough Draft',
      text: 'this is a really messy text with lots of errors and bad grammar. it needs to be cleaned up and made better. the structure is poor and the spelling is wrong in many places.',
      preview: 'Messy text with grammar and spelling errors...'
    },
    {
      title: 'Unstructured Notes',
      text: 'meeting notes: discussed project timeline. budget concerns. need to hire more developers. deadline is tight. client wants changes.',
      preview: 'Unstructured meeting notes...'
    },
    {
      title: 'Poorly Written Content',
      text: 'The product is good but the marketing is bad. we need to improve. sales are down. customers are unhappy. we should do something.',
      preview: 'Poorly written business content...'
    }
  ];

  const handleForge = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setOutput(null);

    try {
      const result = await forgeAPI.transform(inputText, 'purification');
      setOutput(result);
    } catch (error) {
      console.error('Forge error:', error);
      alert('Failed to purify document. Please try again.');
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
        'purification'
      );
      alert('Saved to your library.');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save. Please try again.');
    }
  };

  return (
    <div className="page-container process-page purification-page">
      <div className="process-header">
        <div className="process-header-icon">
          <FaFileAlt />
        </div>
        <h1>Document Purification</h1>
        <p className="process-description-header">
          Clean and refine messy text with better grammar, clarity, and structure while maintaining a human tone.
        </p>
      </div>

      <div className="process-guidance">
        <div className="guidance-card">
          <FaLightbulb className="guidance-icon" />
          <div>
            <h3>What to Input</h3>
            <p>Paste any text that needs improvement: rough drafts, messy notes, poorly structured content, or text with grammar issues.</p>
            <ul>
              <li>Rough drafts</li>
              <li>Messy notes</li>
              <li>Unstructured text</li>
              <li>Grammar/spelling issues</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="purification-layout">
        <div className="purification-input-section">
          <EnhancedInputBox 
            value={inputText} 
            onChange={setInputText}
            placeholder="Paste your messy, unrefined, or poorly structured text here..."
            examples={purificationExamples}
            showSuggestions={true}
          />
        </div>

        <EnhancedForgeButton 
          onClick={handleForge} 
          loading={loading} 
          disabled={!inputText.trim()}
          mode="purification"
        />

        {output && output.results?.purification && (
          <div className="purification-output-section">
            <AnimatedOutput title="Refined Text">
              <div className="output-actions-top">
                {isAuthenticated && (
                  <button onClick={handleSave} className="save-button-process">
                    <FaSave /> Save This Forge
                  </button>
                )}
              </div>
              <div className="purified-text-display">
                {output.results.purification.cleaned_text}
              </div>
              {output.results.purification.improvements && output.results.purification.improvements.length > 0 && (
                <div className="improvements-list">
                  <h3>
                    <FaCheckCircle /> Improvements Made
                  </h3>
                  <ul>
                    {output.results.purification.improvements.map((improvement, idx) => (
                      <li key={idx}>{improvement}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AnimatedOutput>
          </div>
        )}
      </div>

      {loading && (
        <div className="loading">Purifying document...</div>
      )}
    </div>
  );
}

export default PurificationPage;

