# CrossLab - Cross-Disciplinary Learning Platform

A modern web application for connecting students across disciplines to solve real-world challenges through collaborative project-based learning.

## Features

- **Smart Matchmaking**: AI-powered team formation based on skills and project needs
- **AI Copilot**: Role-specific assistants for different team members
- **Peer Review System**: Anonymous feedback and contribution tracking
- **Live Demo Showcase**: Present projects with video demos and portfolios
- **CV Upload & Parsing**: Upload and automatically parse CV/resume files using OpenAI GPT-4o-mini

## CV Upload Feature

The platform now includes a CV upload and parsing feature that:

- Supports multiple file formats (PDF, DOC, DOCX, TXT)
- Uses OpenAI GPT-4o-mini for intelligent parsing
- Handles both text files and PDF files (converted to base64)
- Extracts structured information including:
  - Personal information (name, email, phone, location)
  - Professional summary
  - Education history
  - Work experience
  - Technical and soft skills
  - Certifications
  - Projects
- Displays parsing status and progress
- Shows parsed information in a clean, organized format

## Environment Setup

1. Create a `.env` file in the root directory with your OpenAI API key:

```
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
REACT_APP_OPENAI_MODEL=gpt-4o-mini
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

## CV Upload Feature

The platform now includes a CV upload and parsing feature that:

- Supports multiple file formats (PDF, DOC, DOCX, TXT)
- Uses OpenAI GPT-4o-mini for intelligent parsing
- Handles both text files and PDF files (converted to base64)
- Extracts structured information including:
  - Personal information (name, email, phone, location)
  - Professional summary
  - Education history
  - Work experience
  - Technical and soft skills
  - Certifications
  - Projects
- Displays parsing status and progress
- Shows parsed information in a clean, organized format

## Cost Information

- **GPT-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **Typical CV parsing**: ~$0.10-0.30 per CV (very cost-effective)
- **Simple and reliable** text-based parsing approach

## Security Notes

- The `.env` file is automatically ignored by Git to protect your API key
- API keys are only used client-side for CV parsing
- File uploads are limited to 5MB and validated file types

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (not recommended)
