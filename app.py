"""
Flask backend for EcoDengue system
Handles Together AI API integration for dengue prevention recommendations
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from together import Together
import os

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)  # Enable CORS for frontend requests

# Initialize Together AI client
TOGETHER_API_KEY = "tgp_v1_rQ3i3iNCz3UaTBeVo_iBAvfB_OVdSQ1Q8kOpt6izrf8"
client = Together(api_key=TOGETHER_API_KEY)

def get_ai_recommendations(waste_disposal, stagnant_water, drainage_score, temperature, rainfall, cleanup_score, dengue_cases):
    """
    Get AI-generated recommendations for dengue prevention based on input parameters
    
    Args:
        waste_disposal (float): % of Houses with Proper Waste Disposal
        stagnant_water (float): % of Houses Free of Stagnant Water
        drainage_score (float): Drainage Score
        temperature (float): Temperature (°C)
        rainfall (float): Rainfall (mm)
        cleanup_score (float): Community Clean-Up Score
        dengue_cases (float): Predicted number of dengue cases
    
    Returns:
        str: AI-generated recommendations text
    """
    prompt = f"""Based on the predicted number of dengue cases ({dengue_cases:.2f}) and the following community/environmental factors:

- % of Houses with Proper Waste Disposal: {waste_disposal}%
- % of Houses Free of Stagnant Water: {stagnant_water}%
- Drainage Score: {drainage_score}
- Temperature (°C): {temperature}
- Rainfall (mm): {rainfall}
- Community Clean-Up Score: {cleanup_score}

Provide ONLY actionable recommendations to reduce dengue incidence. 

CRITICAL INSTRUCTIONS:
- Do NOT include any reasoning, explanations, or meta-commentary
- Do NOT include instructions to yourself like "I should avoid markdown" or "Each point should start with a verb"
- Do NOT mention your thought process, how you're organizing, or what you're planning to do
- Do NOT include phrases like "Let me go through each category" or "based on the factors and the thought process"
- ONLY output the actual recommendations - nothing else

Include recommendations for:
- Waste management strategies
- Vector control measures
- Community health tips
- Environmental interventions
- Preventive measures
- Public awareness and education

Format the recommendations as a clean list with bullet points:
• First recommendation
• Second recommendation
• Third recommendation

Start each recommendation with an action verb (Implement, Organize, Conduct, etc.). Output ONLY the recommendations, no explanations or meta-commentary."""

    try:
        response = client.chat.completions.create(
            model="deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        raw_response = response.choices[0].message.content
        
        # Clean up meta-commentary that might slip through
        import re
        lines = raw_response.split('\n')
        cleaned_lines = []
        meta_patterns = [
            r'finally,?\s*i\'?ll\s+(review|ensure|check|provide|make)',
            r'let\s+me\s+(review|ensure|check|provide|make|ensure|go\s+through|list)',
            r'i\s+need\s+to\s+(make\s+sure|ensure|check|list)',
            r'let\s+me\s+list\s+them\s+out',
            r'without\s+any\s+explanations',
            r'just\s+the\s+actions',
            r'to\s+ensure\s+they\s+are\s+clear',
            r'directly\s+tied\s+to\s+reducing',
            r'targeting\s+the\s+given\s+factors',
            r'i\s+should\s+(avoid|keep|make|start)',
            r'each\s+point\s+should\s+start',
            r'each\s+recommendation\s+starts\s+with',
            r'keep\s+the\s+language\s+(clear|concise)',
            r'thought\s+process',
            r'based\s+on\s+the\s+factors\s+and\s+the\s+thought\s+process',
            r'go\s+through\s+each\s+category',
            r'avoid\s+any\s+markdown',
            r'and\s+i\s+need\s+to',
            r'and\s+let\s+me',
        ]
        
        for line in lines:
            line_stripped = line.strip()
            # Preserve empty lines for structure
            if not line_stripped:
                cleaned_lines.append(line)
                continue
            
            line_lower = line_stripped.lower()
            
            # Check if line contains meta-commentary
            is_meta = any(re.search(pattern, line_lower, re.IGNORECASE) for pattern in meta_patterns)
            
            # Also check for common meta phrases
            if any(phrase in line_lower for phrase in [
                'ensure they are clear',
                'directly tied to reducing',
                'targeting the given factors',
                'i\'ll review',
                'let me ensure',
                'let me go through',
                'let me list them out',
                'i need to make sure',
                'i should avoid',
                'i should keep',
                'each point should start',
                'each recommendation starts with',
                'keep the language clear',
                'keep the language concise',
                'thought process',
                'based on the factors and the thought process',
                'go through each category',
                'avoid any markdown',
                'start with a verb',
                'make it actionable',
                'without any explanations',
                'just the actions',
                'and i need to',
                'and let me',
                'i need to ensure',
                'let me organize',
                'let me provide',
            ]):
                is_meta = True
            
            # Check for sentences that contain meta-instructions (even if part of longer text)
            if re.search(r'and\s+i\s+need\s+to\s+make\s+sure', line_lower) or \
               re.search(r'and\s+let\s+me\s+list', line_lower) or \
               re.search(r'\.\s*and\s+i\s+need', line_lower) or \
               re.search(r'\.\s*let\s+me\s+(list|organize|provide)', line_lower):
                # Split the line and keep only the part before the meta-commentary
                parts = re.split(r'\.\s*(and\s+)?(i\s+need\s+to|let\s+me\s+list)', line_lower, flags=re.IGNORECASE)
                if len(parts) > 1:
                    # Keep only the first part (before meta-commentary)
                    before_meta = parts[0].strip()
                    if before_meta and len(before_meta) > 10:
                        # Reconstruct the original case for the first part
                        original_parts = re.split(r'\.\s*(and\s+)?(i\s+need\s+to|let\s+me\s+list)', line, flags=re.IGNORECASE)
                        if len(original_parts) > 1:
                            cleaned_lines.append(original_parts[0].strip() + '.')
                    continue
                is_meta = True
            
            # Skip meta-text lines
            if not is_meta:
                cleaned_lines.append(line)
        
        cleaned_response = '\n'.join(cleaned_lines).strip()
        return cleaned_response
    except Exception as e:
        return f"Error generating recommendations: {str(e)}"

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """
    API endpoint to get dengue prevention recommendations
    Expects JSON: {
        "waste_disposal": 79.3,
        "stagnant_water": 90,
        "drainage_score": 2,
        "temperature": 30,
        "rainfall": 121,
        "cleanup_score": 5,
        "dengue_cases": 32.93
    }
    """
    try:
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
            return jsonify({"error": "Missing required fields"}), 400
        
        # Get AI recommendations
        recommendations = get_ai_recommendations(
            float(waste_disposal),
            float(stagnant_water),
            float(drainage_score),
            float(temperature),
            float(rainfall),
            float(cleanup_score),
            float(dengue_cases)
        )
        
        return jsonify({
            "success": True,
            "recommendations": recommendations
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy"}), 200

@app.route('/')
def index():
    """Serve the main HTML page"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files (CSS, JS, images, etc.)"""
    return send_from_directory('.', path)

if __name__ == '__main__':
    app.run(debug=True, port=5000)


