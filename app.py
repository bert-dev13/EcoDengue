"""
================================================================================
EcoDengue - Dengue Prevention Prediction System
Backend API Server
================================================================================

This Flask application provides the backend API for the EcoDengue system.
It handles AI-powered recommendations for dengue prevention using
Together AI's language model.

Author: EcoDengue Development Team
Version: 1.0.0
================================================================================
"""

# ============================================================================
# IMPORTS AND DEPENDENCIES
# ============================================================================

import os
import re
import warnings
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
# Lazy import Together to avoid slow startup
# from together import Together

# ============================================================================
# CONFIGURATION AND INITIALIZATION
# ============================================================================

# Suppress Flask development server warnings
warnings.filterwarnings('ignore', message='.*development server.*')
warnings.filterwarnings('ignore', message='.*This is a development server.*')
warnings.filterwarnings('ignore', category=UserWarning, module='werkzeug')

# Flask application initialization
app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)  # Enable Cross-Origin Resource Sharing

# Together AI API configuration
TOGETHER_API_KEY = os.getenv(
    'TOGETHER_API_KEY', 
    'tgp_v1_rQ3i3iNCz3UaTBeVo_iBAvfB_OVdSQ1Q8kOpt6izrf8'
)
# Lazy initialization - client will be created when first needed
_client = None

def get_client():
    """Get or create the Together AI client (lazy initialization)."""
    global _client
    if _client is None:
        # Lazy import to avoid slow startup
        from together import Together
        _client = Together(api_key=TOGETHER_API_KEY)
    return _client

# AI Model configuration
AI_MODEL = "meta-llama/Meta-Llama-3-8B-Instruct-Lite"
AI_TEMPERATURE = 0.3
AI_MAX_TOKENS = 1000

# ============================================================================
# AI INTEGRATION FUNCTIONS
# ============================================================================

def get_ai_recommendations(waste_disposal, stagnant_water, drainage_score, temperature, rainfall, cleanup_score, dengue_cases):
    """
    Get AI-generated recommendations for dengue prevention based on input parameters.
    
    Uses Together AI to generate actionable recommendations for reducing dengue
    incidence based on community and environmental factors.
    
    Args:
        waste_disposal (float): % of Houses with Proper Waste Disposal
        stagnant_water (float): % of Houses Free of Stagnant Water
        drainage_score (float): Drainage Score (1-5)
        temperature (float): Temperature (°C)
        rainfall (float): Rainfall (Number of Rainy Days)
        cleanup_score (float): Community Clean-Up Drive Frequency
        dengue_cases (float): Predicted number of dengue cases
        
    Returns:
        str: AI-generated recommendations text
    """
    prompt = f"""You are a dengue prevention expert. Provide ONLY the final recommendation list. NO explanations, NO thinking process, NO meta-commentary.

Predicted Dengue Cases: {dengue_cases:.2f}
% of Houses with Proper Waste Disposal: {waste_disposal}%
% of Houses Free of Stagnant Water: {stagnant_water}%
Drainage Score (1-5): {drainage_score}
Temperature (°C): {temperature}
Rainfall (Number of Rainy Days): {rainfall}
Community Clean-Up Drive Frequency: {cleanup_score}

Output format (ONLY output the recommendations, nothing else):

**Waste Management Strategies**
• Implement [action]
• Organize [action]

**Vector Control Measures**
• Conduct [action]
• Implement [action]

**Community Health Tips**
• Advise [action]
• Promote [action]

**Environmental Interventions**
• Improve [action]
• Organize [action]

**Preventive Measures**
• Establish [action]
• Distribute [action]

**Public Awareness & Education**
• Organize [action]
• Conduct [action]

OR format as a clean list with bullet points (they will be automatically categorized):
• Implement [action]
• Organize [action]
• Conduct [action]

Requirements:
- Provide actionable recommendations to reduce dengue incidence
- Start each recommendation with an action verb (Implement, Organize, Conduct, Distribute, Establish, Promote, Advise, etc.)
- Provide 3-5 unique recommendations per category (NO duplicates)
- Each recommendation must be distinct and different from others
- NO explanations, NO "based on", NO "these factors", NO thinking process
- NO analysis or description of input values (e.g., "30% is low", "that's high", "which is good")
- NO meta-commentary or instructions to yourself
- NO repeating the same recommendation multiple times
- Start immediately with the first recommendation"""
    
    try:
        client = get_client()
        response = client.chat.completions.create(
            model=AI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are a concise expert. Output ONLY the final recommendations. No explanations, no thinking process, no meta-commentary."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=AI_TEMPERATURE,
            max_tokens=AI_MAX_TOKENS
        )
        
        raw_response = response.choices[0].message.content.strip()
        return raw_response
        
    except Exception as e:
        return f"Error generating recommendations: {str(e)}"

