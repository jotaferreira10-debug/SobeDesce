/**
 * Game State Management for Sobe e Desce
 * Handles player management, round tracking, and score calculations
 */

class GameState {
    constructor() {
        this.players = [];
        this.currentRound = 0;
        this.currentPlayerIndex = 0;
        this.roundsHistory = [];
        this.gameOver = false;
        this.winner = null;
    }

    addPlayer(name, startingScore = 25) {
        const playerId = this.players.length;
        this.players.push({
            id: playerId,
            name: name,
            starting_score: startingScore
        });
        return playerId;
    }

    startGame() {
        if (this.players.length < 4) {
            throw new Error("Need at least 4 players to start");
        }
        this.currentRound = 0;
        this.currentPlayerIndex = 0;
        this.roundsHistory = [];
        this.gameOver = false;
        this.winner = null;
    }

    getPlayerScore(playerId) {
        if (playerId < 0 || playerId >= this.players.length) {
            return null;
        }

        const player = this.players[playerId];
        let currentScore = player.starting_score;

        for (let round of this.roundsHistory) {
            if (playerId in round) {
                let action = round[playerId];
                let multiplier = 1;
                
                // Handle both object and string formats
                if (typeof action === "object" && action !== null) {
                    multiplier = action.multiplier || 1;
                    action = action.action;
                }
                
                if (action === "skip") {
                    // No change
                } else if (action === "lerpa") {
                    currentScore += 5 * multiplier;
                } else {
                    const points = parseInt(action);
                    if (!isNaN(points)) {
                        currentScore -= points * multiplier;
                    }
                }
            }
        }

        return currentScore;
    }

    recordTurn(playerId, action, multiplier = 1) {
        if (this.gameOver) {
            return {
                success: false,
                message: "Game is over"
            };
        }

        if (playerId !== this.currentPlayerIndex) {
            return {
                success: false,
                message: `It's player ${this.players[this.currentPlayerIndex].name}'s turn`
            };
        }

        const validActions = ["1", "2", "3", "4", "5", "lerpa", "skip"];
        if (!validActions.includes(action.toLowerCase())) {
            return {
                success: false,
                message: "Invalid action"
            };
        }

        // Check for 3 consecutive skips (allow 2, prevent on 3rd)
        if (action.toLowerCase() === "skip") {
            // Check if player skipped in the previous 2 rounds
            if (this.currentRound > 1) {
                const previousRound = this.roundsHistory[this.currentRound - 1];
                const twoRoundsAgo = this.roundsHistory[this.currentRound - 2];
                
                if (previousRound && previousRound[playerId] && twoRoundsAgo && twoRoundsAgo[playerId]) {
                    let prevAction = previousRound[playerId];
                    let twoRoundsAgoAction = twoRoundsAgo[playerId];
                    
                    // Handle both object and string formats
                    if (typeof prevAction === "object") {
                        prevAction = prevAction.action;
                    }
                    if (typeof twoRoundsAgoAction === "object") {
                        twoRoundsAgoAction = twoRoundsAgoAction.action;
                    }
                    
                    if (prevAction === "skip" && twoRoundsAgoAction === "skip") {
                        return {
                            success: false,
                            message: "Tens de ir na próxima",
                            warning: true
                        };
                    }
                }
            }
        }

        if (this.roundsHistory.length <= this.currentRound) {
            this.roundsHistory.push({});
        }

        this.roundsHistory[this.currentRound][playerId] = { 
            action: action.toLowerCase(),
            multiplier: multiplier
        };

        const newScore = this.getPlayerScore(playerId);
        
        // Store previous player index to know when round ends
        const wasLastPlayerInRound = this.currentPlayerIndex === this.players.length - 1;
        
        this.advanceToNextPlayer();

        // Check win condition only at the END of a round
        if (wasLastPlayerInRound && newScore <= 0) {
            this.gameOver = true;
            this.winner = playerId;
            return {
                success: true,
                message: `${this.players[playerId].name} wins!`,
                game_state: this.getState(),
                winner: playerId
            };
        }

        return {
            success: true,
            message: `Recorded turn for ${this.players[playerId].name}`,
            game_state: this.getState()
        };
    }

    advanceToNextPlayer() {
        this.currentPlayerIndex += 1;

        if (this.currentPlayerIndex >= this.players.length) {
            this.currentPlayerIndex = 0;
            this.currentRound += 1;
        }
    }

    getState() {
        const state = {
            players: [],
            current_round: this.currentRound,
            current_player_id: this.currentPlayerIndex,
            current_player_name: this.gameOver ? null : this.players[this.currentPlayerIndex].name,
            game_over: this.gameOver,
            winner: this.winner !== null ? this.players[this.winner].name : null,
            rounds_history: []
        };

        for (let player of this.players) {
            state.players.push({
                id: player.id,
                name: player.name,
                starting_score: player.starting_score,
                current_score: this.getPlayerScore(player.id)
            });
        }

        for (let roundData of this.roundsHistory) {
            state.rounds_history.push(roundData);
        }

        return state;
    }

    reset() {
        this.currentRound = 0;
        this.currentPlayerIndex = 0;
        this.roundsHistory = [];
        this.gameOver = false;
        this.winner = null;
    }
}

module.exports = GameState;
