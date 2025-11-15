  /**
 * ============================================================================
 * ECODENQUE – DENGUE OUTBREAK ANALYSIS SYSTEM
 * Main JavaScript File - Prediction Calculations and UI Interactions
 * ============================================================================
 * 
 
/**
 * Formats a number with decimal places
 * @param {number} num - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number string
 */
function formatNumber(num, decimals = 2) {
    return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Validates if input is a valid positive number
 * @param {string} value - Input value to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && isFinite(num);
}

/**
 * Validates percentage input (0-100)
 * @param {string} value - Input value to validate
 * @returns {boolean} True if valid percentage, false otherwise
 */
function isValidPercentage(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 100 && isFinite(num);
}

/**
 * Validates drainage score input (1-5)
 * @param {string} value - Input value to validate
 * @returns {boolean} True if valid drainage score, false otherwise
 */
function isValidDrainageScore(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 1 && num <= 5 && isFinite(num);
}

// ============================================================================
// 3. CONSTANTS AND CONFIGURATION
// ============================================================================

// Formula constants for dengue case prediction
const FORMULA_CONSTANT = 260.819;
const WASTE_DISPOSAL_COEFFICIENT = -2.057;
const STAGNANT_WATER_COEFFICIENT = -0.194;
const DRAINAGE_COEFFICIENT = -1.318;
const TEMPERATURE_COEFFICIENT = -0.609;
const RAINFALL_COEFFICIENT = -0.222;
const CLEANUP_COEFFICIENT = -0.274;

// API base URL for backend requests
const API_BASE_URL = 'http://127.0.0.1:5000/api';

// ============================================================================
// 4. DOM ELEMENT REFERENCES
// ============================================================================

// Wait for DOM to load before getting elements
let form, predictBtn, resetBtn, downloadPdfBtn, copyClipboardBtn;
let resultsSection, riskIndicatorWrapper, riskBadge, riskLabel, riskIcon, riskTooltipText;
let exportButtonsWrapper, recommendationsSection, recommendationsLoading, recommendationsText;
let dengueCasesValue, dengueCasesValueOriginal;

// Initialize DOM elements when page loads
function initializeDOMElements() {
    form = document.getElementById('predictionForm');
    predictBtn = document.getElementById('predictBtn');
    resetBtn = document.getElementById('resetBtn');
    downloadPdfBtn = document.getElementById('downloadPdfBtn');
    copyClipboardBtn = document.getElementById('copyClipboardBtn');
    
    resultsSection = document.getElementById('resultsSection');
    riskIndicatorWrapper = document.getElementById('riskIndicatorWrapper');
    riskBadge = document.getElementById('riskBadge');
    riskLabel = document.getElementById('riskLabel');
    riskIcon = document.getElementById('riskIcon');
    riskTooltipText = document.getElementById('riskTooltipText');
    
    exportButtonsWrapper = document.getElementById('exportButtonsWrapper');
    recommendationsSection = document.getElementById('recommendationsSection');
    recommendationsLoading = document.getElementById('recommendationsLoading');
    recommendationsText = document.getElementById('recommendationsText');
    
    dengueCasesValue = document.getElementById('dengueCasesValue');
    dengueCasesValueOriginal = document.getElementById('dengueCasesValueOriginal');
}

// ============================================================================
// 5. CORE CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculates predicted number of dengue cases using the formula:
 * No. of Dengue Cases = 260.819 - 2.057(W) - 0.194(F) - 1.318(D) - 0.609(T) - 0.222(R) - 0.274(U)
 * 
 * @param {number} wasteDisposal - % of Houses with Proper Waste Disposal (W)
 * @param {number} stagnantWater - % of Houses Free of Stagnant Water (F)
 * @param {number} drainageScore - Drainage Score (D)
 * @param {number} temperature - Temperature in °C (T)
 * @param {number} rainfall - Rainfall (Number of Rainy Days) (R)
 * @param {number} cleanupScore - Community Clean-Up Drive Frequency (U)
 * @returns {number} Predicted number of dengue cases
 */
function calculateDengueCases(wasteDisposal, stagnantWater, drainageScore, temperature, rainfall, cleanupScore) {
    // Ensure inputs are numbers
    const W = parseFloat(wasteDisposal) || 0;
    const F = parseFloat(stagnantWater) || 0;
    const D = parseFloat(drainageScore) || 1; // Default to 1 for drainage score (range 1-5)
    const T = parseFloat(temperature) || 0;
    const R = parseFloat(rainfall) || 0;
    const U = parseFloat(cleanupScore) || 0;
    
    // Apply the formula
    const dengueCases = FORMULA_CONSTANT 
        + (WASTE_DISPOSAL_COEFFICIENT * W)
        + (STAGNANT_WATER_COEFFICIENT * F)
        + (DRAINAGE_COEFFICIENT * D)
        + (TEMPERATURE_COEFFICIENT * T)
        + (RAINFALL_COEFFICIENT * R)
        + (CLEANUP_COEFFICIENT * U);
    
    // Ensure non-negative result (dengue cases cannot be negative)
    return Math.max(0, dengueCases);
}

// ============================================================================
// 6. UI UPDATE FUNCTIONS
// ============================================================================

/**
 * Determines risk level based on predicted dengue cases
 * @param {number} dengueCases - Predicted number of dengue cases
 * @returns {Object} Risk level object with label, color, icon, and description
 */
function getRiskLevel(dengueCases) {
    if (dengueCases < 20) {
        return {
            label: 'Low',
            color: '#10b981', // green
            icon: '✅',
            description: 'Low: Minimal outbreak risk. Continue monitoring and preventive measures.',
            class: 'risk-low'
        };
    } else if (dengueCases >= 20 && dengueCases <= 50) {
        return {
            label: 'Moderate',
            color: '#f59e0b', // yellow/orange
            icon: '⚠️',
            description: 'Moderate: Increased risk detected. Enhanced preventive actions recommended.',
            class: 'risk-moderate'
        };
    } else {
        return {
            label: 'High',
            color: '#ef4444', // red
            icon: '🚨',
            description: 'High: Immediate action required. Significant outbreak risk detected.',
            class: 'risk-high'
        };
    }
}

/**
 * Updates the risk indicator badge
 * @param {number} dengueCases - Predicted number of dengue cases
 */
