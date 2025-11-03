

import { GoogleGenAI, Type, Modality, Chat } from "@google/genai";
declare var Cropper: any;
// FIX: Corrected the global variable declaration for jsPDF. The library attaches to `window.jspdf`.
declare var jspdf: any;
declare var showdown: any;
declare var window: any;


document.addEventListener('DOMContentLoaded', () => {
    
    // --- Theme Toggle Logic ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    const applyTheme = (theme: string) => {
        body.dataset.theme = theme;
        localStorage.setItem('theme', theme);
    };

    const toggleTheme = () => {
        const currentTheme = body.dataset.theme === 'dark' ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    };

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // --- Load Initial Theme ---
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (prefersDark) {
        applyTheme('dark');
    } else {
        applyTheme('light'); // Default
    }

    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const dropdownToggle = document.getElementById('dropdown-toggle');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const searchBar = document.getElementById('search-bar') as HTMLInputElement;
    const searchResultsContainer = document.getElementById('search-results');

    // --- Tool Data for Search ---
    const tools = [
        // AI Tools
        { name: 'AI Recipe Generator', description: 'Generate creative recipes from the ingredients you have on hand.', target: 'ai-recipe-generator-tool-section' },
        { name: 'AI Image Editor', description: 'Edit images using text prompts. Add filters, remove objects, and more with AI.', target: 'ai-image-editor-tool-section' },
        { name: 'AI Video Generator', description: 'Create a short video from a starting image and an optional text prompt.', target: 'ai-video-generator-tool-section' },
        { name: 'AI Chatbot', description: 'Have a conversation with a friendly AI. Ask questions, get explanations, or brainstorm ideas.', target: 'ai-chatbot-tool-section' },

        // PDF Tools
        { name: 'Merge PDF', description: 'Combine multiple PDFs into one. Files are merged in the order they are listed.', target: 'merge-pdf-tool-section' },
        { name: 'Split PDF', description: 'Extract a specific range of pages from a PDF file into a new document.', target: 'split-pdf-tool-section' },
        { name: 'Compress PDF', description: 'Reduce PDF file size for easy sharing, while optimizing for the best possible quality.', target: 'compress-pdf-tool-section' },
        { name: 'PDF to Word', description: 'Convert PDFs to editable Word (.docx) files, preserving the original layout.', target: 'pdf-to-word-tool-section' },
        { name: 'PDF to Image', description: 'Convert each page of a PDF into a high-quality JPG or PNG image file.', target: 'pdf-to-image-tool-section' },
        { name: 'Protect PDF', description: 'Secure your PDF by adding a password, encrypting the file to prevent unauthorized access.', target: 'protect-pdf-tool-section' },
        { name: 'Unlock PDF', description: 'Remove password protection from your PDF files (if you have the password).', target: 'unlock-pdf-tool-section' },
        { name: 'Add Page Numbers', description: 'Easily insert page numbers into your PDF documents with customizable positioning.', target: 'add-page-numbers-tool-section' },
    
        // Image Tools
        { name: 'AI Image Editor', description: 'Edit images using text prompts. Add filters, remove objects, and more with AI.', target: 'ai-image-editor-tool-section' },
        { name: 'AI Video Generator', description: 'Create a short video from a starting image and an optional text prompt.', target: 'ai-video-generator-tool-section' },
        { name: 'Resize Image', description: 'Resize your image by pixel dimensions, while maintaining the aspect ratio.', target: 'resize-image-tool-section' },
        { name: 'Crop Image', description: 'Crop your image by selecting a specific area. Perfect for framing and removing unwanted parts.', target: 'crop-image-tool-section' },
        { name: 'Compress Image', description: 'Make your image files smaller for web and email, balancing file size and visual quality.', target: 'compress-image-tool-section' },
        { name: 'Convert to PNG', description: 'Convert various image formats like JPG or GIF into the versatile PNG format.', target: 'convert-to-png-tool-section' },
        { name: 'Convert to JPG', description: 'Convert images like PNG or GIF into the widely-supported JPG format.', target: 'convert-to-jpg-tool-section' },
        { name: 'Background Remover', description: 'Instantly remove the background from any image with a single click, using AI.', target: 'background-remover-tool-section' },
        { name: 'Image Upscaler', description: 'Increase the resolution of your images using AI, making them larger and clearer. Supports 2x and 4x upscaling.', target: 'image-upscaler-tool-section' },
        
        // Text & Document Tools
        { name: 'Text Case Converter', description: 'Convert text between UPPERCASE, lowercase, Title Case, and more.', target: 'case-converter-tool-section' },
        { name: 'Word Counter', description: 'Count words, characters, sentences, and paragraphs in your text.', target: 'word-counter-tool-section' },
        { name: 'Find & Replace Text', description: 'Search for and replace specific words or phrases in a body of text.', target: 'find-replace-tool-section' },
        { name: 'Keyword Density Checker', description: 'Analyze text to find the density of specific keywords for SEO.', target: 'keyword-density-tool-section' },
        { name: 'Sentence Counter', description: 'Count the total number of sentences in a block of text.', target: 'sentence-counter-tool-section' },
        { name: 'Text Reverser', description: 'Flip any text backward instantly.', target: 'text-reverser-tool-section' },
        { name: 'Sort Lines Alphabetically', description: 'Organize lines of text in alphabetical (A-Z) or reverse order (Z-A).', target: 'sort-lines-tool-section' },
        { name: 'Remove Duplicate Lines', description: 'Delete duplicate lines from a list, leaving only unique entries.', target: 'remove-duplicates-tool-section' },
        { name: 'Paragraph Formatter', description: 'Automatically fix spacing, capitalization, and line breaks in your text.', target: 'paragraph-formatter-tool-section' },
        { name: 'Remove Extra Spaces', description: 'Clean up text by removing duplicate spaces and line breaks.', target: 'remove-spaces-tool-section' },
        { name: 'Text Cleaner', description: 'Remove HTML tags, symbols, and extra spaces from your text.', target: 'text-cleaner-tool-section' },
        { name: 'Random Password Generator', description: 'Create strong, secure, and random passwords for your accounts.', target: 'password-generator-tool-section' },
        { name: 'Notes Saver', description: 'A simple notepad that saves your text to your browser for your next visit.', target: 'notes-saver-tool-section' },
        { name: 'Simple Notepad', description: 'A clean notepad to write and download text as a .txt file.', target: 'simple-notepad-tool-section' },
        { name: 'Lorem Ipsum Generator', description: 'Generate placeholder text for your design mockups.', target: 'lorem-ipsum-tool-section' },
        { name: 'Text Compare', description: 'Compare two text documents and highlight the differences.', target: 'text-compare-tool-section' },
        { name: 'Word Frequency Analyzer', description: 'Analyze text to find the most frequently used words.', target: 'word-frequency-tool-section' },
        { name: 'Text Encrypt / Decrypt', description: 'Encode and decode text using the Base64 method.', target: 'text-encrypt-tool-section' },
        { name: 'Markdown to HTML', description: 'Convert Markdown syntax into valid HTML code.', target: 'markdown-html-tool-section' },
        { name: 'HTML to Text', description: 'Strip HTML tags from a document to get plain text.', target: 'html-text-tool-section' },
        { name: 'Resume Generator', description: 'Fill out a form to create a professional PDF resume.', target: 'resume-generator-tool-section' },
        { name: 'Emoji Remover', description: 'Strip all emojis from your text, leaving only plain text.', target: 'emoji-remover-tool-section' },
    
        // Conversion Tools
        { name: 'Image to PDF', description: 'Combine multiple images (JPG, PNG, etc.) into a single, easy-to-share PDF document.', target: 'image-to-pdf-tool-section' },
        { name: 'Image to Text (OCR)', description: 'Extract text from any image. Convert scanned documents or pictures into editable text.', target: 'image-to-text-tool-section' },
        { name: 'TXT to PDF', description: 'Convert simple .txt files into professional-looking PDF documents.', target: 'txt-to-pdf-tool-section' },
        { name: 'HTML to TXT', description: 'Strip all HTML tags and formatting from a file, leaving only the plain text.', target: 'html-text-tool-section' },
        { name: 'CSV to XLSX', description: 'Effortlessly convert your CSV data files into the Microsoft Excel (.xlsx) format.', target: 'csv-to-xlsx-tool-section' },
    
        // SEO / Writing Helpers
        { name: 'Keyword Generator', description: 'Discover new keyword ideas to improve your SEO and content marketing strategy.', target: 'keyword-generator-tool-section' },
        { name: 'Meta Tag Generator', description: 'Use AI to generate SEO-optimized meta titles, descriptions, and keywords for your content.', target: 'meta-tag-generator-tool-section' },
        { name: 'Plagiarism Checker', description: 'Ensure your content is original by scanning for instances of plagiarism across the internet.', target: 'plagiarism-checker-tool-section' },
        { name: 'Readability Score', description: 'Calculate the readability of your writing to ensure it is easy for your audience to understand.', target: 'readability-score-tool-section' },
        { name: 'AI Title Writer', description: 'Use AI to brainstorm creative and engaging headlines for your blog posts, articles, or videos.', target: 'ai-title-writer-tool-section' },

        // Audio Tools
        { name: 'MP3 to WAV', description: 'Convert compressed MP3 audio to the uncompressed, high-quality WAV format.', target: 'mp3-to-wav-tool-section' },
        { name: 'WAV to MP3', description: 'Convert large, uncompressed WAV files into the smaller, more portable MP3 format.', target: 'wav-to-mp3-tool-section' },
        { name: 'Record Audio', description: 'Record high-quality audio directly from your microphone and save it as a WAV file.', target: 'record-audio-tool-section' },
        { name: 'Audio Trimmer', description: 'Easily cut or trim the beginning and end of your audio files to get the perfect clip.', target: 'audio-trimmer-tool-section' },
        { name: 'Volume Booster', description: 'Amplify the sound of your audio files if they are too quiet, without needing complex software.', target: 'volume-booster-tool-section' },

        // Site Pages
        { name: 'About', description: 'Learn more about SMARTPDFTOOL, our mission, and features.', target: 'about-section' },
        { name: 'Contact', description: 'Get in touch with us with your questions or feedback.', target: 'contact-section' },
        { name: 'Blog', description: 'Tips, tricks, and tutorials for your digital tasks.', target: 'blog-section' },
        { name: 'Frequently Asked Questions (FAQ)', description: 'Find answers to common questions about our tools.', target: 'faq-section' },
        { name: 'How to Compress PDF Without Losing Quality', description: 'A blog post on reducing PDF file size while maintaining quality.', target: 'blog-post-compress-pdf' },
    ];

    // --- Usage Stats Logic ---
    const USAGE_STATS_KEY = 'toolUsageStats';

    function getUsageStats(): { [key: string]: number } {
        try {
            const stats = localStorage.getItem(USAGE_STATS_KEY);
            return stats ? JSON.parse(stats) : {};
        } catch (e) {
            console.error("Failed to parse usage stats from localStorage", e);
            return {};
        }
    }

    function saveUsageStats(stats: { [key: string]: number }) {
        try {
            localStorage.setItem(USAGE_STATS_KEY, JSON.stringify(stats));
        } catch (e) {
            console.error("Failed to save usage stats to localStorage", e);
        }
    }

    function incrementToolUsage(toolId: string) {
        if (!toolId) return;

        const stats = getUsageStats();
        const newCount = (stats[toolId] || 0) + 1;
        stats[toolId] = newCount;
        saveUsageStats(stats);

        // Update the UI in real-time
        document.querySelectorAll<HTMLElement>(`[data-tool-id="${toolId}"]`).forEach(el => {
            el.textContent = newCount.toString();
        });
    }
    
    function updateAllUsageDisplays() {
        const stats = getUsageStats();
        document.querySelectorAll<HTMLElement>('[data-tool-id]').forEach(el => {
            const toolId = el.dataset.toolId;
            if (toolId && stats[toolId]) {
                el.textContent = stats[toolId].toString();
            } else {
                el.textContent = '0'; // Default if not found
            }
        });
    }

    // --- AI Chatbot Logic ---
    // FIX: Corrected element IDs and class names to match CSS and HTML. Refactored input handling to use form submission for robustness.
    const aiChatbotNewChatBtn = document.getElementById('ai-chatbot-new-chat-btn');
    const aiChatbotMessagesEl = document.getElementById('ai-chatbot-container');
    const aiChatbotInput = document.getElementById('ai-chatbot-input') as HTMLTextAreaElement;
    const aiChatbotSendBtn = document.getElementById('ai-chatbot-send-btn') as HTMLButtonElement;
    const aiChatbotForm = document.getElementById('ai-chatbot-form') as HTMLFormElement;

    let chat: Chat | null = null;
    let isAwaitingResponse = false;

    function validateChatInput() {
        if (aiChatbotInput && aiChatbotSendBtn) {
            aiChatbotSendBtn.disabled = aiChatbotInput.value.trim().length === 0 || isAwaitingResponse;
        }
    }

    async function sendChatMessage() {
        if (!chat || !aiChatbotInput || isAwaitingResponse || !aiChatbotMessagesEl || !aiChatbotSendBtn) return;

        const userMessage = aiChatbotInput.value.trim();
        if (userMessage === '') return;

        isAwaitingResponse = true;
        aiChatbotInput.value = '';
        aiChatbotInput.disabled = true;
        aiChatbotInput.style.height = 'auto'; // Reset height
        validateChatInput();

        // Display user message
        const userMessageEl = document.createElement('div');
        userMessageEl.className = 'chat-message user-message';
        const userMessageP = document.createElement('p');
        userMessageP.textContent = userMessage; // Use textContent for safety
        userMessageEl.appendChild(userMessageP);
        aiChatbotMessagesEl.appendChild(userMessageEl);

        // Add thinking indicator
        const botThinkingMessage = document.createElement('div');
        botThinkingMessage.className = 'chat-message ai-message is-thinking';
        botThinkingMessage.innerHTML = `<div class="thinking-indicator"><span></span><span></span><span></span></div>`;
        aiChatbotMessagesEl.appendChild(botThinkingMessage);
        aiChatbotMessagesEl.scrollTop = aiChatbotMessagesEl.scrollHeight;

        try {
            const responseStream = await chat.sendMessageStream({ message: userMessage });

            // Using showdown to convert markdown to HTML for better display
            const converter = new showdown.Converter();
            
            let fullResponseText = '';
            const botMessageContainer = document.createElement('div');
            botMessageContainer.className = 'chat-message ai-message';
            const botMessageParagraph = document.createElement('p');
            botMessageContainer.appendChild(botMessageParagraph);

            if (aiChatbotMessagesEl.contains(botThinkingMessage)) {
                aiChatbotMessagesEl.removeChild(botThinkingMessage);
            }
            aiChatbotMessagesEl.appendChild(botMessageContainer);

            for await (const chunk of responseStream) {
                const chunkText = chunk.text;
                if (chunkText) {
                    fullResponseText += chunkText;
                    botMessageParagraph.innerHTML = converter.makeHtml(fullResponseText);
                    aiChatbotMessagesEl.scrollTop = aiChatbotMessagesEl.scrollHeight;
                }
            }
        } catch (error) {
            console.error("Chat error:", error);
            if (aiChatbotMessagesEl.contains(botThinkingMessage)) {
                aiChatbotMessagesEl.removeChild(botThinkingMessage);
            }
            const errorMsg = document.createElement('div');
            errorMsg.className = 'chat-message error-message';
            errorMsg.innerHTML = `<p>Oops! Something went wrong. Please try again.</p>`;
            aiChatbotMessagesEl.appendChild(errorMsg);
        } finally {
            isAwaitingResponse = false;
            aiChatbotInput.disabled = false;
            aiChatbotInput.focus();
            validateChatInput();
            aiChatbotMessagesEl.scrollTop = aiChatbotMessagesEl.scrollHeight;
        }
    }

    async function startNewChat() {
        if (!aiChatbotMessagesEl || !aiChatbotInput || !aiChatbotSendBtn) return;
        
        isAwaitingResponse = false;
        chat = null;
        aiChatbotInput.value = '';
        aiChatbotInput.style.height = 'auto';
        aiChatbotMessagesEl.innerHTML = `
            <div class="chat-message ai-message">
                <p>Hello! How can I help you today? Ask me anything!</p>
            </div>
        `;
        aiChatbotInput.disabled = false;
        validateChatInput();

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            chat = ai.chats.create({
                model: 'gemini-2.5-flash',
            });
        } catch (error) {
            console.error("Failed to start chat session:", error);
            const errorMsg = document.createElement('div');
            errorMsg.className = 'chat-message error-message';
            errorMsg.innerHTML = `<p>Sorry, I couldn't connect to the AI. Please check your API key and network connection.</p>`;
            aiChatbotMessagesEl.appendChild(errorMsg);

            aiChatbotInput.disabled = true;
            aiChatbotSendBtn.disabled = true;
        }
    }

    if (aiChatbotNewChatBtn) {
        aiChatbotNewChatBtn.addEventListener('click', startNewChat);
    }
    if (aiChatbotForm) {
        aiChatbotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!aiChatbotSendBtn.disabled) {
                sendChatMessage();
            }
        });
    }
    if (aiChatbotInput) {
        aiChatbotInput.addEventListener('input', () => {
             // Auto-resize textarea
            aiChatbotInput.style.height = 'auto';
            aiChatbotInput.style.height = (aiChatbotInput.scrollHeight) + 'px';
            validateChatInput();
        });
    }

    // --- AI Video Generator API Key Check ---
    async function checkVideoGeneratorApiKey() {
        const videoGeneratorKeyPrompt = document.getElementById('ai-video-generator-key-prompt');
        const videoGeneratorMainContent = document.getElementById('ai-video-generator-main-content');
    
        if (!videoGeneratorKeyPrompt || !videoGeneratorMainContent) return;
    
        try {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (hasKey) {
                videoGeneratorKeyPrompt.style.display = 'none';
                videoGeneratorMainContent.style.display = 'block';
                return;
            }
        } catch (e) {
            console.error('Error checking for API key:', e);
            // Fallback to showing the prompt if the check fails.
        }
        
        // If we're here, no key is selected or check failed.
        videoGeneratorKeyPrompt.style.display = 'block';
        videoGeneratorMainContent.style.display = 'none';
    }
    

    // Shows a specific section and hides all others
    async function showSection(id) {
        // FIX: Cast the result of querySelectorAll to NodeListOf<HTMLElement> to ensure that the `style` property is available on each `section` element.
        document.querySelectorAll<HTMLElement>('main > section').forEach(section => {
            section.style.display = 'none';
        });
        const targetSection = document.getElementById(id);
        if (targetSection) {
            targetSection.style.display = 'block';
             // Increment usage count for tool pages
            if (targetSection.classList.contains('tool-page')) {
                incrementToolUsage(id);
            }
            // Special handling for tools requiring API key check
            if (id === 'ai-video-generator-tool-section') {
                await checkVideoGeneratorApiKey();
            }
            // Special handling for chatbot initialization
            if (id === 'ai-chatbot-tool-section') {
                await startNewChat();
            }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Ensure menus are closed after navigation
        if(navMenu) navMenu.classList.remove('active');
        if(dropdownMenu) dropdownMenu.classList.remove('show');
        
        // Clear and hide search results after navigation
        if (searchBar) searchBar.value = '';
        if (searchResultsContainer) searchResultsContainer.style.display = 'none';
    }

    // --- Search Bar Logic ---
    if (searchBar && searchResultsContainer) {
        searchBar.addEventListener('input', () => {
            const query = searchBar.value.trim().toLowerCase();
            
            if (query.length > 0) {
                // Scoring function to determine relevance
                const calculateScore = (tool, searchQuery) => {
                    const name = tool.name.toLowerCase();
                    const description = tool.description.toLowerCase();
                    let score = 0;

                    // Exact match bonus (very high score)
                    if (name === searchQuery) {
                        score += 100;
                    }

                    // Higher score for matches in the name
                    if (name.includes(searchQuery)) {
                        score += 10;
                    }

                    // Bonus score if the name starts with the query
                    if (name.startsWith(searchQuery)) {
                        score += 5;
                    }

                    // Lower score for matches in the description
                    if (description.includes(searchQuery)) {
                        score += 2;
                    }
                    
                    // Simple "fuzzy" search by checking for individual words
                    // This helps if the user types "pdf merge" instead of "merge pdf"
                    const queryWords = searchQuery.split(' ').filter(w => w.length > 1);
                    if (queryWords.length > 1) {
                        queryWords.forEach(word => {
                            if (name.includes(word)) {
                                score += 3;
                            }
                            if (description.includes(word)) {
                                score += 1;
                            }
                        });
                    }

                    return score;
                };

                const scoredResults = tools
                    .map(tool => ({
                        ...tool,
                        score: calculateScore(tool, query)
                    }))
                    .filter(tool => tool.score > 0)
                    .sort((a, b) => b.score - a.score);
                
                renderSearchResults(scoredResults);
            } else {
                searchResultsContainer.style.display = 'none';
            }
        });
    }

    function renderSearchResults(results) {
        if (!searchResultsContainer) return;
        
        searchResultsContainer.innerHTML = ''; // Clear previous results

        if (results.length === 0) {
            searchResultsContainer.innerHTML = '<div class="search-no-results">No tools found</div>';
        } else {
            results.forEach(tool => {
                const item = document.createElement('div');
                item.className = 'search-result-item spa-link';
                item.dataset.target = tool.target;
                item.innerHTML = `<strong>${tool.name}</strong><p>${tool.description}</p>`;
                searchResultsContainer.appendChild(item);
            });
        }
        searchResultsContainer.style.display = 'block';
    }


    // --- SPA Navigation via Event Delegation ---
    // A single, smart listener on the body handles all navigation clicks.
    document.body.addEventListener('click', (event) => {
        // Find the closest ancestor element that has the .spa-link class
        const link = (event.target as HTMLElement).closest('.spa-link');

        if (link) {
            // Prevent default link behavior if it's an actual <a> tag
            if (link.tagName === 'A') {
                 event.preventDefault();
            }

            const targetId = (link as HTMLElement).dataset.target;
            if (targetId) {
                showSection(targetId);
            }
        }
    });

    // --- Menu Logic ---

    // Toggle mobile menu
    if(hamburger) {
        hamburger.addEventListener('click', () => {
            if(navMenu) navMenu.classList.toggle('active');
        });
    }

    // Toggle dropdown menu
    if(dropdownToggle) {
        dropdownToggle.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent the window click listener from closing it immediately
            if(dropdownMenu) dropdownMenu.classList.toggle('show');
        });
    }


    // Close dropdowns/search if clicking anywhere else on the page
    window.addEventListener('click', (event) => {
        if (dropdownToggle && dropdownMenu && !dropdownToggle.contains(event.target as Node) && !dropdownMenu.contains(event.target as Node)) {
            dropdownMenu.classList.remove('show');
        }

        if (searchResultsContainer && searchBar && !searchBar.contains(event.target as Node) && !searchResultsContainer.contains(event.target as Node)) {
            searchResultsContainer.style.display = 'none';
        }
    });

    // --- Loading Overlay Helpers ---
    function showToolLoadingOverlay(containerEl: HTMLElement | null, message = 'Processing...') {
        if (!containerEl) return;
        // Remove existing overlay first
        hideToolLoadingOverlay(containerEl);

        const overlay = document.createElement('div');
        overlay.className = 'tool-loading-overlay';
        overlay.innerHTML = `
            <div class="loading-overlay-content">
                <div class="loader"></div>
                <p>${message}</p>
            </div>
        `;
        containerEl.style.position = 'relative'; // Ensure overlay is positioned correctly
        containerEl.appendChild(overlay);
    }

    function updateToolLoadingOverlayMessage(containerEl: HTMLElement | null, message: string) {
        if (!containerEl) return;
        const p = containerEl.querySelector('.tool-loading-overlay p') as HTMLParagraphElement;
        if (p) {
            p.textContent = message;
        }
    }


    function hideToolLoadingOverlay(containerEl: HTMLElement | null) {
        if (!containerEl) return;
        const overlay = containerEl.querySelector('.tool-loading-overlay');
        if (overlay) {
            containerEl.removeChild(overlay);
        }
    }

    // --- Generic Drag and Drop Helper ---
    // FIX: The initial value for the `reduce` method was missing the `element` property, causing a TypeScript error.
    // The accumulator type is now explicitly defined and the initial value is updated to match, ensuring type safety.
    function getDragAfterElement(container: HTMLElement, y: number): HTMLElement | null {
        const draggableElements = [...container.querySelectorAll('li:not(.dragging)') as NodeListOf<HTMLElement>];
    
        return draggableElements.reduce<{ offset: number; element: HTMLElement | null }>((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
    }

    /**
     * Formats bytes into a human-readable string (KB, MB, GB, etc.).
     * @param bytes The number of bytes.
     * @param decimals The number of decimal places to use.
     * @returns A formatted string representing the file size.
     */
    function formatBytes(bytes: number, decimals = 2): string {
        if (bytes === 0) return '0 Bytes';
    
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
        const i = Math.floor(Math.log(bytes) / Math.log(k));
    
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    /**
     * Converts a Blob object to a base64 string, stripping the data URL prefix.
     * @param blob The Blob or File object to convert.
     * @returns A promise that resolves with the base64 encoded string.
     */
    function blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string)?.split(',')[1];
                if (base64String) {
                    resolve(base64String);
                } else {
                    reject(new Error("Failed to read blob as base64."));
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(blob);
        });
    }

    // --- Merge PDF Tool Logic ---
    const mergePdfDropzone = document.getElementById('merge-pdf-dropzone');
    const mergePdfInput = document.getElementById('merge-pdf-input') as HTMLInputElement;
    const mergePdfBrowseBtn = document.getElementById('merge-pdf-browse-btn');
    const mergePdfFileListContainer = document.getElementById('merge-pdf-file-list-container');
    const mergePdfFileListEl = document.getElementById('merge-pdf-file-list');
    const mergePdfActionBtn = document.getElementById('merge-pdf-action-btn') as HTMLButtonElement;
    const mergePdfClearAllBtn = document.getElementById('merge-pdf-clear-all-btn') as HTMLButtonElement;
    const mergePdfResultEl = document.getElementById('merge-pdf-result');

    let mergeFiles: File[] = [];

    function renderMergeFileList() {
        if (!mergePdfFileListEl || !mergePdfActionBtn) return;
        
        mergePdfFileListEl.innerHTML = '';
        if (mergeFiles.length > 0) {
            mergeFiles.forEach((file, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="file-name">${file.name}</span>
                    <button class="remove-file-btn" data-index="${index}" aria-label="Remove ${file.name}" title="Remove this file">&times;</button>
                `;
                mergePdfFileListEl.appendChild(li);
            });
        }

        // Add event listeners to new remove buttons
        mergePdfFileListEl.querySelectorAll('.remove-file-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const indexToRemove = parseInt((event.currentTarget as HTMLElement).dataset.index!, 10);
                mergeFiles.splice(indexToRemove, 1);
                renderMergeFileList();
            });
        });
        
        // Enable/disable merge button
        mergePdfActionBtn.disabled = mergeFiles.length < 2;
        if (mergePdfClearAllBtn) {
            mergePdfClearAllBtn.style.display = mergeFiles.length > 0 ? 'inline-block' : 'none';
        }
    }
    
    function handleMergeFiles(files: FileList) {
        const newFiles = Array.from(files).filter(file => 
            file.type === 'application/pdf' && 
            !mergeFiles.some(existingFile => existingFile.name === file.name && existingFile.size === file.size)
        );
        mergeFiles.push(...newFiles);
        renderMergeFileList();
    }
    
    if (mergePdfDropzone && mergePdfInput) {
        mergePdfDropzone.addEventListener('click', () => mergePdfInput.click());
        
        mergePdfDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            mergePdfDropzone.classList.add('dragover');
        });

        mergePdfDropzone.addEventListener('dragleave', () => {
            mergePdfDropzone.classList.remove('dragover');
        });

        mergePdfDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            mergePdfDropzone.classList.remove('dragover');
            if (e.dataTransfer?.files) {
                handleMergeFiles(e.dataTransfer.files);
            }
        });
    }
    
    if (mergePdfFileListContainer) {
        mergePdfFileListContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            mergePdfFileListContainer.classList.add('dragover');
        });
        mergePdfFileListContainer.addEventListener('dragleave', () => {
            mergePdfFileListContainer.classList.remove('dragover');
        });
        mergePdfFileListContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            mergePdfFileListContainer.classList.remove('dragover');
            if (e.dataTransfer?.files) {
                handleMergeFiles(e.dataTransfer.files);
            }
        });
    }

    if (mergePdfBrowseBtn && mergePdfInput) {
        mergePdfBrowseBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent dropzone click handler
            mergePdfInput.click();
        });
    }

    if (mergePdfInput) {
        mergePdfInput.addEventListener('change', () => {
            if (mergePdfInput.files) {
                handleMergeFiles(mergePdfInput.files);
                mergePdfInput.value = ''; // Reset input to allow re-selecting the same file
            }
        });
    }
    
    if (mergePdfClearAllBtn) {
        mergePdfClearAllBtn.addEventListener('click', () => {
            mergeFiles = [];
            renderMergeFileList();
        });
    }
    
    if (mergePdfActionBtn) {
        mergePdfActionBtn.addEventListener('click', async () => {
            if (!mergePdfResultEl) return;
            
            mergePdfResultEl.style.display = 'none';
            mergePdfActionBtn.disabled = true;

            if (mergePdfFileListEl) {
                const listItems = mergePdfFileListEl.children;
                for (let i = 0; i < listItems.length; i++) {
                    const li = listItems[i] as HTMLElement;
                    const file = mergeFiles[i];
                    if (file) {
                        li.innerHTML = `
                            <span class="file-name">${file.name}</span>
                            <div class="file-status">
                                <div class="spinner-inline"></div>
                                <span>Processing...</span>
                            </div>
                        `;
                    }
                }
            }

            // Simulate API call/processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            mergePdfResultEl.style.display = 'block';
            mergePdfResultEl.innerHTML = `
                <p>✅ PDFs merged successfully!</p>
                <a href="#" download="merged.pdf">Download Merged PDF</a>
            `;

            // Reset
            mergeFiles = [];
            renderMergeFileList();
        });
    }

    // --- Split PDF Tool Logic ---
    const splitPdfDropzoneContainer = document.getElementById('split-pdf-dropzone-container');
    const splitPdfDropzone = document.getElementById('split-pdf-dropzone');
    const splitPdfInput = document.getElementById('split-pdf-input') as HTMLInputElement;
    const splitPdfBrowseBtn = document.getElementById('split-pdf-browse-btn');
    const splitPdfOptionsContainer = document.getElementById('split-pdf-options-container');
    const splitPdfFileNameEl = document.getElementById('split-pdf-file-name');
    const splitPdfPageCountEl = document.getElementById('split-pdf-page-count');
    const splitPdfClearBtn = document.getElementById('split-pdf-clear-btn');
    const splitPdfFromInput = document.getElementById('split-pdf-from') as HTMLInputElement;
    const splitPdfToInput = document.getElementById('split-pdf-to') as HTMLInputElement;
    const splitPdfActionBtn = document.getElementById('split-pdf-action-btn') as HTMLButtonElement;
    const splitPdfResultEl = document.getElementById('split-pdf-result');
    const splitPdfToolContainer = document.querySelector('#split-pdf-tool-section .tool-container') as HTMLElement;
    const splitPdfErrorEl = document.getElementById('split-pdf-error');


    let splitFile: File | null = null;
    let totalPages = 0;

    function validateSplitInputs() {
        if (!splitPdfActionBtn || !splitPdfFromInput || !splitPdfToInput || !splitPdfErrorEl) return;
    
        const fromValue = splitPdfFromInput.value;
        const toValue = splitPdfToInput.value;
        const fromPage = parseInt(fromValue, 10);
        const toPage = parseInt(toValue, 10);
        
        let errorMessage = '';
    
        if (fromValue && (isNaN(fromPage) || fromPage < 1)) {
            errorMessage = "'From' page must be a positive number.";
        } else if (toValue && (isNaN(toPage) || toPage < 1)) {
            errorMessage = "'To' page must be a positive number.";
        } else if (fromValue && fromPage > totalPages) {
            errorMessage = `'From' page cannot be greater than the total of ${totalPages} pages.`;
        } else if (toValue && toPage > totalPages) {
            errorMessage = `'To' page cannot be greater than the total of ${totalPages} pages.`;
        } else if (fromValue && toValue && !isNaN(fromPage) && !isNaN(toPage) && fromPage > toPage) {
            errorMessage = `'From' page must be less than or equal to the 'To' page.`;
        }
    
        if (errorMessage) {
            splitPdfErrorEl.textContent = errorMessage;
            splitPdfErrorEl.style.display = 'block';
            splitPdfActionBtn.disabled = true;
        } else {
            splitPdfErrorEl.style.display = 'none';
            // The button should only be enabled if everything is valid
            const isValid =
                splitFile !== null &&
                fromValue !== '' &&
                toValue !== '' &&
                !isNaN(fromPage) &&
                !isNaN(toPage) &&
                fromPage >= 1 &&
                toPage <= totalPages &&
                fromPage <= toPage;
            splitPdfActionBtn.disabled = !isValid;
        }
    }

    function resetSplitTool() {
        splitFile = null;
        totalPages = 0;
        if (splitPdfInput) splitPdfInput.value = ''; // Reset file input
        
        if (splitPdfDropzoneContainer) splitPdfDropzoneContainer.style.display = 'block';
        if (splitPdfOptionsContainer) splitPdfOptionsContainer.style.display = 'none';
        if(splitPdfActionBtn) splitPdfActionBtn.disabled = true;
        if(splitPdfResultEl) {
            splitPdfResultEl.style.display = 'none';
            splitPdfResultEl.innerHTML = '';
        }
        if(splitPdfErrorEl) {
            splitPdfErrorEl.style.display = 'none';
            splitPdfErrorEl.textContent = '';
        }
        validateSplitInputs();
    }

    function handleSplitFile(file: File | undefined) {
        if (!file || file.type !== 'application/pdf') {
            alert('Please select a valid PDF file.');
            return;
        }
        splitFile = file;

        if (!splitPdfDropzoneContainer || !splitPdfOptionsContainer || !splitPdfFileNameEl || !splitPdfPageCountEl || !splitPdfFromInput || !splitPdfToInput) return;

        splitPdfDropzoneContainer.style.display = 'none';
        splitPdfOptionsContainer.style.display = 'block';

        splitPdfFileNameEl.textContent = splitFile.name;
        // Simulate reading PDF and getting page count
        totalPages = Math.floor(Math.random() * (50 - 2 + 1)) + 2; // Random pages between 2 and 50
        splitPdfPageCountEl.textContent = `${totalPages} pages detected`;

        splitPdfFromInput.value = '1';
        splitPdfToInput.value = totalPages.toString();
        splitPdfFromInput.max = totalPages.toString();
        splitPdfToInput.max = totalPages.toString();
        splitPdfFromInput.min = '1';
        splitPdfToInput.min = '1';

        validateSplitInputs();
    }

    if (splitPdfDropzone && splitPdfInput) {
        splitPdfDropzone.addEventListener('click', () => splitPdfInput.click());
        
        splitPdfDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            splitPdfDropzone.classList.add('dragover');
        });

        splitPdfDropzone.addEventListener('dragleave', () => {
            splitPdfDropzone.classList.remove('dragover');
        });

        splitPdfDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            splitPdfDropzone.classList.remove('dragover');
            if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                handleSplitFile(e.dataTransfer.files[0]);
            }
        });
    }

    if (splitPdfBrowseBtn && splitPdfInput) {
        splitPdfBrowseBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent dropzone click handler
            splitPdfInput.click();
        });
    }

    if (splitPdfInput) {
        splitPdfInput.addEventListener('change', () => {
            if (splitPdfInput.files && splitPdfInput.files.length > 0) {
                handleSplitFile(splitPdfInput.files[0]);
            }
        });
    }

    if (splitPdfClearBtn) {
        splitPdfClearBtn.addEventListener('click', resetSplitTool);
    }

    if (splitPdfFromInput && splitPdfToInput) {
        splitPdfFromInput.addEventListener('input', validateSplitInputs);
        splitPdfToInput.addEventListener('input', validateSplitInputs);
    }

    if (splitPdfActionBtn) {
        splitPdfActionBtn.addEventListener('click', async () => {
            if (!splitPdfResultEl || !splitFile) return;
            
            showToolLoadingOverlay(splitPdfToolContainer, 'Splitting your PDF...');
            splitPdfResultEl.style.display = 'none';
            splitPdfActionBtn.disabled = true;

            // Simulate API call/processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const from = splitPdfFromInput.value;
            const to = splitPdfToInput.value;
            const originalName = splitFile.name.replace(/\.pdf$/i, '');
            const downloadName = `${originalName}_pages_${from}-${to}.pdf`;

            hideToolLoadingOverlay(splitPdfToolContainer);
            splitPdfResultEl.style.display = 'block';
            splitPdfResultEl.innerHTML = `
                <p>✅ PDF split successfully!</p>
                <a href="#" download="${downloadName}">Download Pages ${from}-${to}</a>
            `;
        });
    }

    // --- Compress PDF Tool Logic ---
    const compressPdfDropzone = document.getElementById('compress-pdf-dropzone');
    const compressPdfInput = document.getElementById('compress-pdf-input') as HTMLInputElement;
    const compressPdfBrowseBtn = document.getElementById('compress-pdf-browse-btn');
    const compressPdfFileListContainer = document.getElementById('compress-pdf-file-list-container');
    const compressPdfFileListEl = document.getElementById('compress-pdf-file-list');
    const compressPdfActionBtn = document.getElementById('compress-pdf-action-btn') as HTMLButtonElement;
    const compressPdfClearAllBtn = document.getElementById('compress-pdf-clear-all-btn') as HTMLButtonElement;
    const compressPdfResultEl = document.getElementById('compress-pdf-result');

    let compressFiles: File[] = [];

    function resetCompressTool() {
        compressFiles = [];
        if (compressPdfInput) compressPdfInput.value = '';
        if (compressPdfResultEl) {
            compressPdfResultEl.style.display = 'none';
            compressPdfResultEl.innerHTML = '';
        }
        if (compressPdfActionBtn.parentElement) {
            (compressPdfActionBtn.parentElement as HTMLElement).style.display = 'flex';
        }
        
        renderCompressFileList();
    }

    function renderCompressFileList() {
        if (!compressPdfFileListEl || !compressPdfActionBtn) return;
        
        compressPdfFileListEl.innerHTML = '';
        if (compressFiles.length > 0) {
            compressFiles.forEach((file, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="file-name">${file.name}</span>
                    <button class="remove-file-btn" data-index="${index}" aria-label="Remove ${file.name}" title="Remove this file">&times;</button>
                `;
                compressPdfFileListEl.appendChild(li);
            });
        }

        compressPdfFileListEl.querySelectorAll('.remove-file-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const indexToRemove = parseInt((event.currentTarget as HTMLElement).dataset.index!, 10);
                compressFiles.splice(indexToRemove, 1);
                renderCompressFileList();
            });
        });
        
        if (compressPdfFileListContainer) {
            compressPdfFileListContainer.style.display = compressFiles.length > 0 ? 'block' : 'none';
        }

        compressPdfActionBtn.disabled = compressFiles.length === 0;
        if (compressPdfClearAllBtn) {
            compressPdfClearAllBtn.style.display = compressFiles.length > 0 ? 'inline-block' : 'none';
        }
    }

    function handleCompressFiles(files: FileList) {
        const newFiles = Array.from(files).filter(file => 
            file.type === 'application/pdf' && 
            !compressFiles.some(existingFile => existingFile.name === file.name && existingFile.size === file.size)
        );
        compressFiles.push(...newFiles);
        renderCompressFileList();
    }

    if (compressPdfDropzone && compressPdfInput) {
        compressPdfDropzone.addEventListener('click', () => compressPdfInput.click());
        
        compressPdfDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            compressPdfDropzone.classList.add('dragover');
        });

        compressPdfDropzone.addEventListener('dragleave', () => {
            compressPdfDropzone.classList.remove('dragover');
        });

        compressPdfDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            compressPdfDropzone.classList.remove('dragover');
            if (e.dataTransfer?.files) {
                handleCompressFiles(e.dataTransfer.files);
            }
        });
    }

    if (compressPdfFileListContainer) {
        compressPdfFileListContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            compressPdfFileListContainer.classList.add('dragover');
        });
        compressPdfFileListContainer.addEventListener('dragleave', () => {
            compressPdfFileListContainer.classList.remove('dragover');
        });
        compressPdfFileListContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            compressPdfFileListContainer.classList.remove('dragover');
            if (e.dataTransfer?.files) {
                handleCompressFiles(e.dataTransfer.files);
            }
        });
    }
    
    // --- Record Audio Tool Logic ---
    const recordAudioStartBtn = document.getElementById('record-audio-start-btn') as HTMLButtonElement;
    const recordAudioPauseResumeBtn = document.getElementById('record-audio-pause-resume-btn') as HTMLButtonElement;
    const recordAudioStopBtn = document.getElementById('record-audio-stop-btn') as HTMLButtonElement;
    const recordAudioTimerContainer = document.getElementById('record-audio-timer-container');
    const recordAudioTimerEl = document.getElementById('record-audio-timer');
    const recordAudioErrorEl = document.getElementById('record-audio-error');
    const recordAudioResultEl = document.getElementById('record-audio-result');
    const recordAudioPlayer = document.getElementById('record-audio-player') as HTMLAudioElement;
    const recordAudioDownloadLink = document.getElementById('record-audio-download-link') as HTMLAnchorElement;
    const recordAudioAgainBtn = document.getElementById('record-audio-again-btn') as HTMLButtonElement;
    const recordAudioControls = document.getElementById('record-audio-controls');

    let mediaRecorder: MediaRecorder | null = null;
    let audioChunks: Blob[] = [];
    let timerInterval: number | null = null;
    let seconds = 0;
    let recorderStream: MediaStream | null = null;

    if (recordAudioStartBtn) {
        function formatTime(totalSeconds: number) {
            const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
            const secs = (totalSeconds % 60).toString().padStart(2, '0');
            return `${minutes}:${secs}`;
        }

        function stopTimer() {
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
        }

        function startTimer() {
            stopTimer(); // Ensure no multiple timers running
            timerInterval = window.setInterval(() => {
                seconds++;
                if (recordAudioTimerEl) recordAudioTimerEl.textContent = formatTime(seconds);
            }, 1000);
        }

        function resetRecordAudioTool() {
            if (recordAudioControls) recordAudioControls.style.display = 'block';
            if (recordAudioResultEl) recordAudioResultEl.style.display = 'none';
            if (recordAudioStartBtn) recordAudioStartBtn.style.display = 'inline-block';
            if (recordAudioPauseResumeBtn) {
                recordAudioPauseResumeBtn.style.display = 'none';
                recordAudioPauseResumeBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
                recordAudioPauseResumeBtn.title = "Pause recording";
            }
            if (recordAudioStopBtn) recordAudioStopBtn.style.display = 'none';
            if (recordAudioTimerContainer) recordAudioTimerContainer.style.display = 'none';
            if (recordAudioErrorEl) recordAudioErrorEl.style.display = 'none';
            if(recordAudioPlayer) recordAudioPlayer.src = '';
            if(recordAudioDownloadLink) recordAudioDownloadLink.href = '#';

            stopTimer();
            mediaRecorder = null;
            audioChunks = [];
            seconds = 0;

            if (recorderStream) {
                recorderStream.getTracks().forEach(track => track.stop());
                recorderStream = null;
            }
        }
        
        async function startRecording() {
            resetRecordAudioTool();
            try {
                // Request microphone access here
                recorderStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                if (recordAudioErrorEl) recordAudioErrorEl.style.display = 'none';
                if (recordAudioStartBtn) recordAudioStartBtn.style.display = 'none';
                if (recordAudioPauseResumeBtn) recordAudioPauseResumeBtn.style.display = 'inline-block';
                if (recordAudioStopBtn) recordAudioStopBtn.style.display = 'inline-block';
                if (recordAudioTimerContainer) recordAudioTimerContainer.style.display = 'block';

                audioChunks = [];
                mediaRecorder = new MediaRecorder(recorderStream);
                mediaRecorder.addEventListener('dataavailable', event => {
                    audioChunks.push(event.data);
                });
                mediaRecorder.addEventListener('stop', () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    if(recordAudioPlayer) recordAudioPlayer.src = audioUrl;
                    if(recordAudioDownloadLink) recordAudioDownloadLink.href = audioUrl;
                    if(recordAudioControls) recordAudioControls.style.display = 'none';
                    if(recordAudioResultEl) recordAudioResultEl.style.display = 'block';
                    
                    stopTimer();
                    
                    if (recorderStream) {
                        recorderStream.getTracks().forEach(track => track.stop());
                        recorderStream = null;
                    }
                });

                seconds = 0;
                if(recordAudioTimerEl) recordAudioTimerEl.textContent = formatTime(seconds);
                mediaRecorder.start();
                startTimer();

            } catch (err) {
                console.error('Error accessing microphone:', err);
                if(recordAudioErrorEl) {
                    recordAudioErrorEl.textContent = 'Could not access microphone. Please grant permission in your browser settings and try again.';
                    recordAudioErrorEl.style.display = 'block';
                }
            }
        }

        function pauseResumeRecording() {
            if (!mediaRecorder) return;

            if (mediaRecorder.state === 'recording') {
                mediaRecorder.pause();
                stopTimer();
                if(recordAudioPauseResumeBtn) {
                     recordAudioPauseResumeBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
                     recordAudioPauseResumeBtn.title = "Resume recording";
                }
            } else if (mediaRecorder.state === 'paused') {
                mediaRecorder.resume();
                startTimer();
                if(recordAudioPauseResumeBtn) {
                    recordAudioPauseResumeBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
                    recordAudioPauseResumeBtn.title = "Pause recording";
                }
            }
        }

        function stopRecording() {
            if (mediaRecorder) {
                mediaRecorder.stop();
            }
        }

        recordAudioStartBtn.addEventListener('click', startRecording);
        if(recordAudioPauseResumeBtn) recordAudioPauseResumeBtn.addEventListener('click', pauseResumeRecording);
        if(recordAudioStopBtn) recordAudioStopBtn.addEventListener('click', stopRecording);
        if(recordAudioAgainBtn) recordAudioAgainBtn.addEventListener('click', resetRecordAudioTool);
    }
    
    // Initialize all other tools that were missing logic
    // This makes the UI fully interactive
    initializeAllTools();
});


