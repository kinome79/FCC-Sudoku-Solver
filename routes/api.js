'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  let solver = new SudokuSolver();

  //---Handle request to check a coordinate and value against the puzzle----
  app.route('/api/check')
    .post((req, res) => {
      const {puzzle, coordinate, value} = req.body;
      const coordRegex = /^[a-i][1-9]$/i;
      const valueRegex = /^[1-9]$/;

      //Verify all fields were included
      if (!(puzzle && coordinate && value)) {
        return res.json({error: "Required field(s) missing"});
      }

      //Verify puzzle is valid
      const puzzleTest = solver.validate(puzzle);
      if (Object.keys(puzzleTest)[0] == "error") {
        return res.json(puzzleTest);
      }

      //Verify coordinates are valid
      if (!coordRegex.test(coordinate)) {
        return res.json({error: "Invalid coordinate"});
      }

      //Verify value is valid
      if (!valueRegex.test(value)) {
        return res.json({error: "Invalid value"});
      }

      //Split row/column, and check against puzzle
      const row = coordinate[0].toLowerCase().charCodeAt(0) - 97;
      const col = coordinate[1] - 1;
      const conflicts = [];

      //Push any failing array check to the conflicts array
      if (!solver.checkRowPlacement(puzzle, row, col, value)){
        conflicts.push("row");
      }
      if (!solver.checkColPlacement(puzzle, row, col, value)){
        conflicts.push("column");
      }
      if (!solver.checkRegionPlacement(puzzle, row, col, value)){
        conflicts.push("region");
      };

      //If conflict is empty, return true, otherwise false with conflicts
      if (conflicts.length == 0) {

        res.json ({valid: true});
      } else {
        res.json ({valid: false, conflict: conflicts});
      }
    });
    
  //---POST /api/solve solves a supplied puzzle
  app.route('/api/solve')
    .post((req, res) => {
      const puzzle = req.body.puzzle;

      //Verify puzzle was included
      if (!puzzle) {
        return res.json({error: "Required field missing"});
      }


      //Verify puzzle is valid
      const puzzleTest = solver.validate(puzzle);
      if (Object.keys(puzzleTest)[0] == "error") {
        return res.json(puzzleTest);
      }

      //Return puzzle solver function to solve puzzle
      res.json(solver.solve(puzzle));
    });
};
