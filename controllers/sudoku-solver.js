class SudokuSolver {

  //---Validate a puzzle entry is valid---------------------------------------
  validate(puzzleString) {
    const puzzleRegex = /[1-9]|\./g;

    //Verify puzzle is appropirate length
    if (!(puzzleString.length == 81)) {
      return {error: "Expected puzzle to be 81 characters long"};
    }

    //Verify puzzle contains only valid characters
    if (!(puzzleString.match(puzzleRegex).length == 81)) {
      return {error: "Invalid characters in puzzle"};
    }

    //Return successful if no faults found
    return {result: "Valid Puzzle"};

  }

  //---Validate value supplied is not duplicated within the row-----------------------
  checkRowPlacement(puzzleString, row, column, value) {

    //Sent row start and function as true
    const rowStart = row * 9;
    let itWorks = true;

    //Go through the 9 row values skipping the currently selected coordinate
    for (let i = rowStart; i < rowStart+9; i++) {
      if (column != (i - rowStart)){
        //If a duplicate value found, mark function as false
        itWorks = itWorks && (puzzleString[i] != value);
      }
    } 

    //Return the function value
    return itWorks;
  }

  //---Validate value supplied is not duplicated within the column--------------------
  checkColPlacement(puzzleString, row, column, value) {
    
    //Set the coordinate location in the string so we can skip it, and set function value as true
    const currentLocation = (row * 9) + parseInt(column);
    let itWorks = true;

    //Go through each value in the column skipping the currently selected coordinates
    for (let i = column; i < 81; i += 9){
      if (i != currentLocation) {
        //If a duplicate value found, mark function as false
        itWorks = itWorks && (puzzleString[i] != value);
      }
    }
    
    //Return the function value
    return itWorks;
  }

  //---Validate value supplied is not duplicated within the region------------------------------------
  checkRegionPlacement(puzzleString, row, column, value) {

    //find start row/column positions for the region checking
    const regionRow = Math.floor(row/3);
    const regionCol = Math.floor(column/3);
    const rowStart = regionRow * 27;
    const colStart = regionCol * 3;

    //find current location, and set initial function value to true
    const currentLocation = (row * 9) + parseInt(column);
    let itWorks = true;

    //check each square in the selected region for a matching value
    for (let i = rowStart; i < rowStart + 19; i += 9) {
      for (let j = colStart; j < colStart+3; j++) {

        //function remains true if no matching value found
        if ((i+j) != currentLocation) {
          itWorks = itWorks && (puzzleString[i+j] != value);
        }
      }
    }

    //Return the function value
    return itWorks;
  }

  //---Solve the supplied puzzle, and reply with solution or unsolvable message------------------------------------------
  solve(puzzleString) {
    console.log ("Puzzle Solve Started...")
    const dotRegex = /\./g;
    let solvedPuzzle = puzzleString;
    let progressing = true;

    //Loop through check iterations while progress is being made
    while (progressing) {
      progressing = false;

      //Singular check - go through all 81 locations, check every value to see if there is a singular answer
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          const currentLocation = (row * 9) + col;

          //If location is empty, check each value in that spot
          if (solvedPuzzle[currentLocation] == '.') {
            let goodNums = [];
            for (let value = 1; value < 10; value++) {
              if (this.checkRegionPlacement(solvedPuzzle, row, col, value) && 
                    this.checkRowPlacement(solvedPuzzle, row, col, value) && 
                      this.checkColPlacement(solvedPuzzle, row, col, value)) {
                goodNums.push(value);
              }
            }

            //If only a single value works in that location, set that value in the puzzle and mark progress
            if (goodNums.length == 1) {
              progressing = true;
              solvedPuzzle = this.replaceChar(currentLocation, solvedPuzzle, goodNums[0]);
              console.log(solvedPuzzle+" - Singular");
            }
          } 
        }
      }

      //Row check - with each value go through a single row, and see if there is only one position where that value works
      if (solvedPuzzle.match(dotRegex)) {

        //For each value possible
        for (let value = 1; value < 10; value++) {
          for (let row = 0; row < 9; row++) {
            let goodPos = [];

            //If the row does not contain that value, go through the row
            if (this.checkRowPlacement(solvedPuzzle, row, 0, value) && (solvedPuzzle[row*9] != value)) {
              for (let col = 0; col < 9; col++) {
                let currentLocation = (row*9) + col;

                //If the spot is empty, check if the value works there, and if so add that position as a valid location
                if (solvedPuzzle[currentLocation] == '.') {
                  if (this.checkColPlacement(solvedPuzzle, row, col, value) && this.checkRegionPlacement(solvedPuzzle, row, col, value)) {
                    goodPos.push(currentLocation);
                  }
                }
              }

              //If in that row for that value only 1 position works, assign the value to that spot in the puzzle and mark progress
              if (goodPos.length == 1) {
                progressing = true;
                solvedPuzzle = this.replaceChar(goodPos[0], solvedPuzzle, value);
                console.log(solvedPuzzle+" - Row");
              }
            }
          }
        }
      }

      //Column check - with each value go through each column, and see if there is only one position where that value works
      if (solvedPuzzle.match(dotRegex)) {

        //For each value possible
        for (let value = 1; value < 10; value++) {
          for (let col = 0; col < 9; col++) {
            let goodPos = [];

            //If the column does not contain the value, go through the column
            if (this.checkColPlacement(solvedPuzzle, 0, col, value) && (solvedPuzzle[col] != value)) {
              for (let row = 0; row < 9; row++) {
                let currentLocation = (row*9) + col;

                //If the spot is empty, check if the value works there, and if so add that position as a valid location
                if (solvedPuzzle[currentLocation] == '.') {
                  if (this.checkRowPlacement(solvedPuzzle, row, col, value) && this.checkRegionPlacement(solvedPuzzle, row, col, value)) {
                    goodPos.push(currentLocation);
                  }
                }
              }

              //If in that column for that value only 1 position works, assign the value to that spot and park progress
              if (goodPos.length == 1) {
                progressing = true;
                solvedPuzzle = this.replaceChar(goodPos[0], solvedPuzzle, value);
                console.log(solvedPuzzle+" - Column");
              }
            }
          }
        }
      }

      //Region check - with each value go through each region, and see if there is only one position where that value works
      if (solvedPuzzle.match(dotRegex)) {

        //for each value possible go through the region
        for (let value = 1; value < 10; value++) {

          for (let regRow = 0; regRow < 3; regRow++) {
            for (let regCol = 0; regCol < 3; regCol++) {
              const rowStart = regRow * 3;
              const colStart = regCol * 3;

              //If the region does not already contain the value, go through the region
              if ((this.checkRegionPlacement(solvedPuzzle, rowStart, colStart, value) && (solvedPuzzle[(rowStart * 9) + colStart] != value))) {

                //check each square in the selected region for a empty square and if value will fit
                let goodPos = [];
                for (let row = rowStart; row < rowStart + 3; row++) {
                  for (let col = colStart; col < colStart + 3; col++) {

                    let currentLocation = (row*9) + col;

                    //If an empty spot found, see if that value works there, and if so, add to list of positions
                    if (solvedPuzzle[currentLocation] == '.') {
                      if (this.checkRowPlacement(solvedPuzzle, row, col, value) && this.checkColPlacement(solvedPuzzle, row, col, value)) {
                        goodPos.push(currentLocation);
                      }
                    }
                  } 
                }

                //If there is only one position in a region where that value worked, assign that value to that spot in the puzzle and mark progress
                if (goodPos.length == 1) {
                  progressing = true;
                  solvedPuzzle = this.replaceChar(goodPos[0], solvedPuzzle, value);
                  console.log(solvedPuzzle+" - Region");
                }
              }
            }
          }   
        }
      }

      //Variables to save locations with only 2 or 3 possible solutions for later brute force use
      let doubleLocations = [];
      let tripleLocations = [];

      //If no progress made with simple singular checks and puzzle not solved, do more complicated algorithms
      if (!progressing && solvedPuzzle.match(dotRegex)) {

        //Doublematch Row - Check each row for squares with only two possibles, and if two matching squares remove those possibles from rest of row
        //Go through each row and build an array of possible values for each spot
        for (let row = 0; row < 10; row++) {
          let rowArray = [];
          let doubleIndex = [];

          //For each column in that row, build an array of possible values that work there
          for (let col = 0; col < 9; col++) {
            let currentLocation = (row*9) + col;
            if (solvedPuzzle[currentLocation] == '.'){
              let valArray = [];
              for (let value = 1; value < 10; value++) {
                if ((this.checkRegionPlacement(solvedPuzzle, row, col, value) && 
                      this.checkRowPlacement(solvedPuzzle, row, col, value) && 
                        this.checkColPlacement(solvedPuzzle, row, col, value))) {
                  valArray.push(value);
                }
              }
              rowArray.push(valArray);

              //If the array of possible values contains only two values, add it to an array of values to check later
              if(valArray.length == 2) {
                doubleIndex.push(rowArray.length - 1);
              }
            } else {
              rowArray.push([]);
            }
          }
          
          //Now that array is build, go back to each location that has two possible values and compare them
          if (doubleIndex.length > 1) {
            doubleIndex.forEach ((value, index) => {
              for (let x = index+1; x < doubleIndex.length; x++) {

                //If there is two matching locations with the same two possible answers, remove those answers from the rest of the row
                if ((rowArray[value][0] == rowArray[doubleIndex[x]][0]) && (rowArray[value][1] == rowArray[doubleIndex[x]][1])) {
                  rowArray.forEach( (v, i)=> {
                    if ((i != value) && (i != doubleIndex[x])) {
                      let thisArray = [];
                      for (let y in rowArray[i]) {
                        if ((rowArray[i][y] != rowArray[value][0]) && (rowArray[i][y] != rowArray[value][1])){
                          thisArray.push(rowArray[i][y]);
                        }
                      }
                      
                      //If after removal of values there is any spot with only 1 remaining possibility, add that value to that spot in the puzzle and mark progress
                      if (thisArray.length == 1) {
                        progressing = true;
                        solvedPuzzle = this.replaceChar(((row*9) + i), solvedPuzzle, thisArray[0]);
                        console.log(solvedPuzzle + " - Doublematch Row");
                      }
                    }
                  })
                }
              }
            })
            
          }

        }
      }

      //If still no progress made and not solved, same more complicated algorithms against columns
      if (!progressing && solvedPuzzle.match(dotRegex)) {

        //Doublematch Column - Check each column for squares with only two possibles, and if two matching squares remove those possibles from rest of column
        //Go through each colun and build an array of possible values for each spot
        for (let col = 0; col < 10; col++) {
          let colArray = [];
          let doubleIndex = [];
          let tripleIndex = [];

          //For each row in that column, build an array of possible values that work there
          for (let row = 0; row < 9; row++) {
            let currentLocation = (row*9) + col;
            if (solvedPuzzle[currentLocation] == '.'){
              let valArray = [];
              for (let value = 1; value < 10; value++) {
                if ((this.checkRegionPlacement(solvedPuzzle, row, col, value) && 
                      this.checkRowPlacement(solvedPuzzle, row, col, value) && 
                        this.checkColPlacement(solvedPuzzle, row, col, value))) {
                  valArray.push(value);
                }
              }
              colArray.push(valArray);

              //If the array of values contains only two values, add it to an array of values to check later, also save locations for possible brute force
              if(valArray.length == 2) {
                doubleIndex.push(colArray.length - 1);
                doubleLocations.push(currentLocation);

                //If the array of values contains three possibilities, save that location for possible brute force use
              } else if (valArray.length == 3) {
                tripleLocations.push(currentLocation);
              }
            } else {
              colArray.push([]);
            }
          }

          //Now that array is build, go back to each location that has two possible values and compare them
          if (doubleIndex.length > 1) {
            doubleIndex.forEach ((value, index) => {
              for (let x = index+1; x < doubleIndex.length; x++) {

                //If there is two matching locations with the same two possible answers, remove those answers from the rest of the column
                if ((colArray[value][0] == colArray[doubleIndex[x]][0]) && (colArray[value][1] == colArray[doubleIndex[x]][1])) {
                  colArray.forEach( (v, i)=> {
                    if ((i != value) && (i != doubleIndex[x])) {
                      let thisArray = [];
                      for (let y in colArray[i]) {
                        if ((colArray[i][y] != colArray[value][0]) && (colArray[i][y] != colArray[value][1])){
                          thisArray.push(colArray[i][y]);
                        }
                      }

                      //If after removal of values there is any spot with only 1 remaining possibility, add that value to that spot in the puzzle and mark progress
                      if (thisArray.length == 1) {
                        progressing = true;
                        solvedPuzzle = this.replaceChar(((i*9) + col), solvedPuzzle, thisArray[0]);
                        console.log(solvedPuzzle + " - Doublematch Column");
                      }
                    }
                  })
                }
              }
            })
            
            
          }

        }
      }

      //If still no progress and puzzle not solved, logic has failed. Desparate measures authorized!
      if (!progressing && solvedPuzzle.match(dotRegex)) {
        console.log ('Logic has failed... brute force authorized!');
        console.log ('WARNING: Brute force can take time...Please wait...');
        console.log (solvedPuzzle + ' - Brute Started...');
        
        //Brute force attack! - run brute force function with puzzle, and previously located double and triple location spots
        solvedPuzzle = this.bruteForceSolver (solvedPuzzle, doubleLocations, tripleLocations);

        console.log (solvedPuzzle + ' - Brute Finished');
      }
    }

    //If after all algorithms stop making progress puzzle still has '.', return cant solve, otherwise return solved puzzle
    if (solvedPuzzle.match(dotRegex)) {
      console.log("Puzzle Solving Complete...Failed.")
      return {error: "Puzzle cannot be solved"}
    } else {
      console.log("Puzzle Solving Complete...Success.")
      return {solution: solvedPuzzle}
    }

    

  }

  //---Function to replace a '.' in the puzzle string with a value given the index location----------------
  replaceChar(index, origString, newChar) {
    return (origString.slice(0, index) + newChar + origString.slice(index+1));
  }

  //---Brute force recursive function - Returns the puzzle as completed as possible by backtrack algorithm
  bruteForceSolver (thePuzzle, doubleLocations, tripleLocations) {

    const printBruteProgress = false;   //When set to true, puzzle solve progress will print to console... slows solving time... fun to watch
    const dotRegex = /\./g;

    //pick a spot to add a value. Use previously found double and triple solution spots first to save possible backtracking
    let myLocation = 99;
    while (myLocation == 99) {
      myLocation = doubleLocations.pop();
      if(!myLocation) {
        myLocation = tripleLocations.pop();
        if(!myLocation) {
          myLocation = thePuzzle.search(dotRegex);
        }
      }

      //Verify spot is empty before proceeding
      if (thePuzzle[myLocation] != '.') {
        myLocation = 99;
      }
    }
    
    //Set row and column locations from string location for method use
    let row = Math.floor(myLocation/9);
    let col = myLocation%9;
    
    //Go through each possible value to find a value that works in that spot
    for (let value = 1; value < 10; value++) {

      //If value works, add it to the puzzle string and recall this function to pick the next spot
      if ((this.checkRegionPlacement(thePuzzle, row, col, value) && 
            this.checkRowPlacement(thePuzzle, row, col, value) && 
              this.checkColPlacement(thePuzzle, row, col, value))) {
        let newPuzzle = this.replaceChar(myLocation, thePuzzle, value);

        if (printBruteProgress) {console.log (newPuzzle + " - BruteForce")};

        //If more dots available in the puzzle string, call this method again to pick next spot
        if (newPuzzle.match(dotRegex)) {
          let returnedPuzzle = this.bruteForceSolver(newPuzzle, doubleLocations, tripleLocations);

          //If the recursive returned puzzle is full, return solved... if not, we are backtracking so let the loop try the next value
          if (!returnedPuzzle.match(dotRegex)) {
            return returnedPuzzle;
          }
        } else {
          
          //If this method solved the puzzle, return it
          return newPuzzle;
        }
      }
    }
    
    //If after trying all 10 values the recursives haven't returned a solved puzzle, return puzzle as unsolved
    return thePuzzle;
  }
}

module.exports = SudokuSolver;