function updateRiskIndicator(dengueCases) {
    const risk = getRiskLevel(dengueCases);
    
    // Update badge appearance
    riskBadge.className = `risk-badge ${risk.class}`;
    riskBadge.style.backgroundColor = risk.color;
    riskLabel.textContent = risk.label;
    riskIcon.textContent = risk.icon;
    riskTooltipText.textContent = risk.description;
    
    // Update risk card icon
    const riskCardIconElement = document.getElementById('riskCardIcon');
    if (riskCardIconElement) {
        riskCardIconElement.textContent = risk.icon;
    }
    
    // Ensure risk indicator is always visible when results are shown - use flex for proper layout
    riskIndicatorWrapper.style.display = 'flex';
    riskIndicatorWrapper.style.visibility = 'visible';
    riskIndicatorWrapper.style.opacity = '1';
    riskIndicatorWrapper.style.flexDirection = 'column';
    riskIndicatorWrapper.style.justifyContent = 'center';
    
    // Animate the badge appearance
    setTimeout(() => {
        riskBadge.style.animation = 'riskBadgePopIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }, 100);
}

/**
 * Updates the results section with calculated values
 * @param {number} dengueCases - Predicted number of dengue cases
 */
function displayResults(dengueCases) {
    // Show results section with animation first
    resultsSection.style.display = 'block';
    
    // Calculate rounded value (main result)
    const roundedCases = Math.round(dengueCases);
    
    // Format and display rounded dengue cases as main result
    dengueCasesValue.textContent = formatNumber(roundedCases, 0);
    
    // Display original value below for reference with label
    dengueCasesValueOriginal.innerHTML = `<span style="font-weight: 600;">Original result:</span> ${formatNumber(dengueCases, 2)} <span style="font-size: 0.85em; opacity: 0.8;">(Orihinal na Resulta)</span>`;
    dengueCasesValueOriginal.style.display = 'block';
    
    // Update risk indicator simultaneously (not after delay)
    updateRiskIndicator(dengueCases);
    
    // Show export buttons
    exportButtonsWrapper.style.display = 'flex';
    
    // Store dengue cases for export
    window.currentDengueCases = dengueCases;
    window.currentRiskLevel = getRiskLevel(dengueCases);
    
    // Fetch and display AI recommendations
    fetchRecommendations(dengueCases);
    
    // Smooth scroll to results
    setTimeout(() => {
        resultsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
    }, 100);
}

// ============================================================================
// 7. API COMMUNICATION FUNCTIONS
// ============================================================================

/**
 * Fetches AI recommendations from the backend API
 * @param {number} dengueCases - Predicted number of dengue cases
 */
async function fetchRecommendations(dengueCases) {
    // Get form values for recommendations
    const wasteDisposal = parseFloat(document.getElementById('wasteDisposal').value);
    const stagnantWater = parseFloat(document.getElementById('stagnantWater').value);
    const drainageScore = parseFloat(document.getElementById('drainageScore').value);
    const temperature = parseFloat(document.getElementById('temperature').value);
    const rainfall = parseFloat(document.getElementById('rainfall').value);
    const cleanupScore = parseFloat(document.getElementById('cleanupScore').value);
    
    // Show recommendations section and loading state
    recommendationsSection.style.display = 'block';
    recommendationsLoading.style.display = 'flex';
    recommendationsText.style.display = 'none';
    recommendationsText.textContent = '';
    
    try {
        const response = await fetch(`${API_BASE_URL}/recommendations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                waste_disposal: wasteDisposal,
                stagnant_water: stagnantWater,
                drainage_score: drainageScore,
                temperature: temperature,
                rainfall: rainfall,
                cleanup_score: cleanupScore,
                dengue_cases: dengueCases
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.recommendations) {
            // Hide loading, show recommendations
            recommendationsLoading.style.display = 'none';
            recommendationsText.style.display = 'block';
            
            // Format and display recommendations with error handling
            try {
                const formattedText = formatRecommendations(data.recommendations);
                recommendationsText.innerHTML = formattedText;
            } catch (formatError) {
                console.error('Error formatting recommendations:', formatError);
                recommendationsText.innerHTML = `
                    <div class="recommendations-error">
                        <p>⚠️ Error displaying recommendations.</p>
                        <p class="error-detail">${formatError.message}</p>
                        <p class="error-hint">Please try again.</p>
                    </div>
                `;
            }
            
            // Scroll recommendations into view smoothly
            setTimeout(() => {
                recommendationsSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest' 
                });
            }, 300);
            
            // Show footer
            const footer = document.getElementById('recommendationsFooter');
            if (footer) {
                footer.style.display = 'block';
            }
        } else {
            throw new Error(data.error || 'Failed to get recommendations');
        }
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        recommendationsLoading.style.display = 'none';
        recommendationsText.style.display = 'block';
        recommendationsText.innerHTML = `
            <div class="recommendations-error">
                <p>⚠️ Unable to fetch recommendations at this time.</p>
                <p class="error-detail">${error.message}</p>
                <p class="error-hint">Please ensure the backend server is running on port 5000.</p>
            </div>
        `;
    }
}

/**
 * Filters out meta-commentary and reasoning text from AI recommendations
 * @param {string} text - Text to filter
 * @returns {string} Filtered text
 */
function filterMetaText(text) {
    if (!text) return text;
    
    // Patterns that indicate meta-commentary or reasoning (case insensitive)
    const metaPatterns = [
        /finally,?\s*i'?ll\s+(review|ensure|check|provide|make)/i,
        /let\s+me\s+(review|ensure|check|provide|make|ensure|go\s+through|list)/i,
        /i\s+need\s+to\s+(make\s+sure|ensure|check|list)/i,
        /let\s+me\s+list\s+them\s+out/i,
        /without\s+any\s+explanations/i,
        /just\s+the\s+actions/i,
        /i'?ll\s+(review|ensure|check|provide|make|ensure)/i,
        /i\s+will\s+(review|ensure|check|provide|make|ensure)/i,
        /i\s+should\s+(avoid|keep|make|start)/i,
        /to\s+ensure\s+they\s+are\s+clear/i,
        /directly\s+tied\s+to\s+reducing/i,
        /targeting\s+the\s+given\s+factors/i,
        /each\s+point\s+should\s+start/i,
        /each\s+recommendation\s+starts\s+with/i,
        /keep\s+the\s+language\s+(clear|concise)/i,
        /thought\s+process/i,
        /based\s+on\s+the\s+factors\s+and\s+the\s+thought\s+process/i,
        /go\s+through\s+each\s+category/i,
        /avoid\s+any\s+markdown/i,
        /^here\s+are\s+the\s+recommendations:/i,
        /^recommendations:/i,
        /^based\s+on\s+the\s+above/i,
        /^to\s+address\s+these\s+issues/i,
        /^in\s+summary/i,
        /^to\s+conclude/i,
        /^these\s+recommendations\s+will/i,
        /^by\s+implementing\s+these/i,
        /and\s+i\s+need\s+to/i,
        /and\s+let\s+me/i,
        /\.\s*and\s+i\s+need/i,
        /\.\s*let\s+me\s+(list|organize|provide)/i,
        // Patterns for analyzing/describing input values
        /\d+%\s+of\s+houses/i,
        /that'?s\s+(low|high|good|bad|even\s+lower|even\s+higher)/i,
        /which\s+is\s+(good|bad|low|high|within|outside)/i,
        /which\s+can\s+lead\s+to/i,
        /even\s+though\s+the\s+score/i,
        /maybe\s+there'?s\s+room/i,
        /could\s+further\s+reduce/i,
        /\b(is|are)\s+(low|high|good|bad|an?\s+issue|a\s+problem)/i,
        /so\s+\w+\s+is\s+(an?\s+issue|a\s+problem)/i,
        /\.\s*that'?s\s+\w+/i,
        /rainfall\s+is\s+\d+/i,
        /temperature\s+is\s+\d+/i,
        /drainage\s+score\s+is/i,
        /clean-up\s+drives\s+happen/i,
        /score\s+is\s+\d+\s+out\s+of/i,
        /happen\s+\d+\s+times/i
    ];
    
    const lines = text.split('\n');
    const filteredLines = [];
    
    for (let line of lines) {
        const trimmed = line.trim();
        const trimmedLower = trimmed.toLowerCase();
        
        // Skip empty lines
        if (!trimmed) {
            continue;
        }
        
        // Check if line matches any meta pattern
        let isMeta = false;
        for (const pattern of metaPatterns) {
            if (pattern.test(line)) {
                isMeta = true;
                break;
            }
        }
        
        // Check for sentences that contain meta-instructions (even if part of longer text)
        if (!isMeta && (
            /and\s+i\s+need\s+to\s+make\s+sure/i.test(trimmed) ||
            /and\s+let\s+me\s+list/i.test(trimmed) ||
            /\.\s*and\s+i\s+need/i.test(trimmed) ||
            /\.\s*let\s+me\s+(list|organize|provide)/i.test(trimmed)
        )) {
            // Split the line and keep only the part before the meta-commentary
            const parts = trimmed.split(/\.\s*(and\s+)?(i\s+need\s+to|let\s+me\s+list)/i);
            if (parts.length > 1) {
                // Keep only the first part (before meta-commentary)
                const beforeMeta = parts[0].trim();
                if (beforeMeta && beforeMeta.length > 10 && !beforeMeta.match(/^and\s+/i)) {
                    filteredLines.push(beforeMeta + '.');
                }
            }
            continue;
        }
        
        if (isMeta) {
            continue;
        }
        
        // Filter out lines that are too short and sound like meta-text
        if (trimmedLower.length < 20 && (
            trimmedLower.includes('ensure') ||
            trimmedLower.includes('review') ||
            trimmedLower.includes('check') ||
            trimmedLower.includes('provide') ||
            trimmedLower.includes('should') ||
            trimmedLower.includes('avoid') ||
            /^i'?ll\s+/i.test(trimmedLower) ||
            /^let\s+me\s+/i.test(trimmedLower) ||
            /^i\s+should\s+/i.test(trimmedLower) ||
            /^i\s+need\s+to/i.test(trimmedLower)
        )) {
            continue;
        }
        
        // Filter out lines containing meta-instructions
        if (trimmedLower.includes('thought process') ||
            trimmedLower.includes('go through each category') ||
            trimmedLower.includes('each point should start') ||
            trimmedLower.includes('each recommendation starts with') ||
            trimmedLower.includes('keep the language') ||
            trimmedLower.includes('avoid any markdown') ||
            trimmedLower.includes('make it actionable') ||
            trimmedLower.includes('start with a verb') ||
            trimmedLower.includes('without any explanations') ||
            trimmedLower.includes('just the actions') ||
            trimmedLower.includes('let me list them out') ||
            trimmedLower.includes('i need to make sure')) {
            continue;
        }
        
        // Filter out lines that analyze/describe input values
        if (/\d+%\s+of\s+houses/.test(trimmedLower) ||
            /that'?s\s+(low|high|good|bad|even\s+lower)/.test(trimmedLower) ||
            /which\s+is\s+(good|bad|low|high|within)/.test(trimmedLower) ||
            /which\s+can\s+lead/.test(trimmedLower) ||
            /even\s+though\s+the\s+score/.test(trimmedLower) ||
            /maybe\s+there'?s\s+room/.test(trimmedLower) ||
            /could\s+further\s+reduce/.test(trimmedLower) ||
            /\bis\s+(an?\s+issue|a\s+problem)/.test(trimmedLower) ||
            /so\s+\w+\s+is\s+(an?\s+issue|a\s+problem)/.test(trimmedLower) ||
            /^(drainage|temperature|rainfall|clean-up).*is\s+\d+/.test(trimmedLower) ||
            /score\s+is\s+\d+\s+out\s+of/.test(trimmedLower) ||
            /happen\s+\d+\s+times/.test(trimmedLower) ||
            /times\s+(a|per)\s+year/.test(trimmedLower) ||
            /which\s+is\s+(frequent|within)/.test(trimmedLower) ||
            /rainy\s+days,?\s+which/.test(trimmedLower) ||
            /environmental\s+interventions\s+need\s+to/.test(trimmedLower) ||
            /public\s+awareness\s+is\s+vital/.test(trimmedLower)) {
            continue;
        }
        
        // Filter out standalone emoji lines
        if (/^[\u{1F300}-\u{1F9FF}]+$/u.test(trimmed)) {
            continue;
        }
        
        filteredLines.push(line);
    }
    
    return filteredLines.join('\n');
}

/**
 * Formats the AI recommendations text into structured category cards
 * @param {string} recommendations - Raw recommendations text from AI
 * @returns {string} Formatted HTML string
 */
function formatRecommendations(recommendations) {
    if (!recommendations) {
        return '<p>No recommendations available.</p>';
    }
    
    // Filter out meta-commentary first
    const filteredRecommendations = filterMetaText(recommendations);
    
    // ========================================================================
    // HELPER FUNCTION: Normalize text for comparison
    // ========================================================================
    /**
     * Normalizes text for comparison (removes HTML tags, extra whitespace, lowercase)
     * @param {string} text - Text to normalize
     * @returns {string} Normalized text
     */
    function normalizeText(text) {
        if (!text || typeof text !== 'string') return '';
        // Remove HTML tags
        const plainText = text.replace(/<[^>]+>/g, ' ').trim();
        // Normalize whitespace and convert to lowercase
        return plainText.replace(/\s+/g, ' ').toLowerCase();
    }
    
    // Category mapping with icons and keywords for auto-categorization
    const categoryMap = {
        'waste management': { 
            icon: '🗑️', 
            title: 'Waste Management Strategies', 
            color: 'var(--primary)',
            keywords: ['waste', 'garbage', 'trash', 'disposal', 'recycling', 'collection', 'bin', 'bins', 'refuse', 'litter']
        },
        'vector control': { 
            icon: '🦟', 
            title: 'Vector Control Measures', 
            color: 'var(--accent)',
            keywords: ['mosquito', 'larva', 'larvicidal', 'fogging', 'larvivorous', 'vector', 'breeding', 'larviciding', 'trap', 'traps']
        },
        'community health': { 
            icon: '👥', 
            title: 'Community Health Tips', 
            color: 'var(--secondary)',
            keywords: ['protective', 'clothing', 'repellent', 'repellents', 'mosquito net', 'nets', 'personal', 'residents', 'wear', 'health', 'treatment', 'detection']
        },
        'environmental': { 
            icon: '🌿', 
            title: 'Environmental Interventions', 
            color: 'var(--primary)',
            keywords: ['drainage', 'stagnant', 'water', 'green space', 'urban heat', 'environmental', 'stagnation', 'debris', 'clean-up', 'cleanup']
        },
        'preventive': { 
            icon: '🛡️', 
            title: 'Preventive Measures', 
            color: 'var(--secondary)',
            keywords: ['preventive', 'prevention', 'early detection', 'mobile health', 'surveillance', 'monitoring', 'vulnerable']
        },
        'prevention': { 
            icon: '🛡️', 
            title: 'Preventive Measures', 
            color: 'var(--secondary)',
            keywords: ['preventive', 'prevention', 'early detection', 'mobile health', 'surveillance', 'monitoring', 'vulnerable']
        },
        'public awareness': { 
            icon: '📢', 
            title: 'Public Awareness & Education', 
            color: 'var(--primary)',
            keywords: ['awareness', 'education', 'campaign', 'campaigns', 'workshop', 'workshops', 'social media', 'pamphlet', 'pamphlets', 'disseminate', 'informational', 'educate', 'public']
        },
        'awareness': { 
            icon: '📢', 
            title: 'Public Awareness & Education', 
            color: 'var(--primary)',
            keywords: ['awareness', 'education', 'campaign', 'campaigns', 'workshop', 'workshops', 'social media', 'pamphlet', 'pamphlets', 'disseminate', 'informational', 'educate', 'public']
        },
        'education': { 
            icon: '📢', 
            title: 'Public Awareness & Education', 
            color: 'var(--primary)',
            keywords: ['awareness', 'education', 'campaign', 'campaigns', 'workshop', 'workshops', 'social media', 'pamphlet', 'pamphlets', 'disseminate', 'informational', 'educate', 'public']
        }
    };
    
    /**
     * Automatically categorize a recommendation based on keywords
     * @param {string} content - Recommendation text
     * @returns {string|null} Category key or null if no match
     */
    function autoCategorize(content) {
        // Remove HTML tags and get plain text
        const plainContent = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const contentLower = plainContent.toLowerCase();
        
        let bestMatch = null;
        let maxScore = 0;
        
        // Define category priority and scoring
        const categoryScores = {};
        
        // Check each category for keyword matches with weighted scoring
        for (const [categoryKey, categoryData] of Object.entries(categoryMap)) {
            if (!categoryData.keywords) continue;
            categoryScores[categoryKey] = 0;
            
            // Primary keywords (more specific, higher weight)
            // Map category keys to their primary keywords
            let primaryKeywordList = null;
            if (categoryKey === 'waste management') {
                primaryKeywordList = ['waste disposal', 'waste collection', 'waste bin', 'recycling', 'garbage collection', 'waste'];
            } else if (categoryKey === 'vector control') {
                primaryKeywordList = ['mosquito', 'larva', 'fogging', 'larvicidal', 'larvivorous', 'vector control', 'larviciding'];
            } else if (categoryKey === 'community health') {
                primaryKeywordList = ['protective clothing', 'mosquito net', 'repellent', 'personal protective', 'health unit', 'nets', 'residents'];
            } else if (categoryKey === 'environmental') {
                primaryKeywordList = ['drainage', 'stagnant water', 'green space', 'clean-up', 'cleanup', 'debris', 'stagnation'];
            } else if (categoryKey === 'preventive' || categoryKey === 'prevention') {
                primaryKeywordList = ['early detection', 'mobile health', 'surveillance', 'monitoring', 'vulnerable population', 'preventive'];
            } else if (categoryKey === 'public awareness' || categoryKey === 'awareness' || categoryKey === 'education') {
                primaryKeywordList = ['campaign', 'workshop', 'social media', 'pamphlet', 'awareness', 'educate', 'public', 'workshops', 'campaigns'];
            }
            
            // Check primary keywords first (weight: 3)
            if (primaryKeywordList) {
                for (const keyword of primaryKeywordList) {
                    if (contentLower.includes(keyword)) {
                        categoryScores[categoryKey] += 3;
                        break; // Only count once per category for primary keywords
                    }
                }
            }
            
            // Check all keywords (weight: 1)
            for (const keyword of categoryData.keywords) {
                // Use word boundaries for better matching
                const regex = new RegExp('\\b' + keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
                if (regex.test(contentLower)) {
                    categoryScores[categoryKey] += 1;
                }
            }
            
            if (categoryScores[categoryKey] > maxScore) {
                maxScore = categoryScores[categoryKey];
                bestMatch = categoryKey;
            }
        }
        
        // Only return a match if score is significant (at least 1)
        return maxScore > 0 ? bestMatch : null;
    }
    
    // Parse recommendations into categories
    const categories = {};
    const lines = filteredRecommendations.split('\n').filter(line => line.trim());
    
    let currentCategory = null;
    let currentItems = [];
    let categoryTitleMap = {}; // Store original titles for categories
    
    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) {
            // Empty line - if we have items, this might be a category break
            return;
        }
        
        // Check for category headers - various formats
        const boldHeaderMatch = trimmed.match(/^\*\*([^*]+)\*\*$/);
        const markdownHeaderMatch = trimmed.match(/^#+\s+(.+)$/);
        const colonHeaderMatch = trimmed.match(/^([A-Z][^:]{3,}):?\s*$/);
        const allCapsMatch = trimmed.match(/^[A-Z\s]{10,}$/);
        
        if (boldHeaderMatch || markdownHeaderMatch || colonHeaderMatch || allCapsMatch) {
            // Save previous category if it has items
            if (currentCategory && currentItems.length > 0) {
                if (!categories[currentCategory]) {
                    categories[currentCategory] = [];
                }
                // Merge items (in case category already exists)
                categories[currentCategory].push(...currentItems);
            }
            
            // Extract category name and title
            let categoryName = '';
            let categoryTitle = '';
            
            if (boldHeaderMatch) {
                categoryTitle = boldHeaderMatch[1].trim();
                categoryName = categoryTitle.toLowerCase();
            } else if (markdownHeaderMatch) {
                categoryTitle = markdownHeaderMatch[1].trim();
                categoryName = categoryTitle.toLowerCase();
            } else if (colonHeaderMatch) {
                categoryTitle = colonHeaderMatch[1].trim().replace(':', '');
                categoryName = categoryTitle.toLowerCase();
            } else if (allCapsMatch) {
                categoryTitle = trimmed.trim();
                categoryName = categoryTitle.toLowerCase();
            }
            
            // Find matching category in our map
            currentCategory = null;
            for (const [key, value] of Object.entries(categoryMap)) {
                if (categoryName.includes(key) || key.includes(categoryName.split(' ')[0])) {
                    currentCategory = key;
                    break;
                }
            }
            
            // Check for partial matches in category names
            if (!currentCategory) {
                const categoryWords = categoryName.split(/\s+/);
                for (const word of categoryWords) {
                    for (const [key, value] of Object.entries(categoryMap)) {
                        if (key.includes(word) && word.length > 3) {
                            currentCategory = key;
                            break;
                        }
                    }
                    if (currentCategory) break;
                }
            }
            
            // If no match found, create a new category
            if (!currentCategory) {
                // Clean category name for key
                const cleanName = categoryName
                    .replace(/[^a-z0-9\s]/g, '')
                    .replace(/\s+/g, '_')
                    .substring(0, 30);
                
                currentCategory = cleanName || 'general';
                
                // Store the original title
                categoryTitleMap[currentCategory] = categoryTitle;
                categoryMap[currentCategory] = {
                    icon: '📋',
                    title: categoryTitle || cleanName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    color: 'var(--primary)',
                    keywords: []
                };
            } else {
                // Use the original title if available, otherwise use mapped title
                if (categoryTitle) {
                    categoryTitleMap[currentCategory] = categoryTitle;
                    categoryMap[currentCategory].title = categoryTitle;
                }
            }
            
            currentItems = [];
        } else if (trimmed.match(/^[-•*]\s/) || trimmed.match(/^\d+[\.\)]\s/) || trimmed.match(/^[•]\s/)) {
            // List item - bullet point or numbered
            // Remove bullet marker and clean content
            let content = trimmed.replace(/^[-•*\d\.\)]\s+/, '').trim();
            
            // Auto-categorize the content
            const detectedCategory = autoCategorize(content) || 'general';
            
            // Ensure the detected category exists in categoryMap
            if (detectedCategory && !categoryMap[detectedCategory]) {
                categoryMap[detectedCategory] = {
                    icon: '📋',
                    title: detectedCategory.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    color: 'var(--primary)',
                    keywords: []
                };
            }
            
            // If no current category, set it
            if (!currentCategory) {
                currentCategory = detectedCategory;
                currentItems = [];
                // Initialize general category if needed
                if (currentCategory === 'general' && !categoryMap[currentCategory]) {
                    categoryMap[currentCategory] = {
                        icon: '📋',
                        title: 'Recommendations',
                        color: 'var(--primary)',
                        keywords: []
                    };
                }
            } else if (detectedCategory !== currentCategory) {
                // Category changed - save previous category
                if (currentItems.length > 0) {
                    if (!categories[currentCategory]) {
                        categories[currentCategory] = [];
                    }
                    categories[currentCategory].push(...currentItems);
                }
                // Switch to new category
                currentCategory = detectedCategory;
                currentItems = [];
            }
            
            // Check if content is meta-text and skip it
            const contentLower = content.toLowerCase();
            let isMetaText = /finally,?\s*i'?ll\s+(review|ensure|check|provide|make)/i.test(content) ||
                              /let\s+me\s+(review|ensure|check|provide|make|ensure|go\s+through|list)/i.test(content) ||
                              /i\s+need\s+to\s+(make\s+sure|ensure|check|list)/i.test(content) ||
                              /let\s+me\s+list\s+them\s+out/i.test(content) ||
                              /without\s+any\s+explanations/i.test(content) ||
                              /just\s+the\s+actions/i.test(content) ||
                              /i\s+should\s+(avoid|keep|make|start)/i.test(content) ||
                              /to\s+ensure\s+they\s+are\s+clear/i.test(content) ||
                              /directly\s+tied\s+to\s+reducing/i.test(content) ||
                              /targeting\s+the\s+given\s+factors/i.test(content) ||
                              /each\s+point\s+should\s+start/i.test(content) ||
                              /each\s+recommendation\s+starts\s+with/i.test(content) ||
                              /keep\s+the\s+language\s+(clear|concise)/i.test(content) ||
                              /thought\s+process/i.test(content) ||
                              /based\s+on\s+the\s+factors\s+and\s+the\s+thought\s+process/i.test(content) ||
                              /go\s+through\s+each\s+category/i.test(content) ||
                              /avoid\s+any\s+markdown/i.test(content) ||
                              /and\s+i\s+need\s+to/i.test(content) ||
                              /and\s+let\s+me/i.test(content) ||
                              contentLower.includes('ensure they are clear') ||
                              contentLower.includes('directly tied to reducing') ||
                              contentLower.includes('targeting the given factors') ||
                              contentLower.includes('thought process') ||
                              contentLower.includes('go through each category') ||
                              contentLower.includes('each point should start') ||
                              contentLower.includes('each recommendation starts with') ||
                              contentLower.includes('keep the language clear') ||
                              contentLower.includes('keep the language concise') ||
                              contentLower.includes('avoid any markdown') ||
                              contentLower.includes('start with a verb') ||
                              contentLower.includes('make it actionable') ||
                              contentLower.includes('i should avoid') ||
                              contentLower.includes('i should keep') ||
                              contentLower.includes('i need to make sure') ||
                              contentLower.includes('let me list them out') ||
                              contentLower.includes('without any explanations') ||
                              contentLower.includes('just the actions') ||
                              // Analytical/descriptive patterns about input values
                              /\d+%\s+of\s+houses/.test(contentLower) ||
                              /that'?s\s+(low|high|good|bad|even\s+lower)/.test(contentLower) ||
                              /which\s+is\s+(good|bad|low|high|within)/.test(contentLower) ||
                              /which\s+can\s+lead/.test(contentLower) ||
                              /even\s+though\s+the\s+score/.test(contentLower) ||
                              /maybe\s+there'?s\s+room/.test(contentLower) ||
                              /could\s+further\s+reduce/.test(contentLower) ||
                              /\bis\s+(an?\s+issue|a\s+problem)/.test(contentLower) ||
                              /so\s+\w+\s+is\s+(an?\s+issue|a\s+problem)/.test(contentLower) ||
                              /^(drainage|temperature|rainfall|clean-up).*is\s+\d+/.test(contentLower) ||
                              /score\s+is\s+\d+\s+out\s+of/.test(contentLower) ||
                              /happen\s+\d+\s+times/.test(contentLower) ||
                              /times\s+(a|per)\s+year/.test(contentLower) ||
                              /which\s+is\s+(frequent|within)/.test(contentLower) ||
                              /rainy\s+days,?\s+which/.test(contentLower);
            
            // Check for sentences that contain meta-instructions (even if part of longer text)
            if (!isMetaText && (
                /and\s+i\s+need\s+to\s+make\s+sure/i.test(content) ||
                /and\s+let\s+me\s+list/i.test(content) ||
                /\.\s*and\s+i\s+need/i.test(content) ||
                /\.\s*let\s+me\s+(list|organize|provide)/i.test(content)
            )) {
                // Split the content and keep only the part before the meta-commentary
                const parts = content.split(/\.\s*(and\s+)?(i\s+need\s+to|let\s+me\s+list)/i);
                if (parts.length > 1) {
                    const beforeMeta = parts[0].trim();
                    if (beforeMeta && beforeMeta.length > 10 && !beforeMeta.match(/^and\s+/i)) {
                        content = beforeMeta + '.';
                        isMetaText = false; // Content is now cleaned
                    } else {
                        isMetaText = true; // Skip this item entirely
                    }
                } else {
                    isMetaText = true; // Skip if it's pure meta-commentary
                }
            }
            
            if (isMetaText) {
                return; // Skip this item
            }
            
            // Remove markdown bold but keep the text
            content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            // Remove markdown italic
            content = content.replace(/\*([^*]+)\*/g, '<em>$1</em>');
            if (content && content.length > 3) {
                // Check for duplicates before adding (normalize and compare)
                const normalizedContent = normalizeText(content);
                const isDuplicateInCurrent = currentItems.some(item => {
                    return normalizeText(item) === normalizedContent;
                });
                
                // Only add if not a duplicate
                if (!isDuplicateInCurrent) {
                    currentItems.push(content);
                }
            }
        } else if (trimmed.length > 15) {
            // Regular paragraph or sentence - might be a recommendation
            // Filter out analytical/explanatory text that doesn't start with action verbs
            const trimmedLower = trimmed.toLowerCase();
            if (/\d+%\s+of\s+houses/.test(trimmedLower) ||
                /that'?s\s+(low|high|good|bad|even\s+lower)/.test(trimmedLower) ||
                /which\s+is\s+(good|bad|low|high|within)/.test(trimmedLower) ||
                /which\s+can\s+lead/.test(trimmedLower) ||
                /even\s+though\s+the\s+score/.test(trimmedLower) ||
                /maybe\s+there'?s\s+room/.test(trimmedLower) ||
                /^(drainage|temperature|rainfall|clean-up).*is\s+\d+/.test(trimmedLower) ||
                /score\s+is\s+\d+\s+out\s+of/.test(trimmedLower) ||
                /happen\s+\d+\s+times/.test(trimmedLower) ||
                /times\s+(a|per)\s+year/.test(trimmedLower) ||
                /which\s+is\s+(frequent|within)/.test(trimmedLower) ||
                /rainy\s+days,?\s+which/.test(trimmedLower) ||
                /environmental\s+interventions\s+need\s+to/.test(trimmedLower) ||
                /public\s+awareness\s+is\s+vital/.test(trimmedLower)) {
                // Skip analytical/explanatory paragraphs
                return;
            }
            
            // Only add if it looks like actionable content starting with action verbs
            if (trimmed.match(/^(Implement|Organize|Conduct|Distribute|Provide|Educate|Encourage|Promote|Establish|Launch|Improve|Ensure|Install)/i)) {
                // Check if content is meta-text and skip it
                let isMetaText = /finally,?\s*i'?ll\s+(review|ensure|check|provide|make)/i.test(trimmed) ||
                                  /let\s+me\s+(review|ensure|check|provide|make|ensure|go\s+through|list)/i.test(trimmed) ||
                                  /i\s+need\s+to\s+(make\s+sure|ensure|check|list)/i.test(trimmed) ||
                                  /let\s+me\s+list\s+them\s+out/i.test(trimmed) ||
                                  /without\s+any\s+explanations/i.test(trimmed) ||
                                  /just\s+the\s+actions/i.test(trimmed) ||
                                  /i\s+should\s+(avoid|keep|make|start)/i.test(trimmed) ||
                                  /to\s+ensure\s+they\s+are\s+clear/i.test(trimmed) ||
                                  /directly\s+tied\s+to\s+reducing/i.test(trimmed) ||
                                  /targeting\s+the\s+given\s+factors/i.test(trimmed) ||
                                  /each\s+point\s+should\s+start/i.test(trimmed) ||
                                  /each\s+recommendation\s+starts\s+with/i.test(trimmed) ||
                                  /keep\s+the\s+language\s+(clear|concise)/i.test(trimmed) ||
                                  /thought\s+process/i.test(trimmed) ||
                                  /based\s+on\s+the\s+factors\s+and\s+the\s+thought\s+process/i.test(trimmed) ||
                                  /go\s+through\s+each\s+category/i.test(trimmed) ||
                                  /avoid\s+any\s+markdown/i.test(trimmed) ||
                                  /and\s+i\s+need\s+to/i.test(trimmed) ||
                                  /and\s+let\s+me/i.test(trimmed) ||
                                  trimmedLower.includes('ensure they are clear') ||
                                  trimmedLower.includes('directly tied to reducing') ||
                                  trimmedLower.includes('targeting the given factors') ||
                                  trimmedLower.includes('thought process') ||
                                  trimmedLower.includes('go through each category') ||
                                  trimmedLower.includes('each point should start') ||
                                  trimmedLower.includes('each recommendation starts with') ||
                                  trimmedLower.includes('keep the language clear') ||
                                  trimmedLower.includes('keep the language concise') ||
                                  trimmedLower.includes('avoid any markdown') ||
                                  trimmedLower.includes('start with a verb') ||
                                  trimmedLower.includes('make it actionable') ||
                                  trimmedLower.includes('i should avoid') ||
                                  trimmedLower.includes('i should keep') ||
                                  trimmedLower.includes('i need to make sure') ||
                                  trimmedLower.includes('let me list them out') ||
                                  trimmedLower.includes('without any explanations') ||
                                  trimmedLower.includes('just the actions') ||
                                  // Analytical/descriptive patterns about input values
                                  /\d+%\s+of\s+houses/.test(trimmedLower) ||
                                  /that'?s\s+(low|high|good|bad|even\s+lower)/.test(trimmedLower) ||
                                  /which\s+is\s+(good|bad|low|high|within)/.test(trimmedLower) ||
                                  /which\s+can\s+lead/.test(trimmedLower) ||
                                  /even\s+though\s+the\s+score/.test(trimmedLower) ||
                                  /maybe\s+there'?s\s+room/.test(trimmedLower) ||
                                  /could\s+further\s+reduce/.test(trimmedLower) ||
                                  /\bis\s+(an?\s+issue|a\s+problem)/.test(trimmedLower) ||
                                  /so\s+\w+\s+is\s+(an?\s+issue|a\s+problem)/.test(trimmedLower) ||
                                  /^(drainage|temperature|rainfall|clean-up).*is\s+\d+/.test(trimmedLower) ||
                                  /score\s+is\s+\d+\s+out\s+of/.test(trimmedLower) ||
                                  /happen\s+\d+\s+times/.test(trimmedLower) ||
                                  /times\s+(a|per)\s+year/.test(trimmedLower) ||
                                  /which\s+is\s+(frequent|within)/.test(trimmedLower) ||
                                  /rainy\s+days,?\s+which/.test(trimmedLower);
                
                // Check for sentences that contain meta-instructions (even if part of longer text)
                if (!isMetaText && (
                    /and\s+i\s+need\s+to\s+make\s+sure/i.test(trimmed) ||
                    /and\s+let\s+me\s+list/i.test(trimmed) ||
                    /\.\s*and\s+i\s+need/i.test(trimmed) ||
                    /\.\s*let\s+me\s+(list|organize|provide)/i.test(trimmed)
                )) {
                    // Split and keep only the part before meta-commentary
                    const parts = trimmed.split(/\.\s*(and\s+)?(i\s+need\s+to|let\s+me\s+list)/i);
                    if (parts.length > 1) {
                        const beforeMeta = parts[0].trim();
                        if (beforeMeta && beforeMeta.length > 10 && !beforeMeta.match(/^and\s+/i)) {
                            trimmed = beforeMeta + '.';
                            isMetaText = false;
                        } else {
                            isMetaText = true;
                        }
                    } else {
                        isMetaText = true;
                    }
                }
                
                if (isMetaText) {
                    return; // Skip this item
                }
                
                if (!currentCategory) {
                    currentCategory = 'general';
                    if (!categoryMap[currentCategory]) {
                        categoryMap[currentCategory] = {
                            icon: '📋',
                            title: 'Recommendations',
                            color: 'var(--primary)'
                        };
                    }
                }
                
                // Remove markdown formatting
                let content = trimmed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                content = content.replace(/\*([^*]+)\*/g, '<em>$1</em>');
                
                // Check for duplicates before adding
                const normalizedContent = normalizeText(content);
                const isDuplicateInCurrent = currentItems.some(item => {
                    return normalizeText(item) === normalizedContent;
                });
                
                // Only add if not a duplicate
                if (!isDuplicateInCurrent) {
                    currentItems.push(content);
                }
            }
        }
    });
    
    // Save last category if it has items
    if (currentCategory && currentItems.length > 0) {
        if (!categories[currentCategory]) {
            categories[currentCategory] = [];
        }
        categories[currentCategory].push(...currentItems);
    }
    
    // If no categories found or only one category with many items, try to auto-categorize all items
    const categoryKeys = Object.keys(categories);
    const totalItems = Object.values(categories).reduce((sum, items) => sum + items.length, 0);
    
    // If we have many items in a single category, re-categorize them
    if (categoryKeys.length === 0 || 
        (categoryKeys.length === 1 && totalItems > 5) ||
        (categoryKeys.length === 1 && categoryKeys[0] === 'general')) {
        // Collect all bullet point items and auto-categorize them
        const allItems = lines
            .filter(line => line.trim().match(/^[-•*]\s/) || line.trim().match(/^\d+[\.\)]\s/))
            .map(line => {
                let content = line.trim().replace(/^[-•*\d\.\)]\s+/, '').trim();
                // Skip if it's meta-text
                const contentLower = content.toLowerCase();
                const isMetaText = 
                    /finally,?\s*i'?ll\s+(review|ensure|check|provide|make)/i.test(content) ||
                    /let\s+me\s+(review|ensure|check|provide|make|ensure|go\s+through|list)/i.test(content) ||
                    /\d+%\s+of\s+houses/.test(contentLower) ||
                    /that'?s\s+(low|high|good|bad|even\s+lower)/.test(contentLower) ||
                    /which\s+is\s+(good|bad|low|high|within)/.test(contentLower) ||
                    /environmental\s+interventions\s+need\s+to/.test(contentLower) ||
                    /public\s+awareness\s+is\s+(crucial|vital)/.test(contentLower);
                
                if (isMetaText) return null;
                
                content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                return content;
            })
            .filter(item => item !== null && item.length > 3);
        
        // Auto-categorize all items
        if (allItems.length > 0) {
            // Collect items from existing categories if any
            const existingItems = [];
            categoryKeys.forEach(key => {
                if (categories[key] && Array.isArray(categories[key])) {
                    existingItems.push(...categories[key]);
                }
            });
            
            // Combine with newly found items
            const allItemsToCategorize = existingItems.length > 0 ? existingItems : allItems;
            
            // Clear and re-categorize
            categories = {};
            
            // Group items by category
            allItemsToCategorize.forEach(item => {
                if (!item || typeof item !== 'string') return;
                
                // Remove HTML tags for categorization (they were added during processing)
                const plainItem = item.replace(/<[^>]+>/g, '');
                const itemCategory = autoCategorize(plainItem) || 'general';
                
                // Ensure itemCategory is a valid string
                const validCategory = (itemCategory && typeof itemCategory === 'string') ? itemCategory : 'general';
                
                if (!categories[validCategory]) {
                    categories[validCategory] = [];
                }
                categories[validCategory].push(item);
                
                // Immediately ensure category exists in categoryMap
                if (validCategory && !categoryMap[validCategory]) {
                    const cleanTitle = validCategory.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    categoryMap[validCategory] = {
                        icon: '📋',
                        title: cleanTitle,
                        color: 'var(--primary)',
                        keywords: []
                    };
                }
            });
        }
    }
    
    // Ensure all categories in use have entries in categoryMap with all required properties
    Object.keys(categories).forEach(categoryKey => {
        // Skip invalid keys
        if (!categoryKey || typeof categoryKey !== 'string') {
            return;
        }
        
        // Create category entry if it doesn't exist
        if (!categoryMap[categoryKey]) {
            const cleanTitle = categoryKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            categoryMap[categoryKey] = {
                icon: '📋',
                title: cleanTitle,
                color: 'var(--primary)',
                keywords: []
            };
        }
        
        // Ensure all required properties exist
        const cat = categoryMap[categoryKey];
        if (cat) {
            if (!cat.icon || typeof cat.icon !== 'string') {
                cat.icon = '📋';
            }
            if (!cat.title || typeof cat.title !== 'string') {
                cat.title = categoryKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            }
            if (!cat.color || typeof cat.color !== 'string') {
                cat.color = 'var(--primary)';
            }
        }
    });
    
    // Ensure general category exists if needed
    if (!categoryMap['general']) {
        categoryMap['general'] = {
            icon: '📋',
            title: 'Recommendations',
            color: 'var(--primary)',
            keywords: []
        };
    }
    
    // ========================================================================
    // DEDUPLICATION: Remove duplicate recommendations
    // ========================================================================
    // Remove duplicates within each category
    Object.keys(categories).forEach(categoryKey => {
        if (!categories[categoryKey] || !Array.isArray(categories[categoryKey])) {
            return;
        }
        
        const seen = new Set();
        const uniqueItems = [];
        
        categories[categoryKey].forEach(item => {
            if (!item || typeof item !== 'string') return;
            
            const normalized = normalizeText(item);
            
            // Skip empty items
            if (!normalized || normalized.length < 10) return;
            
            // Skip if we've seen this exact text before
            if (!seen.has(normalized)) {
                seen.add(normalized);
                uniqueItems.push(item);
            }
        });
        
        // Update category with deduplicated items
        categories[categoryKey] = uniqueItems;
    });
    
    // Generate HTML for category cards
    if (Object.keys(categories).length === 0) {
        return '<div class="recommendation-card"><p>No recommendations available.</p></div>';
    }
    
    let html = '<div class="recommendations-grid">';
    let delay = 0;
    
    Object.entries(categories).forEach(([categoryKey, items]) => {
        // Skip empty categories
        if (!items || !Array.isArray(items) || items.length === 0) {
            return;
        }
        
        // Validate categoryKey
        if (!categoryKey || typeof categoryKey !== 'string') {
            console.warn('Invalid categoryKey:', categoryKey);
            return; // Skip this category
        }
        
        // Get category with multiple fallbacks to prevent undefined errors
        let category = null;
        
        // Try to get category from map
        try {
            if (categoryMap && typeof categoryMap === 'object' && categoryMap[categoryKey]) {
                category = categoryMap[categoryKey];
            }
            
            // Fallback to general if category not found or invalid
            if (!category || typeof category !== 'object') {
                if (categoryMap && typeof categoryMap === 'object' && categoryMap['general']) {
                    category = categoryMap['general'];
                }
            }
        } catch (e) {
            console.warn('Error accessing categoryMap:', e);
        }
        
        // Final fallback: create default category object if still no valid category
        // Check category exists and is object first, then check properties
        if (!category || typeof category !== 'object') {
            const cleanTitle = categoryKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            category = {
                icon: '📋',
                title: cleanTitle || 'Recommendations',
                color: 'var(--primary)'
            };
        } else {
            // Category exists, but ensure it has required properties
            if (!category.icon || typeof category.icon !== 'string') {
                category.icon = '📋';
            }
            if (!category.title || typeof category.title !== 'string') {
                category.title = categoryKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Recommendations';
            }
            if (!category.color || typeof category.color !== 'string') {
                category.color = 'var(--primary)';
            }
        }
        
        // Extract properties - at this point category is guaranteed to exist and have all properties
        const categoryIcon = category.icon || '📋';
        const categoryTitle = category.title || 'Recommendations';
        
        // Filter and validate items before rendering
        const validItems = items.filter(item => {
            return item && typeof item === 'string' && item.trim().length > 0;
        });
        
        // Only render if there are valid items
        if (validItems.length === 0) {
            return; // Skip this category if no valid items
        }
        
        html += `
            <div class="recommendation-category-card" style="animation-delay: ${delay * 0.1}s;">
                <div class="category-header">
                    <div class="category-icon">${categoryIcon}</div>
                    <h3 class="category-title">${categoryTitle}</h3>
                </div>
                <ul class="recommendation-list">
                    ${validItems.map((item, index) => {
                        // Items may contain HTML formatting from markdown conversion, so we validate but don't escape
                        const safeItem = String(item || '').trim();
                        if (!safeItem) return '';
                        
                        // Additional deduplication check at render time
                        const normalized = normalizeText(safeItem);
                        // Check if this exact normalized text appears earlier in the list
                        const isDuplicate = validItems.slice(0, index).some(prevItem => {
                            return normalizeText(prevItem) === normalized;
                        });
                        
                        // Skip duplicates at render time
                        if (isDuplicate) return '';
                        
                        return `<li class="recommendation-item">${safeItem}</li>`;
                    }).filter(li => li.length > 0).join('')}
                </ul>
            </div>
        `;
        delay++;
    });
    
    html += '</div>';
    return html;
}

/**
 * Gets formatted text content from recommendations
 * @returns {string} Plain text recommendations
 */
function getRecommendationsText() {
    const recommendationsElement = document.getElementById('recommendationsText');
    if (!recommendationsElement) return '';
    
    // Get text content, preserving structure
    let text = '';
    const items = recommendationsElement.querySelectorAll('.recommendation-item');
    if (items.length > 0) {
        items.forEach(item => {
            text += '• ' + item.textContent.trim() + '\n';
        });
    } else {
        text = recommendationsElement.textContent || '';
    }
    return text.trim();
}

/**
 * Gets all input values for export
 * @returns {Object} Form data object
 */
function getFormData() {
    return {
        wasteDisposal: document.getElementById('wasteDisposal').value,
        stagnantWater: document.getElementById('stagnantWater').value,
        drainageScore: document.getElementById('drainageScore').value,
        temperature: document.getElementById('temperature').value,
        rainfall: document.getElementById('rainfall').value,
        cleanupScore: document.getElementById('cleanupScore').value
    };
}

/**
 * Gets the jsPDF library, checking multiple possible locations
 * @returns {Function|null} jsPDF constructor or null if not found
 */
function getJsPDFLibrary() {
    // Try UMD module format first (most common for CDN)
    if (typeof window.jsPDF !== 'undefined') {
        if (window.jsPDF.jsPDF) {
            return window.jsPDF.jsPDF;
        }
        // Check if it's the constructor directly
        if (typeof window.jsPDF === 'function') {
            return window.jsPDF;
        }
        // Check if it has a default export
        if (window.jsPDF.default && typeof window.jsPDF.default === 'function') {
            return window.jsPDF.default;
        }
    }
    
    // Try alternative naming
    if (typeof window.jspdf !== 'undefined') {
        if (window.jspdf.jsPDF) {
            return window.jspdf.jsPDF;
        }
        if (typeof window.jspdf === 'function') {
            return window.jspdf;
        }
    }
    
    return null;
}

// ============================================================================
// 8. EXPORT FUNCTIONS (PDF, CLIPBOARD)
// ============================================================================

/**
 * Downloads results as PDF
 */
function downloadPDF() {
    // Get jsPDF library
    const jsPDF = getJsPDFLibrary();
    
    if (!jsPDF) {
        // Try waiting a bit and retrying (in case library is still loading)
        setTimeout(() => {
            const retryJsPDF = getJsPDFLibrary();
            if (!retryJsPDF) {
                alert('PDF library could not be loaded. Please:\n\n1. Check your internet connection\n2. Refresh the page\n3. Try using a different browser\n\nIf the problem persists, the PDF feature may not be available.');
                console.error('jsPDF library not found after retry. Window object keys:', Object.keys(window).filter(k => k.toLowerCase().includes('pdf')));
            } else {
                // Retry the download
                downloadPDF();
            }
        }, 500);
        return;
    }
    
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        
        // Get current data
        const dengueCases = window.currentDengueCases || 0;
        const riskLevel = window.currentRiskLevel || getRiskLevel(dengueCases);
        const formData = getFormData();
        const recommendations = getRecommendationsText();
        
        // Set up colors
        const primaryColor = [16, 185, 129]; // #10b981
        const primaryLight = [230, 247, 242]; // Light green background
        const secondaryColor = [245, 158, 11]; // #f59e0b
        const riskColor = riskLevel.color.replace('#', '');
        const riskRgb = [
            parseInt(riskColor.substring(0, 2), 16),
            parseInt(riskColor.substring(2, 4), 16),
            parseInt(riskColor.substring(4, 6), 16)
        ];
        const lightGray = [245, 245, 245];
        const darkGray = [64, 64, 64];
        const textGray = [102, 102, 102];
        
        // Helper function to add a section box
        function addSectionBox(y, height, fillColor = null) {
            if (fillColor) {
                doc.setFillColor(...fillColor);
                doc.rect(margin, y, contentWidth, height, 'F');
            }
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.5);
            doc.rect(margin, y, contentWidth, height, 'S');
        }
        
        // Helper function to check page break
        function checkPageBreak(requiredHeight) {
            if (yPos + requiredHeight > pageHeight - 40) {
                doc.addPage();
                yPos = margin;
                return true;
            }
            return false;
        }
        
        let yPos = margin;
        
        // ========== HEADER SECTION ==========
        // Header background
        doc.setFillColor(...primaryLight);
        doc.rect(0, 0, pageWidth, 45, 'F');
        
        // Header border
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(2);
        doc.line(0, 45, pageWidth, 45);
        
        // Title
        yPos = 20;
        doc.setFontSize(22);
        doc.setTextColor(...primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text('EcoDengue Analysis Report', pageWidth / 2, yPos, { align: 'center' });
        
        // Subtitle
        yPos += 8;
        doc.setFontSize(11);
        doc.setTextColor(...textGray);
        doc.setFont('helvetica', 'normal');
        doc.text('Dengue Outbreak Prediction & Prevention Recommendations', pageWidth / 2, yPos, { align: 'center' });
        
        // Date
        yPos += 6;
        doc.setFontSize(9);
        doc.setTextColor(...darkGray);
        const reportDate = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        doc.text(`Generated on: ${reportDate}`, pageWidth / 2, yPos, { align: 'center' });
        
        yPos = 55;
        
        // ========== KEY METRICS SECTION ==========
        checkPageBreak(50);
        
        // Section header
        doc.setFontSize(14);
        doc.setTextColor(...darkGray);
        doc.setFont('helvetica', 'bold');
        doc.text('Key Metrics', margin, yPos);
        yPos += 10;
        
        // Predicted Cases Box
        const casesBoxHeight = 35;
        addSectionBox(yPos, casesBoxHeight, primaryLight);
        
        doc.setFontSize(10);
        doc.setTextColor(...textGray);
        doc.setFont('helvetica', 'normal');
        doc.text('Predicted Number of Dengue Cases', margin + 5, yPos + 7);
        
        doc.setFontSize(28);
        doc.setTextColor(...primaryColor);
        doc.setFont('helvetica', 'bold');
        const casesText = formatNumber(dengueCases) + ' cases';
        const casesTextWidth = doc.getTextWidth(casesText);
        doc.text(casesText, margin + (contentWidth / 2) - (casesTextWidth / 2), yPos + 22);
        
        yPos += casesBoxHeight + 10;
        
        // Risk Level Box
        checkPageBreak(30);
        const riskBoxHeight = 28;
        addSectionBox(yPos, riskBoxHeight, lightGray);
        
        doc.setFontSize(10);
        doc.setTextColor(...darkGray);
        doc.setFont('helvetica', 'bold');
        doc.text('Risk Level', margin + 5, yPos + 8);
        
        // Risk level badge (using regular rect since roundedRect may not be available)
        doc.setFillColor(...riskRgb);
        const riskBadgeWidth = 55;
        const riskBadgeHeight = 14;
        doc.rect(margin + contentWidth - riskBadgeWidth - 5, yPos + 4, riskBadgeWidth, riskBadgeHeight, 'F');
        
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        const riskText = riskLevel.label.toUpperCase();
        const riskTextWidth = doc.getTextWidth(riskText);
        doc.text(riskText, margin + contentWidth - (riskBadgeWidth / 2) - (riskTextWidth / 2) - 5, yPos + 13);
        
        doc.setFontSize(9);
        doc.setTextColor(...textGray);
        doc.setFont('helvetica', 'italic');
        const descLines = doc.splitTextToSize(riskLevel.description, contentWidth - riskBadgeWidth - 20);
        doc.text(descLines, margin + 5, yPos + 20);
        
        yPos += riskBoxHeight + 15;
        
        // ========== INPUT PARAMETERS SECTION ==========
        checkPageBreak(60);
        
        // Section header
        doc.setFontSize(14);
        doc.setTextColor(...darkGray);
        doc.setFont('helvetica', 'bold');
        doc.text('Input Parameters', margin, yPos);
        yPos += 8;
        
        // Parameters box
        const paramBoxHeight = 50;
        addSectionBox(yPos, paramBoxHeight, [255, 255, 255]);
        
        const paramStartY = yPos + 5;
        let paramY = paramStartY;
        const paramLeftCol = margin + 8;
        const paramRightCol = margin + contentWidth / 2 + 10;
        const paramLineHeight = 7;
        
        doc.setFontSize(9);
        doc.setTextColor(...darkGray);
        doc.setFont('helvetica', 'normal');
        
        // Left column
        doc.setFont('helvetica', 'bold');
        doc.text('Waste Disposal:', paramLeftCol, paramY);
        doc.setFont('helvetica', 'normal');
        doc.text(`${formData.wasteDisposal}%`, paramLeftCol + 50, paramY);
        
        paramY += paramLineHeight;
        doc.setFont('helvetica', 'bold');
        doc.text('Stagnant Water Free:', paramLeftCol, paramY);
        doc.setFont('helvetica', 'normal');
        doc.text(`${formData.stagnantWater}%`, paramLeftCol + 50, paramY);
        
        paramY += paramLineHeight;
        doc.setFont('helvetica', 'bold');
        doc.text('Drainage Score (1-5):', paramLeftCol, paramY);
        doc.setFont('helvetica', 'normal');
        doc.text(`${formData.drainageScore}`, paramLeftCol + 50, paramY);
        
        // Right column
        paramY = paramStartY;
        doc.setFont('helvetica', 'bold');
        doc.text('Temperature:', paramRightCol, paramY);
        doc.setFont('helvetica', 'normal');
        doc.text(`${formData.temperature}°C`, paramRightCol + 45, paramY);
        
        paramY += paramLineHeight;
        doc.setFont('helvetica', 'bold');
        doc.text('Rainfall (Rainy Days):', paramRightCol, paramY);
        doc.setFont('helvetica', 'normal');
        doc.text(`${formData.rainfall} days`, paramRightCol + 45, paramY);
        
        paramY += paramLineHeight;
        doc.setFont('helvetica', 'bold');
        doc.text('Clean-Up Drive (Frequency):', paramRightCol, paramY);
        doc.setFont('helvetica', 'normal');
        doc.text(`${formData.cleanupScore}`, paramRightCol + 45, paramY);
        
        yPos += paramBoxHeight + 15;
        
        // ========== RECOMMENDATIONS SECTION ==========
        if (recommendations) {
            checkPageBreak(40);
            
            // Section header
            doc.setFontSize(14);
            doc.setTextColor(...darkGray);
            doc.setFont('helvetica', 'bold');
            doc.text('AI-Powered Recommendations', margin, yPos);
            yPos += 10;
            
            // Recommendations container with cleaner multi-page handling
            yPos += 5;
            
            doc.setFontSize(10);
            doc.setTextColor(...darkGray);
            doc.setFont('helvetica', 'normal');
            
            // Split recommendations into lines
            const lines = recommendations.split('\n').filter(line => line.trim());
            const recommendationItems = [];
            
            lines.forEach((line) => {
                // Remove bullet points if present
                const cleanLine = line.replace(/^[•\-\*\d\.\)]\s+/, '').trim();
                if (cleanLine) {
                    recommendationItems.push(cleanLine);
                }
            });
            
            // Draw recommendations with proper formatting
            recommendationItems.forEach((cleanLine) => {
                checkPageBreak(15);
                
                // Bullet point
                doc.setFillColor(...primaryColor);
                doc.circle(margin + 8, yPos - 2, 1.5, 'F');
                
                // Text
                doc.setTextColor(...darkGray);
                const textX = margin + 15;
                const textWidth = contentWidth - 20;
                const splitText = doc.splitTextToSize(cleanLine, textWidth);
                
                splitText.forEach((textLine) => {
                    if (yPos > pageHeight - 45) {
                        doc.addPage();
                        yPos = margin + 5;
                    }
                    doc.text(textLine, textX, yPos);
                    yPos += 5;
                });
                
                yPos += 5; // Space between items
            });
            
            yPos += 5;
        }
        
        // ========== FOOTER ==========
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Footer line
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.5);
            doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
            
            // Footer text
            doc.setFontSize(8);
            doc.setTextColor(...textGray);
            doc.setFont('helvetica', 'normal');
            doc.text(
                `Page ${i} of ${pageCount} | EcoDengue Analysis System | ${reportDate}`,
                pageWidth / 2,
                pageHeight - 12,
                { align: 'center' }
            );
        }
        
        // Save PDF
        const fileName = `EcoDengue_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('An error occurred while generating the PDF. Please try again.\n\nError: ' + error.message);
    }
}

/**
 * Copies results to clipboard
 */
async function copyToClipboard() {
    const dengueCases = window.currentDengueCases || 0;
    const riskLevel = window.currentRiskLevel || getRiskLevel(dengueCases);
    const formData = getFormData();
    const recommendations = getRecommendationsText();
    
    const text = `EcoDengue Analysis Report
=======================

Predicted Number of Dengue Cases: ${formatNumber(dengueCases)} cases

Risk Level: ${riskLevel.label}
${riskLevel.description}

Input Parameters:
- Waste Disposal: ${formData.wasteDisposal}%
- Stagnant Water Free: ${formData.stagnantWater}%
- Drainage Score: ${formData.drainageScore} (1-5)
- Temperature: ${formData.temperature}°C
- Rainfall: ${formData.rainfall} days
- Clean-Up Drive (Frequency): ${formData.cleanupScore}

AI-Powered Recommendations:
${recommendations || 'No recommendations available.'}

Generated by EcoDengue Analysis System
Date: ${new Date().toLocaleDateString()}
`;
    
    try {
        await navigator.clipboard.writeText(text);
        
        // Show success feedback
        const originalText = copyClipboardBtn.querySelector('span:last-child').textContent;
        copyClipboardBtn.querySelector('span:last-child').textContent = 'Copied!';
        copyClipboardBtn.style.backgroundColor = '#10b981';
        
        setTimeout(() => {
            copyClipboardBtn.querySelector('span:last-child').textContent = originalText;
            copyClipboardBtn.style.backgroundColor = '';
        }, 2000);
    } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        alert('Failed to copy to clipboard. Please try again or use the PDF download option.');
    }
}

function resetResults() {
    resultsSection.style.display = 'none';
    recommendationsSection.style.display = 'none';
    recommendationsText.textContent = '';
    // Reset risk indicator but keep it in DOM (it will be shown again when results are displayed)
    riskIndicatorWrapper.style.display = 'none';
    exportButtonsWrapper.style.display = 'none';
    
    const footer = document.getElementById('recommendationsFooter');
    if (footer) {
        footer.style.display = 'none';
    }
    form.reset();
    
    // Remove validation states
    const inputs = form.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.classList.remove('valid', 'invalid');
    });
    
    // Clear stored data
    window.currentDengueCases = null;
    window.currentRiskLevel = null;
    
    // Reset dengue cases display
    dengueCasesValue.textContent = '-';
    dengueCasesValueOriginal.innerHTML = '-';
    dengueCasesValueOriginal.style.display = 'none';
    
    // Reset risk badge display values
    riskLabel.textContent = '-';
    riskIcon.textContent = '⚠️';
    riskTooltipText.textContent = '-';
    
    // Scroll back to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================================
// 9. INPUT VALIDATION AND HANDLING
// ============================================================================

/**
 * Validates all form inputs
 * @returns {boolean} True if all inputs are valid
 */
function validateForm() {
    const wasteDisposal = document.getElementById('wasteDisposal').value;
    const stagnantWater = document.getElementById('stagnantWater').value;
    const drainageScore = document.getElementById('drainageScore').value;
    const temperature = document.getElementById('temperature').value;
    const rainfall = document.getElementById('rainfall').value;
    const cleanupScore = document.getElementById('cleanupScore').value;
    
    return isValidPercentage(wasteDisposal) && 
           isValidPercentage(stagnantWater) && 
           isValidDrainageScore(drainageScore) &&
           isValidNumber(temperature) &&
           isValidNumber(rainfall) &&
           isValidNumber(cleanupScore);
}

/**
 * Handles input validation in real-time
 * @param {Event} event - Input event
 */
function handleInputValidation(event) {
    const input = event.target;
    const value = input.value.trim();
    const id = input.id;
    
    if (value === '') {
        input.classList.remove('valid', 'invalid');
        return;
    }
    
    // Validate percentage inputs
    if (id === 'wasteDisposal' || id === 'stagnantWater') {
        if (isValidPercentage(value)) {
            input.classList.add('valid');
            input.classList.remove('invalid');
        } else {
            input.classList.add('invalid');
            input.classList.remove('valid');
        }
    } else if (id === 'drainageScore') {
        // Validate drainage score (1-5)
        if (isValidDrainageScore(value)) {
            input.classList.add('valid');
            input.classList.remove('invalid');
        } else {
            input.classList.add('invalid');
            input.classList.remove('valid');
        }
    } else {
        // Validate number inputs
        if (isValidNumber(value)) {
            input.classList.add('valid');
            input.classList.remove('invalid');
        } else {
            input.classList.add('invalid');
            input.classList.remove('valid');
        }
    }
}

// ============================================================================
// 10. EVENT HANDLERS
// ============================================================================

/**
 * Handles form submission and triggers prediction
 * @param {Event} event - Form submit event
 */
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validate form inputs
    if (!validateForm()) {
        alert('Please enter valid values for all fields:\n\n' +
              '- Waste Disposal: 0-100%\n' +
              '- Stagnant Water: 0-100%\n' +
              '- Drainage Score: 1-5\n' +
              '- Temperature: 0 or greater\n' +
              '- Rainfall: 0 or greater (Number of Rainy Days)\n' +
              '- Clean-Up Drive (Frequency): 0 or greater\n\n' +
              'Mangyaring maglagay ng wastong halaga para sa lahat ng patlang.');
        return;
    }
    
    // Get input values
    const wasteDisposal = parseFloat(document.getElementById('wasteDisposal').value);
    const stagnantWater = parseFloat(document.getElementById('stagnantWater').value);
    const drainageScore = parseFloat(document.getElementById('drainageScore').value);
    const temperature = parseFloat(document.getElementById('temperature').value);
    const rainfall = parseFloat(document.getElementById('rainfall').value);
    const cleanupScore = parseFloat(document.getElementById('cleanupScore').value);
    
    // Disable button during calculation
    predictBtn.disabled = true;
    predictBtn.querySelector('span').textContent = 'Calculating...';
    
    // Calculate predicted dengue cases
    const predictedDengueCases = calculateDengueCases(
        wasteDisposal,
        stagnantWater,
        drainageScore,
        temperature,
        rainfall,
        cleanupScore
    );
    
    // Display results (this will also trigger AI recommendations fetch)
    displayResults(predictedDengueCases);
    
    // Re-enable button
    predictBtn.disabled = false;
    predictBtn.querySelector('span').textContent = 'Compute Prediction';
}

