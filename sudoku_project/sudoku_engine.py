import random
from copy import deepcopy
from typing import List, Optional, Tuple

Board = List[List[int]]


def empty_board() -> Board:
    return [[0 for _ in range(9)] for _ in range(9)]


def is_valid_move(board: Board, row: int, col: int, value: int) -> bool:
    if value < 1 or value > 9:
        return False

    if any(board[row][c] == value for c in range(9)):
        return False

    if any(board[r][col] == value for r in range(9)):
        return False

    start_row = (row // 3) * 3
    start_col = (col // 3) * 3
    for r in range(start_row, start_row + 3):
        for c in range(start_col, start_col + 3):
            if board[r][c] == value:
                return False

    return True


def find_empty_cell(board: Board) -> Optional[Tuple[int, int]]:
    for r in range(9):
        for c in range(9):
            if board[r][c] == 0:
                return r, c
    return None


def solve(board: Board, find_all: bool = False, limit: int = 2) -> int:
    empty = find_empty_cell(board)
    if not empty:
        return 1

    row, col = empty
    solutions = 0
    for value in range(1, 10):
        if is_valid_move(board, row, col, value):
            board[row][col] = value
            solutions += solve(board, find_all=find_all, limit=limit)
            board[row][col] = 0
            if solutions >= limit:
                return solutions
            if not find_all and solutions > 0:
                return solutions
    return solutions


def solve_board(board: Board) -> bool:
    empty = find_empty_cell(board)
    if not empty:
        return True

    row, col = empty
    for value in range(1, 10):
        if is_valid_move(board, row, col, value):
            board[row][col] = value
            if solve_board(board):
                return True
            board[row][col] = 0

    return False


def count_solutions(board: Board, limit: int = 2) -> int:
    return solve(deepcopy(board), find_all=True, limit=limit)


def generate_full_board() -> Board:
    board = empty_board()
    digits = list(range(1, 10))

    def backtrack(position: int = 0) -> bool:
        if position == 81:
            return True

        row, col = divmod(position, 9)
        random.shuffle(digits)
        for value in digits:
            if is_valid_move(board, row, col, value):
                board[row][col] = value
                if backtrack(position + 1):
                    return True
                board[row][col] = 0
        return False

    backtrack()
    return board


def make_puzzle(difficulty: str = "medium") -> Tuple[Board, Board]:
    full_board = generate_full_board()
    puzzle = deepcopy(full_board)

    difficulty = difficulty.lower()
    removal_goals = {
        "easy": 40,
        "medium": 50,
        "hard": 55,
    }
    target_removals = removal_goals.get(difficulty, 50)
    removed_cells = 0

    cell_indices = list(range(81))
    random.shuffle(cell_indices)

    for index in cell_indices:
        if removed_cells >= target_removals:
            break

        row, col = divmod(index, 9)
        backup = puzzle[row][col]
        puzzle[row][col] = 0

        if count_solutions(puzzle, limit=2) != 1:
            puzzle[row][col] = backup
        else:
            removed_cells += 1

    return puzzle, full_board


def board_is_complete(board: Board) -> bool:
    return all(board[r][c] != 0 for r in range(9) for c in range(9))


def board_is_valid(board: Board) -> bool:
    for row in range(9):
        for col in range(9):
            value = board[row][col]
            if value == 0:
                continue
            board[row][col] = 0
            if not is_valid_move(board, row, col, value):
                board[row][col] = value
                return False
            board[row][col] = value
    return True
