# IB Paper Review Master

IB Paper Review Master is an AI-powered application designed to assist in reviewing and grading International Baccalaureate (IB) papers. It leverages Large Language Models (LLMs) to analyze student essays against specific assessment rubrics, providing detailed, criterion-referenced feedback and scoring.

## Features

- **Dual PDF Upload**: Easily upload both the student's paper and the assessment rubric (PDF format).
- **AI-Powered Analysis**: Uses advanced LLMs (via OpenRouter, defaulting to Google Gemini models) to analyze the text.
- **Criterion-Referenced Grading**: Generates a breakdown of scores and feedback for each criterion in the rubric.
- **Smart Highlighting**: Identifies and highlights specific sections of the text with color-coded feedback:
  - **Green**: Positive examples / Good execution.
  - **Red**: Negative examples / Errors or rubric failures.
  - **Yellow**: Neutral / Areas for improvement.
- **Interactive Interface**:
  - **Examiner Sidebar**: Displays the scorecard, reasoning, and detailed feedback.
  - **Artifact Viewer**: View the original text with interactive highlights.
  - **Draft Editor**: Switch to draft mode to edit and refine the paper based on feedback.
- **PDF Text Cleaning**: Automatically cleans and formats text extracted from PDFs, handling issues like broken lines and spacing (especially for CJK characters).

## Prerequisites

- **Node.js**: Ensure you have Node.js installed (version 18 or higher recommended).
- **OpenRouter API Key**: You need an API key from [OpenRouter](https://openrouter.ai/) to access the LLM features.

## Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/ib-paper-review-master.git
    cd ib-paper-review-master
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**

    Create a `.env` file in the root directory of the project and add your OpenRouter API key:

    ```env
    VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
    ```

## Usage

### Development

You can run the application in two modes:

**1. Web Mode (Vite Server):**
Useful for quick UI development without Electron wrappers.

```bash
npm run dev
```

**2. Electron Mode:**
Runs the full Electron application.

```bash
npm run electron:dev
```

### Building for Production

To build the application for your operating system:

```bash
npm run build
```

This will compile the TypeScript code, build the Vite app, and package it using `electron-builder`. The output will be in the `dist` or `release` directory (depending on configuration).

## Tech Stack

- **Core**: [Electron](https://www.electronjs.org/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **PDF Handling**: [react-pdf](https://github.com/wojtekmaj/react-pdf), [jspdf](https://github.com/parallax/jsPDF)
- **AI/LLM**: [OpenRouter API](https://openrouter.ai/) (Google Gemini models)
- **Icons**: [Lucide React](https://lucide.dev/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
