import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import InputBox from '../components/InputBox';
import ForgeButton from '../components/ForgeButton';
import OutputDisplay from '../components/OutputDisplay';
import { forgeAPI, savedAPI } from '../services/api';

function HomePage({ isAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Handle re-forge from navigation state
    if (location.state?.inputText) {
      const input = location.state.inputText;
      const shouldAutoForge = location.state?.autoForge;
      setInputText(input);
      // Clear the state to avoid re-triggering
      navigate(location.pathname, { replace: true, state: {} });
      // Auto-trigger forge if coming from re-forge
      if (shouldAutoForge && input.trim()) {
        setTimeout(async () => {
          setLoading(true);
          setOutput(null);
          try {
            const result = await forgeAPI.transform(input);
            setOutput(result);
          } catch (error) {
            console.error('Forge error:', error);
            alert('Failed to forge. Please try again.');
          } finally {
            setLoading(false);
          }
        }, 100);
      }
    }
  }, [location, navigate]);

  const handleForge = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setOutput(null);

    try {
      const result = await forgeAPI.transform(inputText);
      setOutput(result);
    } catch (error) {
      console.error('Forge error:', error);
      alert('Failed to forge. Please try again.');
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
      const primaryMode = output.classification?.suggested_modes?.[0] || 'mixed';
      
      await savedAPI.save(
        title,
        inputText,
        output,
        primaryMode
      );
      
      alert('Saved to your library.');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save. Please try again.');
    }
  };

  return (
    <div className="page-container">
      <InputBox value={inputText} onChange={setInputText} />
      
      <ForgeButton onClick={handleForge} loading={loading} disabled={!inputText.trim()} />

      {output && <OutputDisplay output={output} onSave={handleSave} />}
    </div>
  );
}

export default HomePage;

