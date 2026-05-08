/**
 * Sobe e Desce - Frontend Application
 * Handles UI interactions and API communication
 */

// Dynamically set API URL based on current location
const API_BASE_URL = window.location.origin;

class GameClient {
    constructor() {
        this.gameState = null;
        this.players = [];
        this.startingScore = 25;
        this.filterActive = false;
    }

    async init() {
        // Setup event listeners
        document.getElementById("playerCount").addEventListener("change", this.onPlayerCountChange.bind(this));
        document.getElementById("startGameBtn").addEventListener("click", this.startGame.bind(this));
        document.getElementById("resetGameBtn").addEventListener("click", this.showSetupScreen.bind(this));
        
        const filterToggle = document.getElementById("filterToggle");
        if (filterToggle) {
            filterToggle.addEventListener("click", this.toggleFilter.bind(this));
        }

        // Action buttons
        document.querySelectorAll(".btn-action, .btn-lerpa, .btn-skip").forEach(btn => {
            btn.addEventListener("click", this.onActionClick.bind(this));
        });

        // Initial render
        this.onPlayerCountChange();
    }

    onPlayerCountChange() {
        const count = parseInt(document.getElementById("playerCount").value);
        const playersInput = document.getElementById("playersInput");
        playersInput.innerHTML = "";

        for (let i = 0; i < count; i++) {
            const group = document.createElement("div");
            group.className = "player-input-group";
            group.innerHTML = `
                <label>Player ${i + 1}:</label>
                <input type="text" class="player-name-input" placeholder="Enter name" value="Player ${i + 1}">
            `;
            playersInput.appendChild(group);
        }
    }

    async startGame() {
        const startingScore = parseInt(document.getElementById("startingScore").value) || 25;
        const playerInputs = document.querySelectorAll(".player-name-input");
        
        this.players = [];
        this.startingScore = startingScore;

        playerInputs.forEach((input, index) => {
            this.players.push({
                name: input.value || `Player ${index + 1}`,
                starting_score: startingScore
            });
        });

        try {
            const response = await fetch(`${API_BASE_URL}/init`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ players: this.players })
            });

            if (!response.ok) {
                alert("Error starting game");
                return;
            }

            const data = await response.json();
            this.gameState = data.state;
            this.showGameScreen();
            this.updateUI();
        } catch (error) {
            console.error("Error:", error);
            alert("Could not connect to server. Make sure backend is running on port 5000.");
        }
    }

    async onActionClick(e) {
        const action = e.target.getAttribute("data-action");
        
        try {
            const response = await fetch(`${API_BASE_URL}/turn`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    player_id: this.gameState.current_player_id,
                    action: action,
                    multiplier: this.filterActive ? 2 : 1
                })
            });

            const data = await response.json();

            if (data.success && data.game_state) {
                this.gameState = data.game_state;
                this.updateUI();

                // Check if game is over
                if (this.gameState.game_over && this.gameState.winner) {
                    this.showWinner(this.gameState.winner);
                }
            } else if (data.warning) {
                // Show warning for 2 consecutive skips
                alert(data.message);
            } else if (data.error) {
                alert(data.error);
            } else {
                alert(data.message || "Error recording turn");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Connection error: " + error.message);
        }
    }

    toggleFilter() {
        this.filterActive = !this.filterActive;
        const btn = document.getElementById("filterToggle");
        btn.classList.toggle("active");
        btn.textContent = this.filterActive ? "Filter: ON (2x)" : "Filter: OFF";
    }

    updateUI() {
        // Update current player info
        const currentPlayer = this.gameState.players[this.gameState.current_player_id];
        document.getElementById("currentPlayerName").textContent = currentPlayer.name;
        document.getElementById("currentScore").textContent = currentPlayer.current_score;
        document.getElementById("currentRound").textContent = this.gameState.current_round + 1;

        // Update leaderboard
        this.updateLeaderboard();
    }

    updateLeaderboard() {
        const headerRow = document.getElementById("headerRow");
        const leaderboardBody = document.getElementById("leaderboardBody");

        // Clear existing rows except the first cell
        while (headerRow.children.length > 1) {
            headerRow.removeChild(headerRow.lastChild);
        }

        // Add player headers
        this.gameState.players.forEach(player => {
            const th = document.createElement("th");
            th.textContent = player.name;
            headerRow.appendChild(th);
        });

        // Clear body
        leaderboardBody.innerHTML = "";

        // Add round rows
        this.gameState.rounds_history.forEach((round, roundIdx) => {
            const tr = document.createElement("tr");
            
            // Round label
            const roundCell = document.createElement("td");
            roundCell.className = "round-label";
            roundCell.textContent = `Round ${roundIdx + 1}`;
            tr.appendChild(roundCell);

            // Player scores for this round
            this.gameState.players.forEach(player => {
                const td = document.createElement("td");
                const actionData = round[player.id];
                
                let action = actionData;
                let multiplier = 1;
                
                // Handle new format (object with action and multiplier)
                if (typeof actionData === "object" && actionData !== null) {
                    action = actionData.action;
                    multiplier = actionData.multiplier || 1;
                }
                
                if (action === "skip") {
                    td.textContent = "-";
                    td.style.color = "#999";
                } else {
                    // Calculate score at this point
                    let score = player.starting_score;
                    for (let i = 0; i <= roundIdx; i++) {
                        const roundAction = this.gameState.rounds_history[i][player.id];
                        let act = roundAction;
                        let mult = 1;
                        
                        if (typeof roundAction === "object" && roundAction !== null) {
                            act = roundAction.action;
                            mult = roundAction.multiplier || 1;
                        }
                        
                        if (act === "skip") {
                            // No change
                        } else if (act === "lerpa") {
                            score += 5 * mult;
                        } else if (act) {
                            score -= parseInt(act) * mult;
                        }
                    }
                    td.textContent = score;
                    td.style.fontWeight = "600";
                    td.style.color = score <= 0 ? "#dc3545" : "#667eea";
                }
                
                tr.appendChild(td);
            });

            leaderboardBody.appendChild(tr);
        });
    }

    showWinner(winnerName) {
        const winnerDisplay = document.getElementById("winnerDisplay");
        winnerDisplay.textContent = `🎉 ${winnerName} Wins! 🎉`;
        winnerDisplay.style.display = "inline";

        // Disable action buttons
        document.querySelectorAll(".btn-action, .btn-lerpa, .btn-skip").forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = "0.5";
        });
    }

    showGameScreen() {
        this.filterActive = false;
        const filterBtn = document.getElementById("filterToggle");
        if (filterBtn) {
            filterBtn.classList.remove("active");
            filterBtn.textContent = "Filter: OFF";
        }
        document.getElementById("setupScreen").classList.add("hidden");
        document.getElementById("gameScreen").classList.remove("hidden");
    }

    showSetupScreen() {
        document.getElementById("gameScreen").classList.add("hidden");
        document.getElementById("setupScreen").classList.remove("hidden");
        document.getElementById("winnerDisplay").style.display = "none";
        document.querySelectorAll(".btn-action, .btn-lerpa, .btn-skip").forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = "1";
        });
    }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    const game = new GameClient();
    game.init();
});
