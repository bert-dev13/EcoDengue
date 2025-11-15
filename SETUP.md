# How to Set Up EcoDengue

Quick guide to get EcoDengue running on your computer.

---

## What You Need

- Python 3.7 or higher
- Internet connection (for AI recommendations)

**Check Python:** Open terminal/command prompt and type `python --version` (or `python3 --version` on Mac/Linux)

---

## Step 1: Open Project Folder

Open terminal/command prompt and go to your project folder:

**Windows:**
```
cd C:\projects\EcoDengue
```

**Mac/Linux:**
```
cd ~/Desktop/EcoDengue
```

---

## Step 2: Create Virtual Environment

**Windows:**
```
python -m venv venv
```

**Mac/Linux:**
```
python3 -m venv venv
```

---

## Step 3: Activate Virtual Environment

**Windows:**
```
venv\Scripts\activate
```

**Mac/Linux:**
```
source venv/bin/activate
```

You should see `(venv)` at the start of your command line.

---

## Step 4: Install Packages

**Windows:**
```
pip install -r requirements.txt
```

**Mac/Linux:**
```
pip3 install -r requirements.txt
```

Wait for installation to finish.

**What gets installed:**
- Flask (web framework)
- flask-cors (allows cross-origin requests)
- together (AI API for recommendations)

---

## Step 5: Run the Server

**Windows:**
```
python app.py
```

**Mac/Linux:**
```
python3 app.py
```

You should see: `Running on http://127.0.0.1:5000`

**Keep the terminal window open** - the server needs to keep running.

---

## Step 6: Open in Browser

1. Open your web browser
2. Go to: `http://localhost:5000`
3. The EcoDengue website should appear!

---

## Using EcoDengue

1. **Enter Data:** Fill in the 6 input fields:
   - Waste Disposal %
   - Stagnant Water Free %
   - Drainage Score (1-5)
   - Temperature (°C)
   - Rainfall (Rainy Days)
   - Clean-Up Drive Frequency

2. **Calculate:** Click "Compute Prediction"

3. **View Results:** See predicted dengue cases, risk level, and AI recommendations

4. **Export:** Download PDF or copy results to clipboard

---

## Troubleshooting

**Problem: "Python not found"**
- Make sure Python is installed: https://www.python.org/downloads/
- Check if you need to use `python3` instead of `python`

**Problem: "pip not found"**
- Make sure pip is installed with Python
- Try `python -m pip` instead of just `pip`

**Problem: "Port 5000 already in use"**
- Another program is using port 5000
- Close other programs or change the port in `app.py`

**Problem: "AI recommendations not loading"**
- Check your internet connection
- Make sure the server is running
- Check browser console for errors (F12)

**Problem: "Module not found"**
- Make sure virtual environment is activated
- Reinstall packages: `pip install -r requirements.txt`

---

## Stopping the Server

To stop the server:
1. Go to the terminal window where it's running
2. Press `CTRL + C` (or `CMD + C` on Mac)
3. To deactivate virtual environment, type: `deactivate`

---

## Next Steps

- Read `HOW_IT_WORKS.md` to understand the calculations
- Read `AI_RECOMMENDATIONS.md` to understand how AI recommendations work
- Start predicting dengue outbreaks and getting prevention recommendations!

That's it! You're ready to use EcoDengue! 🎉

