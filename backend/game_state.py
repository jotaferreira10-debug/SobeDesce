"""
Game state management for Sobe e Desce score tracker.
Handles player management, round tracking, and score calculations.
"""


class GameState:
    def __init__(self):
        self.players = []  # List of {id, name, starting_score}
        self.current_round = 0
        self.current_player_index = 0
        self.rounds_history = []  # List of rounds, each round contains {player_id: action}
        self.game_over = False
        self.winner = None
    
    def add_player(self, name, starting_score=25):
        """Add a player to the game."""
        player_id = len(self.players)
        self.players.append({
            "id": player_id,
            "name": name,
            "starting_score": starting_score
        })
        return player_id
    
    def start_game(self):
        """Initialize the game."""
        if len(self.players) < 4:
            raise ValueError("Need at least 4 players to start")
        self.current_round = 0
        self.current_player_index = 0
        self.rounds_history = []
        self.game_over = False
        self.winner = None
    
    def get_player_score(self, player_id):
        """Calculate current score for a player based on all recorded actions."""
        if player_id < 0 or player_id >= len(self.players):
            return None
        
        player = self.players[player_id]
        current_score = player["starting_score"]
        
        # Iterate through all rounds and apply actions
        for round_idx, round_data in enumerate(self.rounds_history):
            if player_id in round_data:
                action = round_data[player_id]
                if action == "skip":
                    continue  # No score change
                elif action == "lerpa":
                    current_score += 5
                else:
                    # It's a number (1-5) - subtract from score
                    try:
                        current_score -= int(action)
                    except ValueError:
                        pass
        
        return current_score
    
    def record_turn(self, player_id, action):
        """
        Record a player's action (1-5, 'lerpa', or 'skip').
        Returns: {success: bool, message: str, game_state: dict}
        """
        if self.game_over:
            return {"success": False, "message": "Game is over"}
        
        if player_id != self.current_player_index:
            return {"success": False, "message": f"It's player {self.players[self.current_player_index]['name']}'s turn"}
        
        # Validate action
        if action not in ["1", "2", "3", "4", "5", "lerpa", "skip"]:
            return {"success": False, "message": "Invalid action"}
        
        # Ensure we have enough rounds history
        if len(self.rounds_history) <= self.current_round:
            self.rounds_history.append({})
        
        # Record the action
        self.rounds_history[self.current_round][player_id] = action
        
        # Calculate new score
        new_score = self.get_player_score(player_id)
        
        # Check win condition (score <= 0)
        if new_score <= 0:
            self.game_over = True
            self.winner = player_id
            return {
                "success": True,
                "message": f"{self.players[player_id]['name']} wins!",
                "game_state": self.get_state(),
                "winner": player_id
            }
        
        # Move to next player
        self._advance_to_next_player()
        
        return {
            "success": True,
            "message": f"Recorded turn for {self.players[player_id]['name']}",
            "game_state": self.get_state()
        }
    
    def _advance_to_next_player(self):
        """Move to the next player. If all players have played, advance round."""
        self.current_player_index += 1
        
        if self.current_player_index >= len(self.players):
            # All players have played this round
            self.current_player_index = 0
            self.current_round += 1
    
    def get_state(self):
        """Get current game state as a dictionary."""
        state = {
            "players": [],
            "current_round": self.current_round,
            "current_player_id": self.current_player_index,
            "current_player_name": self.players[self.current_player_index]["name"] if not self.game_over else None,
            "game_over": self.game_over,
            "winner": self.players[self.winner]["name"] if self.winner is not None else None,
            "rounds_history": []
        }
        
        # Add player data with current scores
        for player in self.players:
            state["players"].append({
                "id": player["id"],
                "name": player["name"],
                "starting_score": player["starting_score"],
                "current_score": self.get_player_score(player["id"])
            })
        
        # Build rounds history for display
        for round_idx, round_data in enumerate(self.rounds_history):
            round_display = {}
            for player_id, action in round_data.items():
                round_display[player_id] = action
            state["rounds_history"].append(round_display)
        
        return state
    
    def skip_turn(self, player_id):
        """Shortcut to record a skip action."""
        return self.record_turn(player_id, "skip")
    
    def reset(self):
        """Reset the game to initial state."""
        self.current_round = 0
        self.current_player_index = 0
        self.rounds_history = []
        self.game_over = False
        self.winner = None
