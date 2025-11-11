# EcoDengue – Dengue Outbreak Analysis System

A web-based system that predicts the number of dengue cases in a community based on environmental and community factors, and provides AI-powered recommendations for dengue prevention.

## Features

- **Dengue Case Prediction**: Calculates predicted dengue cases using a regression formula based on:
  - % of Houses with Proper Waste Disposal
  - % of Houses Free of Stagnant Water
  - Drainage Score
  - Temperature (°C)
  - Rainfall (mm)
  - Community Clean-Up Score

- **AI-Powered Recommendations**: Uses Together API (DeepSeek model) to generate actionable recommendations for:
  - Waste management strategies
  - Vector control measures
  - Community health tips
  - Environmental interventions
  - Preventive measures

- **Modern UI/UX**: 
  - Clean, health-themed design with green/orange color scheme
  - Responsive layout for mobile, tablet, and desktop
  - Smooth animations and transitions
  - School logo and branding support

## Installation

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Ensure the school logo is in place:**
   - Place your school logo at `assets/images/logo.png`

## Usage

1. **Start the Flask backend server:**
   ```bash
   python app.py
   ```
   The server will start on `http://localhost:5000`

2. **Open the application:**
   - Open your web browser and navigate to `http://localhost:5000`
   - The application will load with the input form

3. **Enter community/environmental factors:**
   - Fill in all the required fields with appropriate values
   - Click "Compute Prediction" to calculate the predicted dengue cases

4. **View results:**
   - The predicted number of dengue cases will be displayed
   - AI-generated recommendations will appear below the prediction

## Formula

The system uses the following formula to predict dengue cases:

```
No. of Dengue Cases = 260.819 - 2.057(W) - 0.194(F) - 1.318(D) - 0.609(T) - 0.222(R) - 0.274(U)
```

Where:
- **W** = % of Houses with Proper Waste Disposal
- **F** = % of Houses Free of Stagnant Water
- **D** = Drainage Score
- **T** = Temperature (°C)
- **R** = Rainfall (mm)
- **U** = Community Clean-Up Score

## API Endpoints

### POST `/api/recommendations`
Get AI-generated recommendations for dengue prevention.

**Request Body:**
```json
{
    "waste_disposal": 79.3,
    "stagnant_water": 90,
    "drainage_score": 2,
    "temperature": 30,
    "rainfall": 121,
    "cleanup_score": 5,
    "dengue_cases": 32.93
}
```

**Response:**
```json
{
    "success": true,
    "recommendations": "• Recommendation 1\n• Recommendation 2\n..."
}
```

### GET `/api/health`
Health check endpoint.

## Configuration

The Together API key is configured in `app.py`. Make sure to use a valid API key:

```python
TOGETHER_API_KEY = "your_api_key_here"
```

## File Structure

```
EcoDengue/
├── app.py                 # Flask backend server
├── index.html            # Main HTML file
├── style.css             # Stylesheet
├── script.js             # Frontend JavaScript
├── requirements.txt      # Python dependencies
├── README.md            # This file
└── assets/
    └── images/
        └── logo.png     # School logo
```

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Flask (Python)
- **AI**: Together API (DeepSeek-R1-Distill-Llama-70B-free)
- **Styling**: Custom CSS with animations and responsive design

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is developed for educational purposes.

## Credits

- Developed for Licerio Antiporda Sr. National High School
- Uses Together API for AI-powered recommendations
- Inspired by the TOCSEA project design

