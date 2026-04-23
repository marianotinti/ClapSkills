import { Skill } from '../types';

export const mockSkills: Skill[] = [
  {
    id: 's1',
    name: 'CSV to Slack Report',
    description: 'Takes a raw CSV export of weekly metrics, analyzes key changes, and posts a formatted summary to the #team-updates channel.',
    owner: 'Alex Carter',
    tags: ['Operations', 'Reporting'],
    pattern: 'file_to_summary',
    sharedWith: ['Engineering', 'Product'],
    inputs: [
      { key: 'csv_file', label: 'Metrics CSV', type: 'file', required: true },
      { key: 'channel_name', label: 'Slack Channel', type: 'select', required: true, options: ['#team-updates', '#leadership', '#general'] }
    ],
    steps: [
      { id: '1', label: 'Upload CSV', type: 'file_input' },
      { id: '2', label: 'Clean Data & Standardize', type: 'transform' },
      { id: '3', label: 'Generate Summary', type: 'ai' },
      { id: '4', label: 'Post to Slack', type: 'api_call' }
    ],
    outputDescription: 'A structured message posted in the selected Slack channel containing week-over-week metric changes.',
    status: 'active',
    runs: 342
  },
  {
    id: 's2',
    name: 'Brief Gap Detector',
    description: 'Analyzes a product brief against our standard requirements matrix and highlights missing sections or unaddressed risks.',
    owner: 'Sarah Jenkins',
    tags: ['Product', 'Review', 'AI'],
    pattern: 'research_to_report',
    sharedWith: ['Product', 'Design'],
    inputs: [
      { key: 'brief_text', label: 'Brief Content', type: 'textarea', required: true, placeholder: 'Paste the product brief here...' },
      { key: 'strictness', label: 'Review Strictness', type: 'select', required: false, options: ['Standard', 'Strict', 'Lenient'] }
    ],
    steps: [
      { id: '1', label: 'Receive Brief Text', type: 'trigger' },
      { id: '2', label: 'Compare against baseline', type: 'ai' },
      { id: '3', label: 'Flag missing sections', type: 'transform' },
      { id: '4', label: 'Return gap report', type: 'output' }
    ],
    outputDescription: 'A prioritized bullet list of missing information and potential risks identified in the brief.',
    status: 'active',
    runs: 128
  },
  {
    id: 's3',
    name: 'Meeting Notes to Action Items',
    description: 'Extracts clear tasks and assignees from raw meeting transcripts, creating tickets if an integration is set.',
    owner: 'David Kim',
    tags: ['Productivity', 'Daily'],
    pattern: 'file_to_summary',
    sharedWith: ['All Teams'],
    inputs: [
      { key: 'transcript', label: 'Meeting Transcript', type: 'textarea', required: true, placeholder: 'Paste transcript text...' }
    ],
    steps: [
      { id: '1', label: 'Receive Transcript', type: 'trigger' },
      { id: '2', label: 'Identify Tasks & Assignees', type: 'ai' },
      { id: '3', label: 'Format Task List', type: 'transform' },
      { id: '4', label: 'Output Markdown List', type: 'output' }
    ],
    outputDescription: 'A clean markdown list of actionable items with identified owners and deadlines (if mentioned).',
    status: 'active',
    runs: 856
  },
  {
    id: 's4',
    name: 'Research Digest Generator',
    description: 'Pulls the latest 5 articles for a given topic via API, reads them, and creates an executive summary.',
    owner: 'Maria Jones',
    tags: ['Research', 'Marketing'],
    pattern: 'api_lookup_to_report',
    sharedWith: ['Marketing', 'Leadership'],
    inputs: [
      { key: 'topic', label: 'Research Topic', type: 'text', required: true, placeholder: 'e.g., AI trends in fintech' },
      { key: 'timeframe', label: 'Timeframe', type: 'select', required: true, options: ['Last 24 hours', 'Last 7 days', 'Last month'] }
    ],
    steps: [
      { id: '1', label: 'Search Topic', type: 'api_call' },
      { id: '2', label: 'Scrape Article Content', type: 'api_call' },
      { id: '3', label: 'Synthesize Findings', type: 'ai' },
      { id: '4', label: 'Create Digest', type: 'output' }
    ],
    outputDescription: 'A 2-paragraph executive summary followed by bulleted key insights from the top sources.',
    status: 'draft',
    runs: 0
  }
];
