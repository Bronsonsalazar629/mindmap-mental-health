\

### Pre-Demo Setup (Run Before Call)
```javascript
window.biasDebug.researchDemo.resetForDemo()
```

```javascript
window.biasDebug.researchDemo.generateFullDataset()
```

```javascript
window.biasDebug.researchDemo.setDemoProfile("vulnerable")
```

---


**1. Show Current Statistics:**
```javascript
window.biasDebug.researchDemo.showQuickStats()
```

**2. Run Live Bias Detection Demo:**
```javascript
window.biasDebug.researchDemo.runLiveDemo()
```

**3. Check What Tools Are Available:**
```javascript
console.log("Bias detection active:", !!window.biasDetection)
```

**4. Show Generated Bias Events:**
```javascript
window.biasEventLog
```

**5. Get Current Metrics:**
```javascript
window.biasDetection.getBiasMetrics()
```

---

### Backup Commands (If Main Tools Don't Work)

**Alternative Demo Data:**
```javascript
window.generateDemoData()
```

**Manual Profile Setup:**
```javascript
userProfile = {age: 67, gender: 'female', insurance: 'medicaid', race: 'black', location: 'rural'}
```

**Check Available Functions:**
```javascript
Object.keys(window).filter(k => k.includes('bias') || k.includes('Demo'))
```

---

### User Profile Options

**Vulnerable User:**
```javascript
window.biasDebug.researchDemo.setDemoProfile("vulnerable")
```

**Privileged User:**
```javascript
window.biasDebug.researchDemo.setDemoProfile("privileged")
```

**Diverse Background:**
```javascript
window.biasDebug.researchDemo.setDemoProfile("diverse")
```

---

### Quick Demo Flow
1. `resetForDemo()` → Clean slate
2. `generateFullDataset()` → Create impressive data  
3. `showQuickStats()` → Show results
4. `runLiveDemo()` → Live demonstration
5. Then show the UI analytics panel

---

### Demo Navigation
- **Open Analytics Panel:** Click "View Insights" in sidebar
- **Detailed Report:** Click "View Details" in analytics panel
- **Browser Console:** F12 → Console tab
- **App URL:** http://127.0.0.1:53553

---

### Expected Output Examples

**After generateFullDataset():**
- Geographic Areas Monitored: 3
- User Profiles Tracked: 20+
- Bias Events Detected: 15+
- High Severity Issues: 5+

**After runLiveDemo():**
- Console shows comparison between insured vs uninsured users
- Different result quality displayed
- Bias detection alerts triggered

---

