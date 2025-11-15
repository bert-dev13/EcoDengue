# How EcoDengue Works: Simple Guide

## What Does EcoDengue Do?

EcoDengue helps predict how many dengue cases might happen in a community. It uses math to calculate and AI to suggest ways to prevent outbreaks.

---

## Step 1: You Enter Information

You need to provide 6 things:

1. **Waste Disposal %** - What percentage of houses properly dispose of waste? (0-100%)
2. **Stagnant Water Free %** - What percentage of houses have no standing water? (0-100%)
3. **Drainage Score** - How good is the drainage system? (1-5, where 5 is best)
4. **Temperature** - What's the average temperature? (in Celsius)
5. **Rainfall** - How many rainy days are there? (number of days)
6. **Clean-Up Drive Frequency** - How often do community clean-ups happen? (number of times)

**Example:**
- Waste Disposal: 80%
- Stagnant Water Free: 90%
- Drainage Score: 3 (out of 5)
- Temperature: 28°C
- Rainfall: 100 rainy days
- Clean-Up Frequency: 4 times

The system checks that all numbers are valid before calculating.

---

## Step 2: The System Calculates Dengue Cases

The system uses this formula:

```
Dengue Cases = 260.819 - (2.057 × Waste Disposal %) - (0.194 × Stagnant Water Free %) - (1.318 × Drainage Score) - (0.609 × Temperature) - (0.222 × Rainfall) - (0.274 × Clean-Up Frequency)
```

### What Each Part Means:

- **260.819** - Starting number
- **- (2.057 × Waste Disposal %)** - Better waste disposal reduces cases (that's why it's minus)
- **- (0.194 × Stagnant Water Free %)** - Less standing water reduces cases (that's why it's minus)
- **- (1.318 × Drainage Score)** - Better drainage reduces cases (that's why it's minus)
- **- (0.609 × Temperature)** - Higher temperature reduces cases (that's why it's minus)
- **- (0.222 × Rainfall)** - More rain reduces cases (that's why it's minus)
- **- (0.274 × Clean-Up Frequency)** - More clean-ups reduce cases (that's why it's minus)

### Example Calculation:

**Input:**
- Waste Disposal: 80%
- Stagnant Water Free: 90%
- Drainage Score: 3
- Temperature: 28°C
- Rainfall: 100 rainy days
- Clean-Up Frequency: 4 times

**Calculation:**
```
Dengue Cases = 260.819 - (2.057 × 80) - (0.194 × 90) - (1.318 × 3) - (0.609 × 28) - (0.222 × 100) - (0.274 × 4)
            = 260.819 - 164.56 - 17.46 - 3.954 - 17.052 - 22.2 - 1.096
            = 34.497 cases
```

**Result:** About 35 dengue cases are predicted

### Risk Levels:

After calculating, the system shows the risk:
- **Low Risk** ✅ - Less than 20 cases (Continue monitoring)
- **Moderate Risk** ⚠️ - 20 to 50 cases (Take preventive actions)
- **High Risk** 🚨 - More than 50 cases (Immediate action needed)

---

## Step 3: AI Gives Recommendations

After calculating, the AI suggests ways to prevent dengue outbreaks.

### How AI Works:

1. The system sends your input values and predicted cases to the AI
2. The AI thinks about which actions work best for your situation
3. The AI gives you recommendations organized into categories:

#### Type 1: Waste Management Strategies 🗑️

The AI tells you how to improve waste disposal:

**Example:**
- Implement regular waste collection schedules
- Organize recycling programs in the community
- Distribute waste bins to households

**How AI decides:**
- If waste disposal is low, it suggests more waste management actions
- Different strategies for different community needs

#### Type 2: Vector Control Measures 🦟

The AI tells you how to control mosquitoes:

**Example:**
- Conduct regular fogging activities
- Apply larvicidal treatments to standing water
- Install mosquito traps in high-risk areas

**How AI decides:**
- More stagnant water = more mosquito control needed
- Suggests different control methods based on your situation

