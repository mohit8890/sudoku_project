from sudoku_engine import (
    board_is_complete,
    board_is_valid,
    count_solutions,
    empty_board,
    generate_full_board,
    make_puzzle,
    solve_board,
)


def test_empty_board_is_invalid():
    board = empty_board()
    assert board_is_complete(board) is False
    assert board_is_valid(board) is True


def test_full_board_is_valid_and_complete():
    board = generate_full_board()
    assert board_is_complete(board) is True
    assert board_is_valid(board) is True
    assert count_solutions(board) == 1


def test_puzzle_generation_unique_solution():
    puzzle, solution = make_puzzle("easy")
    assert len(puzzle) == 9
    assert all(len(row) == 9 for row in puzzle)
    assert count_solutions(puzzle) == 1
    assert board_is_valid(puzzle)
    assert board_is_valid(solution)
    assert board_is_complete(solution)


def test_solver_solves_partial_board():
    puzzle, solution = make_puzzle("medium")
    cloned = [row.copy() for row in puzzle]
    assert solve_board(cloned) is True
    assert cloned == solution
