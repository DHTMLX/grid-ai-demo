
# AI-Powered Review Analysis with DHTMLX Grid

A full-stack web application that uses an AI language model to analyze user reviews in a DHTMLX Grid. The application determines sentiment, extracts relevant tags, and provides a summary for each review, updating the grid in real-time, row-by-row.

## Features

- **Real-time, Row-by-Row Analysis:** Click "Analyze All Reviews" to see the grid populate with AI-generated data one row at a time, providing a live-updating experience.
- **On-the-Fly Editing:** Edit a review directly in the grid, and it will be instantly re-analyzed.
- **Clear Sentiment Visualization:** Uses icons (👍, 👎, 🤔) for an at-a-glance understanding of the sentiment.

## AI Service

  - Configured to work with any OpenAI API-compatible proxy.
  - Tested with `gpt-4.1-nano` model.

## Setup and Installation

Follow these steps to get the project running on your local machine.

```bash
cd dhtmlx-grid-ai
npm install
```

### Set up environment variables:
Create a new file named `.env` inside the `dhtmlx-grid-ai` directory. This file will hold your secret API key and the base URL for the AI service.


📄 `dhtmlx-grid-ai/.env`
```ini
OPENAI_API_KEY=sk-YourSecretApiKeyGoesHere
OPENAI_BASE_URL=https://api.openai.com/v1
```

Replace `sk-YourSecretApiKeyGoesHere` with your actual API key.

### Run the Application

In the same `dhtmlx-grid-ai` directory, run the start command:
```bash
npm start
```

You should see the following output in your terminal:
```
Server started on port 3001
```

### 4. Open in Browser

Open your favorite web browser and navigate to:
[http://localhost:3001](http://localhost:3001)

You should see the application, ready for analysis!

## How It Works

The application uses a real-time, event-driven architecture to provide a seamless user experience.

1.  **Initiation:** The user clicks the "Analyze All Reviews" button on the frontend.
2.  **Sequential Requests:** The frontend JavaScript loops through each grid row and sends a `analyze_single_review` event to the backend via Socket.IO for **each row**.
3.  **Backend Processing:** The Node.js server receives the request for a single review.
4.  **AI Call:** The server sends the review text to the AI service defined in the `.env` file.
5.  **AI Response:** The AI analyzes the text and returns the sentiment, tags, and summary.
6.  **Callback to Client:** The server immediately sends the result back to the specific client using a Socket.IO callback.
7.  **Grid Update:** The frontend receives the analysis for that one row and instantly updates the grid.
8.  **Loop Continues:** The frontend proceeds to the next row in the list, creating the live, row-by-row update effect.

## Deployment

This application is ready to be deployed on any service that supports Node.js, such as Render, Heroku, or Vercel.

**Key deployment steps:**
- **Do not** upload your `.env` file. Use the hosting provider's "Environment Variables" section to set `OPENAI_API_KEY` and `OPENAI_BASE_URL`.
- The `Root Directory` should be left blank (or set to /).
- The `Start Command` should be `npm start`.

## License

DHTMLX Grid is a commercial library - use it under a [valid license](https://dhtmlx.com/docs/products/licenses.shtml) or [evaluation agreement](https://dhtmlx.com/docs/products/dhtmlxGrid/download.shtml).