# ============================================================================
# API ROUTES
# ============================================================================

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """
    API Endpoint: Get AI-powered dengue prevention recommendations.
    
    Request Body (JSON):
        {
            "waste_disposal": 79.3,
            "stagnant_water": 90,
            "drainage_score": 2,
            "temperature": 30,
            "rainfall": 121,
            "cleanup_score": 5,
            "dengue_cases": 32.93
        }
    
    Response (JSON):
        {
            "success": true,
            "recommendations": "..."
        }
    
    Status Codes:
        200: Success
        400: Bad Request (missing or invalid parameters)
        500: Internal Server Error
    """
    try:
        # Validate request data
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        waste_disposal = data.get('waste_disposal')
        stagnant_water = data.get('stagnant_water')
        drainage_score = data.get('drainage_score')
        temperature = data.get('temperature')
        rainfall = data.get('rainfall')
        cleanup_score = data.get('cleanup_score')
        dengue_cases = data.get('dengue_cases')
        
        if (waste_disposal is None or stagnant_water is None or 
            drainage_score is None or temperature is None or 
            rainfall is None or cleanup_score is None or 
            dengue_cases is None):
            return jsonify({
                "error": "Missing required fields"
            }), 400
        
        # Generate AI recommendations
        recommendations = get_ai_recommendations(
            float(waste_disposal),
            float(stagnant_water),
            float(drainage_score),
            float(temperature),
            float(rainfall),
            float(cleanup_score),
            float(dengue_cases)
        )
        
        # Return success response
        return jsonify({
            "success": True,
            "recommendations": recommendations
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """
    API Endpoint: Health check for monitoring and load balancers.
    
    Returns:
        JSON: {"status": "healthy"}
        Status Code: 200
    """
    return jsonify({"status": "healthy"}), 200


@app.route('/')
def index():
    """
    Serve the main HTML page.
    
    Returns:
        HTML: index.html file
    """
    return send_from_directory('.', 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    """
    Serve static files (CSS, JS, images, etc.).
    
    Args:
        path (str): Path to the static file
        
    Returns:
        File: Requested static file
    """
    return send_from_directory('.', path)

# ============================================================================
# APPLICATION ENTRY POINT
# ============================================================================

if __name__ == '__main__':
    import logging
    import sys
    
    # Suppress Flask development server warning
    class NoDevelopmentServerWarning(logging.Filter):
        def filter(self, record):
            message = record.getMessage()
            return 'development server' not in message.lower() and 'This is a development server' not in message
    
    # Configure logging - allow INFO level to show server URL and requests
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.INFO)
    # Remove default handlers and add filtered handler
    log.handlers.clear()
    handler = logging.StreamHandler(sys.stdout)
    handler.addFilter(NoDevelopmentServerWarning())
    log.addHandler(handler)
    
    # Print server startup message
    print("\n" + "="*60)
    print("EcoDengue Server Starting...")
    print("="*60)
    print("Server running at: http://127.0.0.1:5000")
    print("Press CTRL+C to quit")
    print("="*60 + "\n")
    
    # Run Flask development server
    # Use explicit host and disable reloader for faster startup on Windows
    app.run(debug=True, host='127.0.0.1', port=5000, use_reloader=False)





