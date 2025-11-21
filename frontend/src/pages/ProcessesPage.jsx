import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaFileAlt, 
  FaSearch, 
  FaGlobe 
} from 'react-icons/fa';

function ProcessesPage() {
  const processes = [
    {
      id: 'personas',
      icon: <FaUsers />,
      title: 'Personas & User Insight Simulation',
      description: 'Generate fictional user personas with pain points, preferences, and honest feedback for your product ideas.',
      useCase: 'Perfect for product concepts, business ideas, and feature requests.',
      output: [
        '3-5 fictional user personas',
        'Pain points and preferences',
        'Brutally honest quotes',
        'Willingness-to-pay scores',
        'Professional product researcher style'
      ]
    },
    {
      id: 'timeline',
      icon: <FaCalendarAlt />,
      title: 'Timeline Alchemy',
      description: 'Extract and structure events into beautiful chronological timelines with impact analysis.',
      useCase: 'Ideal for narratives, historical events, project timelines, and sequential stories.',
      output: [
        'Vertical chronological timeline',
        'Clean timestamps (inferred if missing)',
        'Event summaries',
        'Impact notes',
        'Smooth, minimal timeline visualization'
      ]
    },
    {
      id: 'purification',
      icon: <FaFileAlt />,
      title: 'Document Purification',
      description: 'Clean and refine messy text with better grammar, clarity, and structure while maintaining a human tone.',
      useCase: 'Best for unstructured text, poor grammar, messy documents, and rough drafts.',
      output: [
        'Improved grammar and spelling',
        'Better clarity and flow',
        'Clean headings and structure',
        'Proper spacing and formatting',
        'Human tone (non-AI)'
      ]
    },
    {
      id: 'stress-test',
      icon: <FaSearch />,
      title: 'Idea Stress Test Engine',
      description: 'Get a reality check on your ideas with best-case scenarios, risks, and improvement suggestions.',
      useCase: 'Useful for validating business ideas, product concepts, and strategic planning.',
      output: [
        'Best-case scenario analysis',
        'Worst-case scenario analysis',
        '3 hidden risks identified',
        'One-line pitch',
        '10× improvement suggestions'
      ]
    },
    {
      id: 'world-building',
      icon: <FaGlobe />,
      title: 'World-Building Alchemy',
      description: 'Expand your creative concepts into rich settings, characters, conflicts, and immersive micro-stories.',
      useCase: 'Perfect for fantasy/sci-fi writing, creative projects, and storytelling.',
      output: [
        'Detailed setting descriptions',
        'Character profiles (2-4 main characters)',
        'Conflict and tension analysis',
        'Map/location descriptions',
        '150-word immersive micro-story',
        'Mature, immersive tone'
      ]
    }
  ];

  return (
    <div className="page-container processes-page">
      <div className="processes-header">
        <h1>Forge</h1>
        <p className="page-subtitle">
          Discover how Think Alchemist transforms your thoughts into structured knowledge
        </p>
      </div>

      <div className="processes-grid">
        {processes.map((process) => (
          <div key={process.id} className="process-card">
            <div className="process-icon">
              {process.icon}
            </div>
            <h2>{process.title}</h2>
            <p className="process-description">{process.description}</p>
            
            <div className="process-use-case">
              <strong>Best for:</strong> {process.useCase}
            </div>

            <div className="process-output">
              <strong>Output includes:</strong>
              <ul>
                {process.output.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <Link 
              to={`/forge/${process.id === 'stress-test' ? 'stress-test' : process.id === 'world-building' ? 'world-building' : process.id}`} 
              className="process-try-button"
            >
              Try This Process
            </Link>
          </div>
        ))}
      </div>

      <div className="processes-cta">
        <h2>Ready to Transform Your Thoughts?</h2>
        <p>Start forging and see which alchemy process works best for your content.</p>
        <Link to="/forge" className="primary-button large">
          Start Forging Now
        </Link>
      </div>
    </div>
  );
}

export default ProcessesPage;

