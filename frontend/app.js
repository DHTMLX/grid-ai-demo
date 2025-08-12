document.addEventListener("DOMContentLoaded", function () {

    // --- 1. UI elements and state ---
    const analyzeButton = document.getElementById("analyze-btn");
    const loader = document.getElementById("loader");

    function toggleLoading(isLoading) {
        loader.style.display = isLoading ? 'inline' : 'none';
        analyzeButton.disabled = isLoading;
    }

    // --- 2. Grid Initialization ---
    const gridData = [
        { id: 1, review_text: "Five stars! Think of it as a pre-installed, top-tier moral firewall. It prevents catastrophic system failures (aka 'life-ruining decisions').", sentiment: "", tags: "", summary: "" },
        { id: 2, review_text: "It's a trade-off. The 'Avoid Major Disaster' feature is a plus, but the 'Guilt' user interface is poorly designed. The experience is balanced.", sentiment: "", tags: "", summary: "" },
        { id: 3, review_text: "Discovered a pleasant feature: if you do something good, it goes silent for a while. I'm actively using this.", sentiment: "", tags: "", summary: "" },
        { id: 4, review_text: "A very intrusive background app that's impossible to uninstall. Constantly sends push notifications at night. Consumes a lot of resources.", sentiment: "", tags: "", summary: "" },
        { id: 5, review_text: "Very strange API. Sometimes, all it takes to activate it is eating an extra piece of cake.", sentiment: "", tags: "", summary: "" },
        { id: 6, review_text: "Compatible only with one operating system — 'Human'. They say it doesn't run on cats.", sentiment: "", tags: "", summary: "" },
        { id: 7, review_text: "The interface is intuitively NOT clear. There's no 'Snooze for 5 minutes' button. Devs, hello?!", sentiment: "", tags: "", summary: "" },
        { id: 8, review_text: "Sometimes it feels like it has its own private API that parents can connect to.", sentiment: "", tags: "", summary: "" },
        { id: 9, review_text: "The battery life is poor. After one difficult moral choice, the charge drops to zero, and you feel drained all day.", sentiment: "", tags: "", summary: "" },
        { id: 10, review_text: "No documentation. Had to learn all the features through trial and very painful errors.", sentiment: "", tags: "", summary: "" },
        { id: 11, review_text: "The app constantly scans files from the past. It significantly slows down the 'Present' operating system.", sentiment: "", tags: "", summary: "" },
        { id: 12, review_text: "After the latest update, it not only nags but also shows potential consequences in Full HD. Too realistic.", sentiment: "", tags: "", summary: "" },
        { id: 13, review_text: "Notification volume is not adjustable. Sometimes it yells so loud it drowns out the voice of reason.", sentiment: "", tags: "", summary: "" },
        { id: 14, review_text: "No family plan. My friend's version is much calmer than mine. Where is the justice?", sentiment: "", tags: "", summary: "" },
        { id: 15, review_text: "Doesn't support multitasking. When it's active, other processes like 'Joy' and 'Calm' just freeze.", sentiment: "", tags: "", summary: "" }
    ];

    const grid = new dhx.Grid("grid", {
        columns: [
            { id: "review_text", header: [{ text: "Review about Conscience" }, { content: "inputFilter" }], editable: true, width: 450 },
            {
                id: "sentiment",
                header: [{ text: "Sentiment" }, { content: "comboFilter", filterConfig: { multiselection: true } }],
                editorType: "select",
                options: ["positive", "negative", "neutral", "mixed"],
                width: 150,
                template: (text) => {
                    if (text === 'positive') return '👍 Positive';
                    if (text === 'negative') return '👎 Negative';
                    if (text === 'neutral') return '😐 Neutral';
                    if (text === 'mixed') return '🤔 Mixed';
                    return text;
                }
            },
            { id: "tags", header: [{ text: "Tags" }, { content: "inputFilter" }], width: 250 },
            { id: "summary", header: [{ text: "Summary" }] },
        ],
        data: gridData,
        autoWidth: true,
        autoHeight: true
    });
    // --- 3. Server-side communication setup ---
    const socket = io();
    socket.on('connect', () => console.log("Successfully connected to the server!"));

    socket.on('review_analyzed', (response) => {
        if (response.status === 'success') {
            const analysis = response.payload;
            const tagsString = Array.isArray(analysis.tags) ? analysis.tags.join(', ') : analysis.tags;
            grid.data.update(analysis.id, { sentiment: analysis.sentiment, tags: tagsString, summary: analysis.summary });
        } else {
            grid.data.update(response.id, { summary: "Error during analysis." });
            console.error(`Analysis failed for ID ${response.id}: ${response.message}`);
        }
    });

    socket.on('bulk_analysis_finished', () => {
        toggleLoading(false);
        console.log("Bulk analysis finished on server.");
    });

    analyzeButton.addEventListener('click', () => {
        const reviewsToAnalyze = grid.data.serialize()
            .filter(row => row.review_text && !row.summary)
            .map(row => ({ id: row.id, text: row.review_text }));

        if (reviewsToAnalyze.length > 0) {
            toggleLoading(true);
            reviewsToAnalyze.forEach(row => {
                grid.data.update(row.id, { summary: "Analyzing..." });
            });
            socket.emit('analyze_bulk_reviews', reviewsToAnalyze);
        } else {
            console.log("No new reviews to analyze.");
        }
    });

    grid.events.on("afterEditEnd", async (value, row, column) => {
        if (column.id === "review_text") {
            toggleLoading(true);
            try {
                await analyzeSingleRow(row);
            } catch (e) {
                console.error(`Failed to analyze edited row ${row.id}:`, e);
            }
            toggleLoading(false);
        }
    });

    function analyzeSingleRow(row) {
        return new Promise((resolve, reject) => {
            grid.data.update(row.id, { summary: "Analyzing..." });
            const reviewData = { id: row.id, text: row.review_text };

            socket.emit('analyze_single_review', reviewData, (response) => {
                if (response.status === 'success') {
                    const { id, sentiment, tags, summary } = response.payload;
                    const tagsString = Array.isArray(tags) ? tags.join(', ') : tags;
                    grid.data.update(id, { sentiment, tags: tagsString, summary });
                    resolve();
                } else {
                    // response.status === 'error'
                    grid.data.update(response.id, { summary: "Error during analysis." });
                    console.error(`Analysis failed for ID ${response.id}: ${response.message}`);
                    reject(new Error(response.message));
                }
            });
        });
    }
});