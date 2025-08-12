# AI-Powered Review Analysis with DHTMLX Grid

A full-stack web application that uses an AI language model to analyze user reviews in a DHTMLX Grid. The application determines sentiment, extracts relevant tags, and provides a summary for each review, updating the grid in real-time, row-by-row.

### **[✨ Try the Live Demo >>>](https://dhtmlx.com/docs/demo/grid-ai-review-analysis/)**

## Features

- **Real-time, Row-by-Row Analysis:** Click "Analyze All Reviews" to see the grid populate with AI-generated data one row at a time, providing a live-updating experience.
- **On-the-Fly Editing:** Edit a review directly in the grid, and it will be instantly re-analyzed.
- **Clear Sentiment Visualization:** Uses icons (👍, 👎, 🤔) for an at-a-glance understanding of the sentiment.
- **Reliable & Scalable:** The backend is built to handle multiple simultaneous requests to the AI service without hitting rate limits, ensuring stable operation.

## AI Service

  - Configured to work with any OpenAI API-compatible proxy.
  - Tested with `gpt-4.1-nano` model.

## Setup and Installation

Follow these steps to get the project running on your local machine.

```bash
cd grid-ai-demo
npm install
```

### Set up environment variables:
Create a new file named `.env` inside the `grid-ai-demo` directory by copying from `env.sample`. This file holds your secret keys and configuration.

📄 `grid-ai-demo/.env`
```ini
# --- OpenAI API Configuration ---
OPENAI_API_KEY=sk-YourSecretApiKeyGoesHere
OPENAI_BASE_URL=https://api.openai.com/v1

# --- Security Configuration ---
CORS_ALLOWED_ORIGINS=http://localhost:3001,http://127.0.0.1:3001,http://localhost:5500,http://127.0.0.1:5500
```

-   **`OPENAI_API_KEY`**: (Required) Your secret API key for the AI service.
-   **`OPENAI_BASE_URL`**: The API endpoint for the AI service. Can be changed to use a proxy or a different provider compatible with the OpenAI API.
-   **`CORS_ALLOWED_ORIGINS`**: A crucial security setting. This is a comma-separated list of web addresses allowed to connect to your backend server. For production, you **must** change this to your public frontend's URL (e.g., `https://myapp.com`).

### Run the Application

In the same `grid-ai-demo` directory, run the start command:
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

The application uses a real-time, event-driven architecture to provide a seamless and reliable user experience.

1.  **Initiation:** The user clicks the "Analyze All Reviews" button on the frontend.
2.  **Bulk Request:** The frontend gathers all reviews that need analysis and sends them to the server as a single list via a `analyze_bulk_reviews` Socket.IO event.
3.  **Concurrent Backend Processing:** The Node.js server receives the list. Using the `p-map` library, it starts processing reviews concurrently (with a configurable limit, e.g., 5 at a time) by making asynchronous calls to the AI service.
4.  **Streaming Results:** As soon as the analysis for **any single review** is complete, the server immediately sends the result for that specific row back to the client using a `review_analyzed` event. This happens without waiting for the entire batch to finish.
5.  **Instant Grid Update:** The frontend receives the analysis for that one row and instantly updates its data in the grid.
6.  **Completion:** This process continues, creating a live, row-by-row update effect. Once all reviews have been processed, the server emits a final `bulk_analysis_finished` event to signal that the entire job is done.

## Deployment

This application is ready to be deployed on any service that supports Node.js, such as Render, Heroku, or Vercel.

**Key deployment steps:**
- **Do not** upload your `.env` file. Use the hosting provider's "Environment Variables" section to set `OPENAI_API_KEY`, `OPENAI_BASE_URL`, and `CORS_ALLOWED_ORIGINS`.
- The `Root Directory` should be left blank (or set to /).
- The `Start Command` should be `npm start`.

## License

DHTMLX Grid is a commercial library - use it under a [valid license](https://dhtmlx.com/docs/products/licenses.shtml) or [evaluation agreement](https://dhtmlx.com/docs/products/dhtmlxGrid/download.shtml).