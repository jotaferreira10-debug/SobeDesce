"""
Flask API for Sobe e Desce game server.
Provides endpoints for game management and turn recording.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from game_state import GameState

app = Flask(__name__)
CORS(app)

# Global game state instance
game = GameState()


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok"}), 200


@app.route("/init", methods=["POST"])
def init_game():
    """
    Initialize a new game.
    Expects JSON: {players: [{name: "Player1", starting_score: 25}, ...]}
    """
    try:
        data = request.json
        players = data.get("players", [])
        
        if len(players) < 4 or len(players) > 5:
            return jsonify({"error": "Need 4-5 players"}), 400
        
        # Reset game
        game.players = []
        game.reset()
        
        # Add players
        for player_data in players:
            name = player_data.get("name", f"Player {len(game.players) + 1}")
            starting_score = player_data.get("starting_score", 25)
            game.add_player(name, starting_score)
        
        # Start the game
        game.start_game()
        
        return jsonify({
            "message": "Game initialized",
            "state": game.get_state()
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/state", methods=["GET"])
def get_state():
    """Get current game state."""
    return jsonify(game.get_state()), 200


@app.route("/turn", methods=["POST"])
def record_turn():
    """
    Record a player's turn.
    Expects JSON: {player_id: 0, action: "1"} or {"player_id": 0, "action": "lerpa"}
    """
    try:
        data = request.json
        player_id = data.get("player_id")
        action = data.get("action", "").lower()
        
        if player_id is None:
            return jsonify({"error": "player_id required"}), 400
        
        result = game.record_turn(player_id, action)
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/reset", methods=["POST"])
def reset_game():
    """Reset the current game."""
    try:
        game.reset()
        return jsonify({
            "message": "Game reset",
            "state": game.get_state()
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    # Run on localhost:5000
    app.run(debug=False, host="127.0.0.1", port=5000)
