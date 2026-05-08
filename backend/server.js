/**
 * Express API Server for Sobe e Desce
 * Provides game management endpoints
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
const GameState = require("./GameState");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, "../frontend")));

// Global game state instance
const game = new GameState();

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// Initialize game
app.post("/init", (req, res) => {
    try {
        const { players } = req.body;

        if (!players || players.length < 4 || players.length > 5) {
            return res.status(400).json({ error: "Need 4-5 players" });
        }

        // Reset and reinitialize
        game.players = [];
        game.reset();

        // Add players
        for (let playerData of players) {
            const name = playerData.name || `Player ${game.players.length + 1}`;
            const startingScore = playerData.starting_score || 25;
            game.addPlayer(name, startingScore);
        }

        game.startGame();

        res.json({
            message: "Game initialized",
            state: game.getState()
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get current state
app.get("/state", (req, res) => {
    res.json(game.getState());
});

// Record a turn
app.post("/turn", (req, res) => {
    try {
        const { player_id, action, multiplier } = req.body;

        if (player_id === undefined) {
            return res.status(400).json({ error: "player_id required" });
        }

        const result = game.recordTurn(player_id, action || "", multiplier || 1);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Reset game
app.post("/reset", (req, res) => {
    try {
        game.reset();
        res.json({
            message: "Game reset",
            state: game.getState()
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Serve index.html for root path (for web deployment)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sobe e Desce server running on port ${PORT}`);
});

module.exports = app;
