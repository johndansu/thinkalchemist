import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkspaceLayout from '../components/WorkspaceLayout';
import InteractiveInput from '../components/InteractiveInput';
import InteractiveOutput from '../components/InteractiveOutput';
import EnhancedForgeButton from '../components/EnhancedForgeButton';
import PersonaCard from '../components/PersonaCard';
import { forgeAPI, savedAPI } from '../services/api';
import { FaUsers, FaSave } from 'react-icons/fa';

function PersonasPage({ isAuthenticated }) {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  const personasExamples = [
    {
      title: 'Mobile App Idea',
      text: 'A mobile app that helps people track their daily water intake with reminders and gamification features.',
      preview: 'Mobile app for water intake tracking...',
      category: 'Mobile'
    },
    {
      title: 'E-commerce Feature',
      text: 'A new feature for an online marketplace that allows sellers to create virtual storefronts with customizable themes.',
      preview: 'E-commerce virtual storefront feature...',
      category: 'E-commerce'
    },
    {
      title: 'SaaS Product',
      text: 'A project management tool designed specifically for remote teams with built-in video conferencing and collaborative whiteboards.',
      preview: 'Project management tool for remote teams...',
      category: 'SaaS'
    }
  ];

  const handleForge = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setOutput(null);

    try {
      const result = await forgeAPI.transform(inputText, 'personas');
      setOutput(result);
    } catch (error) {
      console.error('Forge error:', error);
      alert('Failed to forge personas. Please try again.');
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
        'personas'
      );
      alert('Saved to your library.');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save. Please try again.');
    }
  };

  const inputSection = (
    <>
      <InteractiveInput 
        value={inputText} 
        onChange={setInputText}
        placeholder="Describe your product idea, feature request, or business concept. The more detail, the better the personas..."
        examples={personasExamples}
        showTemplates={true}
      />
      <div style={{ marginTop: '1.5rem' }}>
        <EnhancedForgeButton 
          onClick={handleForge} 
          loading={loading} 
          disabled={!inputText.trim()}
          mode="personas"
        />
      </div>
    </>
  );

  const outputSection = output && output.results?.personas ? (
    <InteractiveOutput
      title="Generated Personas"
      type="personas"
      onSave={isAuthenticated ? handleSave : null}
      onCopy={() => {
        const personasText = output.results.personas.personas
          .map(p => `${p.name}: ${p.quote || p.description || ''}`)
          .join('\n\n');
        return personasText;
      }}
      metadata={{
        timestamp: output.timestamp,
        stats: {
          personas: output.results.personas.personas?.length || 0
        }
      }}
    >
      <div className="personas-grid">
        {output.results.personas.personas?.map((persona, idx) => (
          <PersonaCard key={idx} persona={persona} />
        ))}
      </div>
    </InteractiveOutput>
  ) : null;

  return (
    <div className="page-container process-page personas-page workspace-page">
      <div className="process-header">
        <div className="process-header-icon">
          <FaUsers />
        </div>
        <h1>Personas & User Insight Simulation</h1>
        <p className="process-description-header">
          Generate fictional user personas with pain points, preferences, and honest feedback for your product ideas.
        </p>
      </div>

      <WorkspaceLayout
        inputSection={inputSection}
        outputSection={outputSection}
        loading={loading}
        mode="split"
      />
    </div>
  );
}

export default PersonasPage;

