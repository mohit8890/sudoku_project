from flask import Flask, jsonify, render_template, request

from sudoku_engine import make_puzzle

app = Flask(__name__, template_folder="templates", static_folder="static")


@app.route("/")
def homepage():
    return render_template("index.html")


@app.route("/puzzle")
def puzzle_endpoint():
    difficulty = request.args.get("difficulty", "medium")
    puzzle, solution = make_puzzle(difficulty)
    return jsonify({"puzzle": puzzle, "solution": solution})


if __name__ == "__main__":
    app.run(debug=True)
