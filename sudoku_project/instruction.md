# Copilot Assistant Instructions

Use Copilot to help build a modern Sudoku game while keeping code clean and modular.

Goals:
- Keep Python code organized into reusable modules.
- Use type hints, docstrings, and clear function names.
- Separate game logic (`sudoku_engine.py`) from the Flask app and frontend.
- Use simple, responsive CSS and a clean dark/light mode design.
- Keep the HTML accessible and mobile-friendly.

Style guidelines:
- Prefer plain Python and standard library modules.
- Avoid global state where possible.
- Use Flask route handlers only for view rendering and API data.
- Keep JavaScript focused on UI state and frontend validation.
- Keep the app easy to run locally with `python main.py`.

Feature priorities:
1. Generate Sudoku puzzles with one unique solution.
2. Support difficulty levels (Easy, Medium, Hard).
3. Highlight invalid moves and incorrect cells.
4. Provide a hint button and a final completion message.
5. Save a top 10 scoreboard using browser local storage.
6. Include a timer and dark mode toggle.

Testing:
- Add pytest tests for Sudoku board generation, board validation, and Flask endpoints.
- Keep tests simple, deterministic, and fast.
- Update `README.md` with the run and test commands.
