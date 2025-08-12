// --- 1. IMPORTS AND INITIAL SETUP ---
import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

// Import the data schema that the AI will use
import { schemaList } from './schemaListGrid.js';
// Import p-map for reliably managing concurrent AI requests
import pMap from 'p-map';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const http = createServer(app);

// --- 2. SECURITY & CONNECTION SETUP ---

// Flexible CORS setup: allow connections only from the frontend's origin
const allowedOriginsString = process.env.CORS_ALLOWED_ORIGINS || "http://localhost:5500,http://127.0.0.1:5500";
const allowedOrigins = allowedOriginsString.split(',').map(origin => origin.trim());

const io = new Server(http, {
    cors: {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true); // Allow the request
            } else {
                callback(new Error(`CORS policy does not allow access from: ${origin}`));
            }
        },
        methods: ["GET", "POST"]
    }
});

// Initialize the OpenAI client with keys from the .env file
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL
});

// Serve the static frontend files (index.html, app.js, etc.)
app.use(express.static(path.join(__dirname, '..', 'frontend')));


// --- 3. MAIN LOGIC: WEBSOCKET CONNECTION HANDLING ---
io.on('connection', socket => {
    console.log('Client successfully connected:', socket.id);

    /**
     * Scenario 1: Analyze a SINGLE row.
     * Triggered when a user edits a cell in the grid.
     * Uses a callback for an immediate request-response pattern.
     */
    socket.on('analyze_single_review', async (reviewData, callback) => {
        console.log(`Analyzing single row, ID: ${reviewData.id}`);
        try {
            const result = await performSingleAnalysis(reviewData);
            callback({ status: 'success', payload: result.analyzed_rows[0] });
        } catch (e) {
            console.error(`Analysis failed for ID ${reviewData.id}:`, e.message);
            callback({ status: 'error', id: reviewData.id, message: e.message });
        }
    });

    /**
     * Scenario 2: Bulk analyze all rows.
     * Triggered when the "Analyze all reviews" button is clicked.
     */
    socket.on('analyze_bulk_reviews', async (reviews) => {
        console.log(`Starting bulk analysis for ${reviews.length} rows.`);

        // This is the "template" function for processing one review.
        const processSingleReview = async (review) => {
            try {
                const result = await performSingleAnalysis(review);

                // KEY FOR UX: The result for each row is sent to the client
                // *immediately*, without waiting for the entire batch to finish.
                socket.emit('review_analyzed', {
                    status: 'success',
                    id: result.analyzed_rows[0].id,
                    payload: result.analyzed_rows[0]
                });
            } catch (e) {
                console.error(`Analysis failed for ID: ${review.id}`, e.message);
                // If an error occurs, send it to the client for that specific row.
                socket.emit('review_analyzed', {
                    status: 'error',
                    id: review.id,
                    message: e.message
                });
            }
        };

        // KEY FOR RELIABILITY: Run the analysis for all reviews,
        // but with a concurrency limit of 5 simultaneous requests to OpenAI.
        // This protects against rate-limit errors and ensures stable operation.
        await pMap(reviews, processSingleReview, { concurrency: 5 });

        // After all reviews have been processed, send a final completion signal to the client.
        socket.emit('bulk_analysis_finished');
        console.log('Bulk analysis finished.');
    });
});


// --- 4. HELPER FUNCTIONS FOR AI INTERACTION ---

/**
 * The central pipeline function for analyzing one review.
 */
async function performSingleAnalysis(review) {
    // 1. Call the AI
    const assistantMessage = await callOpenAI(review);

    // 2. Check that the AI returned a function call (a "tool call")
    if (!assistantMessage?.tool_calls?.length) {
        throw new Error("AI did not return a valid tool call.");
    }

    // 3. Try to parse the JSON from the AI's response
    const toolCall = assistantMessage.tool_calls[0];
    try {
        return JSON.parse(toolCall.function.arguments);
    } catch (parseError) {
        console.error(`Failed to parse JSON from LLM:`, toolCall.function.arguments);
        throw new Error("AI returned an invalid data format.");
    }
}

/**
 * Prepares the prompt and makes the call to the OpenAI API.
 */
async function callOpenAI(review) {
    const userMessage = `Analyze this single review with ID=${review.id}: "${review.text}". You must call the \`update_grid_with_analysis\` function with the result.`;
    const messages = [
        { role: 'system', content: getSystemPrompt() },
        { role: 'user', content: userMessage }
    ];

    console.log(`Calling LLM for ID: ${review.id}...`);
    try {
        const res = await openai.chat.completions.create({
            model: 'gpt-4.1-nano', // You can specify any other model here
            messages: messages,
            tools: schemaList,
            tool_choice: "auto",
        });
        return res.choices[0].message;
    } catch (e) {
        console.error("Error calling OpenAI API:", e.message);
        throw new Error("Failed to communicate with the AI service.");
    }
}

/**
 * Generates the system prompt - this is the main instruction for the AI.
 */
function getSystemPrompt() {
    return `You are an AI assistant for data analysis. Your task is to analyze customer reviews. For each review, determine:
    1.  **sentiment**: 'positive', 'negative', 'neutral', or 'mixed'.
    2.  **tags**: 2-4 keywords (e.g., 'bugs', 'resources', 'notifications', 'UI/UX').
    3.  **summary**: a very brief summary of the review in English.
    
    Always use the provided 'update_grid_with_analysis' function to return the result. Even if you are analyzing a single review, return it as an array with one element.`;
}


// --- 5. START THE SERVER ---
const PORT = process.env.PORT || 3001;
http.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));