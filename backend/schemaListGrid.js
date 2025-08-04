export const schemaList = [
    {
        type: "function",
        function: {
            name: "update_grid_with_analysis",
            description: "Accepts an array of analyzed reviews and returns them to update the grid. Used for BULK analysis as well as for analyzing a SINGLE review.",
            parameters: {
                type: "object",
                properties: {
                    analyzed_rows: {
                        type: "array",
                        description: "An array with the analysis results for each row. Even if only one review was analyzed, it must be inside this array.",
                        items: {
                            type: "object",
                            properties: {
                                id: { type: ["string", "number"], description: "The ID of the row in the grid." },
                                sentiment: { type: "string", enum: ["positive", "negative", "neutral", "mixed"], description: "The sentiment: positive, negative, neutral, or mixed." },
                                tags: { type: "array", items: { type: "string" }, description: "A list of 2-4 tags (e.g., 'price', 'shipping', 'bug')." },
                                summary: { type: "string", description: "A very brief summary of the review (1 sentence)." }
                            },
                            required: ["id", "sentiment", "tags", "summary"]
                        }
                    }
                },
                required: ["analyzed_rows"]
            }
        }
    }
];