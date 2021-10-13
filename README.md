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

TODO:
#### 1. Oauth login with Lichess

- [x] Let user login using lichess oauth
- [x] Store sessions with IOredis

#### 2. Let user download games from lichess

- [x] Validate request parameters with joi
- [x] Spawn a worker to download games
- [x] Manage workers and queues using BullMq
- [ ] Allow only one worker by user at a time
- [ ] Send workers progress to client with get request
- [x] Send workers progress to client with web socket
- [x] Check if game is already saved
- [ ] Check if game was saved for another user
- [x] Save game to MongoDB with Mongoose

#### 3. Let user generate puzzles

- [x] Spawn a worker to process games
- [x] Check if game has already been analyzed
- [x] Analyse user games in database using python
- [ ] Generated puzzles close to user chess level
- [x] Save generated puzzles to the database
- [ ] Send workers progress to client with get request
- [ ] Send workers progress to client with web socket
- [ ] Throw error if there is no game in database

#### 4. Let user train puzzles

- [ ] Group puzzle in sets of 30-100
- [ ] Save user score for the set 
- [ ] Create new sets of puzzle
- [ ] Add more puzzles to a set
- [ ] Send error if move differs from reference

#### 5. Practice your openings

- [ ] Import opening studies PGN as reference
- [ ] Parse PGN, avoid transpositions, allow only one move fo each position (FEN)
- [ ] Save to database
- [ ] Compare user moves to reference PGN
- [ ] Send error if move differs from reference

## Modules 🙏 :

PGN to Puzzles : https://github.com/vitogit/pgn-tactics-generator