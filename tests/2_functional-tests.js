const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {

    suite('Puzzle Solving Tests', () => {
        test('Solve a puzzle with valid puzzle string: POST request to /api/solve', (done) => {
            chai.request(server)
            .post('/api/solve')
            .send({'puzzle':'82..4..6...16..89...98315.749.157.............53..4...96.415..81..7632..3...28.51'})
            .end( (err,res) => {
                assert.equal(res.status, 200, "Should return a status of 200");
                assert.equal(res.type, "application/json", "Should return a json response");
                assert.equal(res.body.solution, "827549163531672894649831527496157382218396475753284916962415738185763249374928651", "Valid solved puzzle string should be returned");
                done();
            });
        });
        test('Solve a puzzle with missing puzzle string: POST request to /api/solve', (done) => {
            chai.request(server)
            .post('/api/solve')
            .send({})
            .end( (err,res) => {
                assert.equal(res.status, 200, "Should return a status of 200");
                assert.equal(res.type, "application/json", "Should return a json response");
                assert.equal(res.body.error, "Required field missing", "Should return error message regarding missing field");
                done();
            });
        });
        test('Solve a puzzle with invalid characters: POST request to /api/solve', (done) => {
            chai.request(server)
            .post('/api/solve')
            .send({'puzzle':'82..4..6...16..89...98315.749.157......D......53..4...96.415..81..7632..3...28.51'})
            .end( (err,res) => {
                assert.equal(res.status, 200, "Should return a status of 200");
                assert.equal(res.type, "application/json", "Should return a json response");
                assert.equal(res.body.error, "Invalid characters in puzzle", "Should return invalid character error message");
                done();
            });
        });
        test('Solve a puzzle with incorrect length: POST request to /api/solve', (done) => {
            chai.request(server)
            .post('/api/solve')
            .send({'puzzle':'82..4..6...16..89...98315.749.157.........53..4...96.415..81..7632..3...28.51'})
            .end( (err,res) => {
                assert.equal(res.status, 200, "Should return a status of 200");
                assert.equal(res.type, "application/json", "Should return a json response");
                assert.equal(res.body.error, "Expected puzzle to be 81 characters long", "Should return length error message");
                done();
            });
        });
        test('Solve a puzzle that cannot be solved: POST request to /api/solve', (done) => {
            chai.request(server)
            .post('/api/solve')
            .send({'puzzle':'5.839.7.575.....964..1.......16.29846.9.312.7..754.....62..5.78.8...3.2...492...1'})
            .end( (err,res) => {
                assert.equal(res.status, 200, "Should return a status of 200");
                assert.equal(res.type, "application/json", "Should return a json response");
                assert.equal(res.body.error, "Puzzle cannot be solved", "Should return a failure to solve error message");
                done();
            });
        });
    });

    suite('Placement Checking Tests', () => {
        test('Check a puzzle placement with all fields: POST request to /api/check', (done) => {
            chai.request(server)
            .post('/api/check')
            .send({'puzzle':'82..4..6...16..89...98315.749.157.............53..4...96.415..81..7632..3...28.51', 
                    'coordinate': 'A3', 'value': '5'})
            .end( (err,res) => {
                assert.equal(res.status, 200, "Should return a status of 200");
                assert.equal(res.type, "application/json", "Should return a json response");
                assert.equal(res.body.valid, true, "Should return a valid property of true for valid entries");
                done();
            });
        });
        test('Check a puzzle placement with single placement conflict: POST request to /api/check', (done) => {
            chai.request(server)
            .post('/api/check')
            .send({'puzzle':'82..4..6...16..89...98315.749.157.............53..4...96.415..81..7632..3...28.51', 
                    'coordinate': 'A3', 'value': '4'})
            .end( (err,res) => {
                assert.equal(res.status, 200, "Should return a status of 200");
                assert.equal(res.type, "application/json", "Should return a json response");
                assert.equal(res.body.valid, false, "Should return a valid property of false for conflict entries");
                assert.equal(res.body.conflict.length, 1, "The conflict array should contain a single item");
                assert.equal(res.body.conflict[0], "row", "Should indicate there is a row conflict");
                done();
            });
        });
        test('Check a puzzle placement with multiple placement conflicts: POST request to /api/check', (done) => {
            chai.request(server)
            .post('/api/check')
            .send({'puzzle':'82..4..6...16..89...98315.749.157.............53..4...96.415..81..7632..3...28.51', 
                    'coordinate': 'B2', 'value': '6'})
            .end( (err,res) => {
                assert.equal(res.status, 200, "Should return a status of 200");
                assert.equal(res.type, "application/json", "Should return a json response");
                assert.equal(res.body.valid, false, "Should return a valid property of false for conflict entries");
                assert.equal(res.body.conflict.length, 2, "The conflict array should contain two items");
                assert.equal(res.body.conflict[0], "row", "Should indicate there is a row conflict");
                assert.equal(res.body.conflict[1], "column", "Should indicate there is a column conflict");
                done();
            });
        });
        test('Check a puzzle placement with all placement conflicts: POST request to /api/check', (done) => {
            chai.request(server)
            .post('/api/check')
            .send({'puzzle':'82..4..6...16..89...98315.749.157.............53..4...96.415..81..7632..3...28.51', 
                    'coordinate': 'B2', 'value': '9'})
            .end( (err,res) => {
                assert.equal(res.status, 200, "Should return a status of 200");
                assert.equal(res.type, "application/json", "Should return a json response");
                assert.equal(res.body.valid, false, "Should return a valid property of false for conflict entries");
                assert.equal(res.body.conflict.length, 3, "The conflict array should contain three items");
                assert.equal(res.body.conflict[0], "row", "Should indicate there is a row conflict");
                assert.equal(res.body.conflict[1], "column", "Should indicate there is a column conflict");
                assert.equal(res.body.conflict[2], "region", "Should indicate there is a region conflict");
                done();
            });
        });
        test('Check a puzzle placement with missing required fields: POST request to /api/check', (done) => {
            chai.request(server)
            .post('/api/check')
            .send({'puzzle':'82..4..6...16..89...98315.749.157.............53..4...96.415..81..7632..3...28.51', 
                    'value': '5'})
            .end( (err,res) => {
                assert.equal(res.status, 200, "Should return a status of 200");
                assert.equal(res.type, "application/json", "Should return a json response");
                assert.equal(res.body.error, "Required field(s) missing", "Should return an error message regarding missing fields");
                done();
            });
        });
        test('Check a puzzle placement with invalid characters: POST request to /api/check', (done) => {
            chai.request(server)
            .post('/api/check')
            .send({'puzzle':'82..4..6...16..89...98315.749.157......D......53..4...96.415..81..7632..3...28.51', 
                    'coordinate': 'B2', 'value': '5'})
            .end( (err,res) => {
                assert.equal(res.status, 200, "Should return a status of 200");
                assert.equal(res.type, "application/json", "Should return a json response");
                assert.equal(res.body.error, "Invalid characters in puzzle", "Should return invalid character error message");
                done();
            });
        });
        test('Check a puzzle placement with incorrect length: POST request to /api/check', (done) => {
            chai.request(server)
            .post('/api/check')
            .send({'puzzle':'82..4..6...16..89...98315.749.157........53..4...96.415..81..7632..3...28.51', 
                    'coordinate': 'B2', 'value': '5'})
            .end( (err,res) => {
                assert.equal(res.status, 200, "Should return a status of 200");
                assert.equal(res.type, "application/json", "Should return a json response");
                assert.equal(res.body.error, "Expected puzzle to be 81 characters long", "Should return puzzle length error message");
                done();
            });
        });
        test('Check a puzzle placement with invalid placement coordinate: POST request to /api/check', (done) => {
            chai.request(server)
            .post('/api/check')
            .send({'puzzle':'82..4..6...16..89...98315.749.157.............53..4...96.415..81..7632..3...28.51', 
                    'coordinate': 'Z52', 'value': '5'})
            .end( (err,res) => {
                assert.equal(res.status, 200, "Should return a status of 200");
                assert.equal(res.type, "application/json", "Should return a json response");
                assert.equal(res.body.error, "Invalid coordinate", "Should return coordinate problem error message");
                done();
            });
        });
        test('Check a puzzle placement with invalid placement value: POST request to /api/check', (done) => {
            chai.request(server)
            .post('/api/check')
            .send({'puzzle':'82..4..6...16..89...98315.749.157.............53..4...96.415..81..7632..3...28.51', 
                    'coordinate': 'B2', 'value': '91'})
            .end( (err,res) => {
                assert.equal(res.status, 200, "Should return a status of 200");
                assert.equal(res.type, "application/json", "Should return a json response");
                assert.equal(res.body.error, "Invalid value", "Should return value problem error message");
                done();
            });
        });

    });
    
});

