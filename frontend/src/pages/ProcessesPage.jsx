import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaChartLine,
  FaFlask,
  FaCalendarAlt, 
  FaFileAlt, 
  FaUsers
} from 'react-icons/fa';

function ProcessesPage() {
  const processes = [
    {
      id: 'strategic-analysis',
      icon: <FaChartLine />,
      title: 'Strategic Analysis',
      description: 'Comprehensive strategic analysis combining concept breakdown with best/worst case scenarios, risks, and improvements.',
      useCase: 'Perfect for business ideas, product concepts, strategic initiatives, and investment decisions.',
      output: [
        'Core essence and component breakdown',
        'Best-case and worst-case scenarios',
        'Hidden risks identification',
        'Potential applications analysis',
        'One-line pitch',
        '10× improvement recommendations',
        'Strategic insights and next steps'
      ]
    },
    {
      id: 'thought-catalyst',
      icon: <FaFlask />,
      title: 'Thought Catalyst',
      description: 'Spark unexpected insights, random connections, and creative ways of thinking about any concept or idea.',
      useCase: 'Perfect for creative thinking, brainstorming, finding unexpected connections, and sparking new ideas.',
      output: [
        '6-8 random creative insights',
        '4-5 unexpected connections to unrelated concepts',
        '4-5 alternative angles and approaches',
        '3-4 thought experiments and "what if" scenarios',
        '5-6 creative questions that challenge assumptions',
        'Synthesis of catalyzed thoughts'
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
      id: 'creative-personas',
      icon: <FaUsers />,
      title: 'Creative Personas & Worlds',
      description: 'Transform concepts into immersive user personas and rich creative worlds with characters, settings, and stories.',
      useCase: 'Perfect for product concepts, creative projects, world-building, and storytelling.',
      output: [
        '4-6 detailed user personas',
        'Rich creative world setting',
        'Character profiles (3-4 characters)',
        'Conflict and narrative tension',
        'Map/location descriptions',
        'Immersive micro-story (150-200 words)'
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
              to={`/forge/${process.id === 'strategic-analysis' ? 'strategic-analysis' : process.id === 'thought-catalyst' ? 'thought-catalyst' : process.id === 'creative-personas' ? 'creative-personas' : process.id}`} 
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