#### Type 3: Community Health Tips 👥

The AI tells you how to protect people:

**Example:**
- Distribute mosquito repellents to vulnerable populations
- Promote use of mosquito nets
- Advise wearing protective clothing

#### Type 4: Environmental Interventions 🌿

The AI tells you how to improve the environment:

**Example:**
- Improve drainage systems in low-lying areas
- Organize community clean-up drives
- Remove debris that collects water

#### Type 5: Preventive Measures 🛡️

The AI tells you how to prevent outbreaks:

**Example:**
- Establish early detection systems
- Set up surveillance monitoring
- Create mobile health units

#### Type 6: Public Awareness & Education 📢

The AI tells you how to educate the community:

**Example:**
- Organize dengue awareness campaigns
- Conduct workshops on prevention
- Distribute educational pamphlets

---

## Complete Example

**Step 1: You Enter**
- Waste Disposal: 75%
- Stagnant Water Free: 85%
- Drainage Score: 2 (out of 5)
- Temperature: 30°C
- Rainfall: 120 rainy days
- Clean-Up Frequency: 3 times

**Step 2: System Calculates**
```
Dengue Cases = 260.819 - (2.057 × 75) - (0.194 × 85) - (1.318 × 2) - (0.609 × 30) - (0.222 × 120) - (0.274 × 3)
            = 260.819 - 154.275 - 16.49 - 2.636 - 18.27 - 26.64 - 0.822
            = 41.686 cases
```

**Result:** About 42 dengue cases are predicted (Moderate Risk ⚠️)

**Step 3: AI Recommends**
- **Waste Management:** Improve waste collection, organize recycling programs
- **Vector Control:** Conduct fogging, apply larvicides, install traps
- **Community Health:** Distribute repellents, promote mosquito nets
- **Environmental:** Improve drainage, organize more clean-ups
- **Prevention:** Establish surveillance, set up early detection
- **Awareness:** Organize campaigns, conduct workshops

**Step 4: You Get Results**
- You see the predicted dengue cases
- You see the risk level
- You see recommended actions in organized categories
- You can download a PDF or copy the results

---

## Simple Summary

1. **You enter** → Waste disposal %, stagnant water %, drainage score, temperature, rainfall, clean-up frequency
2. **System calculates** → Uses formula to predict dengue cases
3. **AI suggests** → Recommends prevention strategies organized by category
4. **You get results** → See predictions, risk level, and recommendations

### Important Points:

- ✅ Better waste disposal = fewer cases
- ✅ Less standing water = fewer cases
- ✅ Better drainage = fewer cases
- ✅ Higher temperature = fewer cases (up to a point)
- ✅ More rainfall = fewer cases
- ✅ More clean-ups = fewer cases
- ✅ The AI uses your specific information to give personalized recommendations
- ✅ All recommendations are organized into clear categories

---

## Common Questions

**Q: Why can't dengue cases be negative?**
A: You can't have negative cases. You either have cases or you don't. The system ensures the result is at least 0.

**Q: How accurate is this?**
A: It's an estimate based on real data and statistical analysis. Actual results may vary based on many factors.

**Q: Why do higher temperatures reduce cases?**
A: While mosquitoes thrive in warm weather, very high temperatures combined with other factors in the formula indicate different conditions that may reduce cases. The formula is based on actual data analysis.

**Q: How does AI decide what to recommend?**
A: The AI looks at your specific inputs and predicted cases. If waste disposal is low, it suggests waste management. If stagnant water is high, it suggests vector control. It personalizes recommendations for your situation.

**Q: What if I get High Risk?**
A: High risk means immediate action is needed. Follow the AI recommendations, especially vector control and community health measures. Consider consulting health professionals.

**Q: Can I use this for different communities?**
A: Yes! Enter the data for each community separately. The predictions and recommendations will be personalized for each community's specific conditions.

---

That's it! The system is simple: enter data → get calculation → get AI recommendations → take action to prevent dengue outbreaks.