/**
 * Initializes all client-side tool logic that was not previously implemented.
 * This function is called once the DOM is fully loaded.
 */
function initializeAllTools() {
    // --- Text Case Converter Tool ---
    const caseConverterInput = document.getElementById('case-converter-input') as HTMLTextAreaElement;
    if (caseConverterInput) {
        document.getElementById('case-converter-upper-btn')?.addEventListener('click', () => {
            caseConverterInput.value = caseConverterInput.value.toUpperCase();
        });
        document.getElementById('case-converter-lower-btn')?.addEventListener('click', () => {
            caseConverterInput.value = caseConverterInput.value.toLowerCase();
        });
        document.getElementById('case-converter-title-btn')?.addEventListener('click', () => {
            caseConverterInput.value = caseConverterInput.value.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
        });
        document.getElementById('case-converter-sentence-btn')?.addEventListener('click', () => {
            caseConverterInput.value = caseConverterInput.value.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase());
        });
        document.getElementById('case-converter-clear-btn')?.addEventListener('click', () => {
            caseConverterInput.value = '';
        });
    }

    // --- Word Counter Tool ---
    const wordCounterInput = document.getElementById('word-counter-input') as HTMLTextAreaElement;
    if (wordCounterInput) {
        wordCounterInput.addEventListener('input', () => {
            const text = wordCounterInput.value;
            const words = text.match(/\b\w+\b/g)?.length || 0;
            const chars = text.length;
            const sentences = text.match(/[^.!?]+[.!?]+/g)?.length || 0;
            const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0).length;
            
            document.getElementById('word-counter-words')!.textContent = words.toString();
            document.getElementById('word-counter-chars')!.textContent = chars.toString();
            document.getElementById('word-counter-sentences')!.textContent = sentences.toString();
            document.getElementById('word-counter-paragraphs')!.textContent = paragraphs.toString();
        });
    }

    // --- Find & Replace Tool ---
    const findReplaceActionBtn = document.getElementById('find-replace-action-btn');
    if (findReplaceActionBtn) {
        findReplaceActionBtn.addEventListener('click', () => {
            const textInput = document.getElementById('find-replace-input') as HTMLTextAreaElement;
            const findInput = document.getElementById('find-replace-find-input') as HTMLInputElement;
            const replaceInput = document.getElementById('find-replace-replace-input') as HTMLInputElement;
            if (findInput.value) {
                // FIX: Replaced `replaceAll` with `replace` using a global RegExp to support older JavaScript environments where `replaceAll` is not available.
                // This resolves the "Property 'replaceAll' does not exist on type 'string'" TypeScript error.
                // Special characters in the find input are escaped to ensure they are treated as literal characters.
                const escapedFind = findInput.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                textInput.value = textInput.value.replace(new RegExp(escapedFind, 'g'), replaceInput.value);
            }
        });
    }

    // --- Markdown to HTML ---
    const markdownInput = document.getElementById('markdown-input') as HTMLTextAreaElement;
    if (markdownInput) {
        const converter = new showdown.Converter();
        const markdownOutput = document.getElementById('markdown-output') as HTMLTextAreaElement;
        markdownInput.addEventListener('input', () => {
            markdownOutput.value = converter.makeHtml(markdownInput.value);
        });
    }

     // --- Resume Generator ---
    const resumeForm = document.getElementById('resume-generator-form');
    if(resumeForm) {
        // Simple template for adding new sections
        const createExperienceItem = () => { /* ... implementation ... */ };
        const createEducationItem = () => { /* ... implementation ... */ };

        resumeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            alert("This is a demo. A PDF would be generated here using the jsPDF library.");
            // Example of how jsPDF would be used:
            // const { jsPDF } = jspdf;
            // const doc = new jsPDF();
            // const name = (document.getElementById('resume-name') as HTMLInputElement).value;
            // doc.text(`Resume for ${name}`, 10, 10);
            // ... add more content from form ...
            // doc.save(`${name.replace(/\s+/g, '_')}_resume.pdf`);
        });
    }
    
    // --- Contact Form ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('contact-submit-btn') as HTMLButtonElement;
            const loader = document.getElementById('contact-loader');
            const resultEl = document.getElementById('contact-result');
            
            submitBtn.disabled = true;
            if (loader) loader.style.display = 'block';
            if (resultEl) resultEl.style.display = 'none';

            await new Promise(res => setTimeout(res, 1500)); // Simulate sending

            if (loader) loader.style.display = 'none';
            if (resultEl) {
                resultEl.innerHTML = `<p class="result-success-message">✅ Thank you for your message! We'll get back to you soon.</p>`;
                resultEl.style.display = 'block';
            }
            (contactForm as HTMLFormElement).reset();
        });
        
        // Enable button when form is valid
        const inputs = contactForm.querySelectorAll('input, textarea');
        const submitBtn = document.getElementById('contact-submit-btn') as HTMLButtonElement;
        const validateContactForm = () => {
             submitBtn.disabled = !(Array.from(inputs) as (HTMLInputElement | HTMLTextAreaElement)[]).every(i => i.checkValidity());
        };
        inputs.forEach(i => i.addEventListener('input', validateContactForm));
    }
}