// ============================================================================
// 11. EVENT LISTENERS SETUP
// ============================================================================

/**
 * Initializes all event listeners
 */
function initializeEventListeners() {
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Reset button
    resetBtn.addEventListener('click', resetResults);
    
    // Export buttons
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', downloadPDF);
    }
    
    if (copyClipboardBtn) {
        copyClipboardBtn.addEventListener('click', copyToClipboard);
    }
    
    // Real-time input validation
    const inputs = form.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('input', handleInputValidation);
        input.addEventListener('blur', handleInputValidation);
    });
    
    // Prevent non-numeric input (except decimal point) - only for number inputs
    const numberInputs = form.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        input.addEventListener('keydown', (event) => {
            // Allow: backspace, delete, tab, escape, enter, decimal point
            if ([8, 9, 27, 13, 46, 110, 190].indexOf(event.keyCode) !== -1 ||
                // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                (event.keyCode === 65 && event.ctrlKey === true) ||
                (event.keyCode === 67 && event.ctrlKey === true) ||
                (event.keyCode === 86 && event.ctrlKey === true) ||
                (event.keyCode === 88 && event.ctrlKey === true) ||
                // Allow: home, end, left, right
                (event.keyCode >= 35 && event.keyCode <= 39)) {
                return;
            }
            // Ensure that it is a number and stop the keypress
            if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && 
                (event.keyCode < 96 || event.keyCode > 105)) {
                event.preventDefault();
            }
        });
        
        // Prevent paste of non-numeric content
        input.addEventListener('paste', (event) => {
            event.preventDefault();
            const paste = (event.clipboardData || window.clipboardData).getData('text');
            const num = parseFloat(paste);
            if (!isNaN(num) && num >= 0) {
                input.value = paste;
                handleInputValidation({ target: input });
            }
        });
    });
}

// ============================================================================
// 11. APPLICATION INITIALIZATION
// ============================================================================

/**
 * Initializes the application when DOM is loaded
 */
function init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initializeDOMElements();
            initializeEventListeners();
        });
    } else {
        initializeDOMElements();
        initializeEventListeners();
    }
}

// Start the application
init();

// ============================================================================
// EXPORT FUNCTIONS FOR TESTING (if needed)
// ============================================================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateDengueCases,
        formatNumber,
        isValidNumber,
        isValidPercentage
    };
}





