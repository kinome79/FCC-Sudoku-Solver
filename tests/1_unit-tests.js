const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
let solver = new Solver;

const puzzles = require ('../controllers/puzzle-strings.js');

suite('UnitTests', () => {

    suite('Puzzle string tests', () => {

        test('Logic handles a valid puzzle string of 81 characters', () => {
           // solver.validate()
           const result = solver.validate(puzzles.puzzlesAndSolutions[0][0]);
            assert.property(result, "result", "Should have a result property");
            assert.equal(result.result, "Valid Puzzle", "Should return 'Valid Puzzle' as a result");
        });
        test('Logic handles a puzzle string with invalid characters (not 1-9 or .)', () => {
            const result = solver.validate("5..91372.3...8.5.9.9.25..8.68.47.23...95..46.7.4..D..5.2.......4..8916..85.72...3");
            assert.property(result, "error", "Should have an error property");
            assert.equal(result.error, "Invalid characters in puzzle", "Should return invalid character message");
        });
        test('Logic handles a puzzle string that is not 81 characters in length', () => {
            const result = solver.validate("5..91372.3...8.5.9.9.25..8.68.47.23...95..46.7.4..5.2.......4..8916..85.72...3");
            assert.property(result, "error", "Should have an error property");
            assert.equal(result.error, "Expected puzzle to be 81 characters long", "Should return length error message");
        });
    });

    suite('Number placement check tests', () => {
        test('Logic handles a valid row placement', () => {
            assert.isTrue (solver.checkRowPlacement(puzzles.puzzlesAndSolutions[2][0], 0, 0, 1), "Should return true for valid row placement");
        });
        test('Logic handles an invalid row placement', () => {
            assert.isFalse (solver.checkRowPlacement(puzzles.puzzlesAndSolutions[2][0], 0, 0, 9), "Should return false for invalid row placement");
        });
        test('Logic handles a valid column placement', () => {
            assert.isTrue (solver.checkColPlacement(puzzles.puzzlesAndSolutions[2][0], 0, 0, 1), "Should return true for valid column placement");
        });
        test('Logic handles an invalid column placement', () => {
            assert.isFalse (solver.checkColPlacement(puzzles.puzzlesAndSolutions[2][0], 0, 0, 6), "Should return false for invalid column placement");
        });
        test('Logic handles a valid region (3x3 grid) placement', () => {
            assert.isTrue (solver.checkRegionPlacement(puzzles.puzzlesAndSolutions[2][0], 0, 0, 1), "Should return true for valid region placement");
        });
        test('Logic handles an invalid region (3x3 grid) placement', () => {
            assert.isFalse (solver.checkRegionPlacement(puzzles.puzzlesAndSolutions[2][0], 0, 0, 5), "Should return false for invalid region placement");
        });
    });

    suite('Puzzle solver tests', () => {
        test('Valid puzzle strings pass the solver', () => {
            const result = solver.solve(puzzles.puzzlesAndSolutions[2][1]);
            assert.property(result, "solution", "The result should have a 'solution' property");
            assert.equal(result.solution, puzzles.puzzlesAndSolutions[2][1], "Solution should contain the solved puzzle string");
        });
        test('Invalid puzzle strings fail the solver', () => {
            const result = solver.solve("5.839.7.575.....964..1.......16.29846.9.312.7..754.....62..5.78.8...3.2...492...1");
            assert.property(result, "error", "Should return an object with an 'error' property");
            assert.equal(result.error, "Puzzle cannot be solved", "Should return a failure to solve error message");       
        });
        test('Solver returns the expected solution for an incomplete puzzle', () => {
            const result = solver.solve(puzzles.puzzlesAndSolutions[2][0]);
            assert.property(result, "solution", "The result should have a 'solution' property");
            assert.equal(result.solution, puzzles.puzzlesAndSolutions[2][1], "Solution should contain the completely solved puzzle string");
        });
    });

});
