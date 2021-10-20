<div align="center">
  <h1>
    <br/>
    <img width="150" heigth="150" src="./public/images/chesspecker-logo.png">
    <br />
    chesspecker
    <br />
    <br />
  </h1>
  <sup>
</div>

## V1 : Train puzzles by group of 30-70
#### 1. Oauth login with Lichess

- [x] Let user login using lichess oauth
- [x] Store sessions with IOredis

#### 2. Let user train puzzles

- [x] Use lichess puzzles database
- [x] Allow users to create new sets of puzzle
- [x] Handle themes of puzzle 
- [x] Save user score for the set 
- [ ] Remove puzzles from set 
- [ ] Add more puzzles to a set

#### 3. Make backend friendly

- [x] Create basic error handler
- [ ] Add multiple try catch
- [ ] Make sure all routes return similarly constructed responses
- [ ] Add documentation

## V2 : Puzzle Generation from user games

Generating puzzles from user games is complicated because of two reasons.

1. It takes a lot of time to analyze each game with stockfish. About 10 minutes for a game. It also uses a lot of computer power.
2. To make sure puzzles are good you need to make sure the puzzles generation is strict. However, if it is strict you need to process about 1000 games to find one good puzzle.

For the time being we decided to use puzzles from the lichess database : <https://database.lichess.org/#puzzles>

#### 1. Let user download games from lichess

- [x] Validate request parameters with joi
- [x] Spawn a worker to download games
- [x] Manage workers and queues using BullMq
- [ ] Allow only one worker by user at a time
- [ ] Send workers progress to client with get request
- [x] Send workers progress to client with web socket
- [x] Check if game is already saved
- [ ] Check if game was saved for another user
- [x] Save game to MongoDB with Mongoose

#### 2. Let user generate puzzles

- [x] Spawn a worker to process games
- [x] Check if game has already been analyzed
- [x] Analyse user games in database using python
- [ ] Generated puzzles close to user chess level
- [x] Save generated puzzles to the database
- [ ] Send workers progress to client with get request
- [ ] Send workers progress to client with web socket
- [ ] Throw error if there is no game in database

## V3 : Practice your openings

- [ ] Import opening studies PGN as reference
- [ ] Parse PGN, avoid transpositions, allow only one move fo each position (FEN)
- [ ] Save to database
- [ ] Compare user moves to reference PGN
- [ ] Send error if move differs from reference
