# Sobe e Desce - Game Score Tracker

A lightweight desktop application for tracking scores in the "Sobe e Desce" game with up to 5 players.

## Features

- ✅ 4-5 player support
- ✅ Real-time score tracking
- ✅ Points per round: 1-5 or Lerpa (+5)
- ✅ Skip turn option
- ✅ Game history display in table format
- ✅ Win condition: First to 0 or below
- ✅ Fast, responsive UI
- ✅ Desktop app (Electron)
- ✅ No database required

## Project Structure

```
Sobe e Desce/
├── backend/              # Python Flask API
│   ├── api.py           # Flask server
│   ├── game_state.py    # Game logic
│   └── requirements.txt  # Python dependencies
├── frontend/            # Web UI
│   ├── index.html       # HTML structure
│   ├── app.js          # JavaScript logic
│   └── styles.css      # Styling
├── desktop/            # Electron wrapper
│   ├── main.js         # Electron entry point
│   └── preload.js      # Security preload
└── package.json        # Node dependencies
```

## Setup & Installation

### Prerequisites

- **Python 3.7+** - [Download](https://www.python.org/downloads/)
- **Node.js 14+** - [Download](https://nodejs.org/)

### Step 1: Install Backend Dependencies

```bash
cd "Sobe e Desce\backend"
pip install -r requirements.txt
```

### Step 2: Install Frontend/Electron Dependencies

```bash
cd "Sobe e Desce"
npm install
```

## Running the App

### Option 1: Desktop App (Recommended)

```bash
cd "Sobe e Desce"
npm start
```

The app will:
1. Automatically start the Python backend server (port 5000)
2. Launch the Electron desktop window
3. Load the game interface

### Option 2: Web Browser (Development)

**Terminal 1 - Start Backend:**
```bash
cd "Sobe e Desce\backend"
python api.py
```

**Terminal 2 - Start Frontend Server:**
```bash
cd "Sobe e Desce\frontend"
python -m http.server 8000
```

Then open: `http://localhost:8000`

## How to Play

1. **Setup**: Select number of players (4-5), enter names, set starting score (default 25)
2. **Game**: 
   - Current player's name is displayed prominently
   - Click buttons to record actions:
     - **1-5**: Subtract that many points
     - **Lerpa**: Add 5 points
     - **Skip**: Keep score unchanged
3. **Winning**: First player to reach 0 or below wins
4. **History**: All rounds displayed in a table showing actions per player

## Game Rules

- **Round Structure**: All players take one turn per round, then advance to next round
- **Scoring**: 
  - Points 1-5: Deduct from score
  - Lerpa: Add 5 points
  - Skip: No change
- **Win Condition**: First player to ≤ 0 points wins
- **Table Display**: Shows each round horizontally with player scores/actions

## Troubleshooting

### "Could not connect to server" error
- Make sure you ran `npm install` in the main directory
- Check Python is installed: `python --version`
- Make sure port 5000 is not in use

### Backend won't start
```bash
# Try running backend manually
cd "Sobe e Desce\backend"
python api.py
```

### Electron won't launch
```bash
# Make sure all dependencies are installed
npm install

# Clear cache and try again
npm start
```

## API Endpoints

The backend provides these REST endpoints:

- `POST /init` - Initialize new game
- `GET /state` - Get current game state
- `POST /turn` - Record player action
- `POST /reset` - Reset game
- `GET /health` - Health check

## Development Notes

- Frontend makes HTTP requests to `http://127.0.0.1:5000`
- No database - all state is in-memory
- Session-only persistence (refresh loses data)
- Built with vanilla JS (no heavy frameworks)

## Building for Distribution

```bash
npm run build
```

This creates an installer in the `dist/` folder.

---

**Enjoy your game!** 🎮
