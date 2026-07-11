
// useState is React's tool for remembering a value between clicks.
// (A normal variable would get wiped every time the screen redraws.)
import { useState } from 'react'
import './App.css'

// The 8 pictures used on the cards. Each one appears twice, so there are
// 8 matching pairs = 16 cards total.
const PICTURES = ['👻', '🎃', '💀', '🕷️', '🦇', '🧟', '🕸️', '🐍']

// What a face-down card shows.
const CARD_BACK = '?'

// How many wrong guesses are allowed before you lose, per difficulty.
const MAX_WRONG = { easy: 10, hard: 5 }

//  Make a fresh, shuffled board.
//  Returns a plain list of 16 emoji strings in random order, e.g.
function makeShuffledBoard() {
  // Start with every picture listed twice: [👻,🎃,...,👻,🎃,...]
  const cards = [...PICTURES, ...PICTURES]

  // Shuffle by walking the list and swapping each card with a random one.
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)) // random spot from 0..i
    const temp = cards[i]                          // classic 3-step swap
    cards[i] = cards[j]
    cards[j] = temp
  }

  return cards
}

function App() {
  //  STATE: the handful of things the game needs to remember.
  //  Each line gives us [ theValue, aFunctionToChangeIt ].
  //  Calling the change-function tells React to redraw the screen.

  // Chosen difficulty: 'easy', 'hard', or null (nothing picked yet).
  const [level, setLevel] = useState(null)

  // The 16 shuffled cards. This list itself never changes during a game;
  // we only change which cards are matched / flipped (below).
  const [board, setBoard] = useState(makeShuffledBoard)

  // The positions (indexes) of cards the player has permanently matched.
  // Starts empty; grows by 2 every time a pair is found: [0, 7, 3, 9, ...]
  const [matched, setMatched] = useState([])

  // The index of the FIRST card the player flipped this turn (or null).
  const [firstIdx, setFirstIdx] = useState(null)

  // The index of the SECOND card the player flipped this turn (or null).
  const [secondIdx, setSecondIdx] = useState(null)

  // How many wrong guesses have been made so far.
  const [wrongGuesses, setWrongGuesses] = useState(0)

  // While two mismatched cards are showing, we "lock" the board for a moment
  // so the player can't click again before they flip back over.
  const [locked, setLocked] = useState(false)


  //  DERIVED VALUES: things we can figure out from the state above.
  //  (We recalculate these every redraw instead of storing them.)


  // You win when all 16 cards have been matched.
  const won = matched.length === board.length

  // You lose when you've used up all your allowed wrong guesses.
  const lost = level ? wrongGuesses >= MAX_WRONG[level] : false

  // The game is over if you've either won or lost.
  const gameOver = won || lost

  //  ACTIONS: functions that change the state (and so redraw the screen).

  // Start a brand-new game: shuffle a fresh board and clear everything.
  function startNewGame() {
    setBoard(makeShuffledBoard())
    setMatched([])
    setFirstIdx(null)
    setSecondIdx(null)
    setWrongGuesses(0)
    setLocked(false)
  }

  // Pick a difficulty, then start a fresh game.
  function chooseLevel(chosenLevel) {
    setLevel(chosenLevel)
    startNewGame()
  }

  // This runs when the player clicks a card at position `idx`.
  function handleClick(idx) {
    // Ignore the click if the board is locked or the game is finished.
    if (locked || gameOver) return

    // Ignore clicks on cards that are already matched or already flipped.
    if (matched.includes(idx)) return
    if (idx === firstIdx) return

    // CASE 1: this is the FIRST card of the turn 
    if (firstIdx === null) {
      setFirstIdx(idx) // just remember it and wait for the second click
      return
    }

    // CASE 2: this is the SECOND card of the turn 
    setSecondIdx(idx) // show it face-up

    // Do the two flipped cards show the same picture?
    if (board[firstIdx] === board[idx]) {
      // MATCH! Add both positions to the matched list and reset for next turn.
      setMatched([...matched, firstIdx, idx])
      setFirstIdx(null)
      setSecondIdx(null)
    } else {
      // NO MATCH. Count the wrong guess and lock the board briefly so both
      // cards stay visible, then flip them back over.
      setWrongGuesses(wrongGuesses + 1)
      setLocked(true)

      // setTimeout runs the code inside after a short pause (600ms here).
      setTimeout(() => {
        setFirstIdx(null)
        setSecondIdx(null)
        setLocked(false)
      }, 600)
    }
  }

  // Should the card at position `idx` be showing its picture (face-up)?
  function isFaceUp(idx) {
    return matched.includes(idx) || idx === firstIdx || idx === secondIdx
  }

  // If no difficulty is chosen yet, show the start screen instead of the board.
  if (!level) {
    return (
      <div className="app">
        <h1>CONCENTRATION</h1>
        <p>Let's Play A Game...</p>
        <div className="controls">
          {/* onClick tells React what to run when the button is clicked */}
          <button onClick={() => chooseLevel('easy')}>Easy (10 wrong guesses)</button>
          <button onClick={() => chooseLevel('hard')}>Hard (5 wrong guesses)</button>
        </div>
      </div>
    )
  }

  // Otherwise, show the game board.
  return (
    <div className="app">
      <h1>CONCENTRATION</h1>

      <div className="board">
        {/* board.map() draws one button for each card in the list. */}
        {board.map((picture, idx) => (
          <button
            key={idx}  // React needs a unique key per card
            className="tile"
            onClick={() => handleClick(idx)} // pass this card's position
          >
            {/* Show the picture if face-up, otherwise show the "?" back. */}
            {isFaceUp(idx) ? picture : CARD_BACK}
          </button>
        ))}
      </div>

      <div className="status">
        <p>
          Wrong Guesses : {wrongGuesses} / {MAX_WRONG[level]}
        </p>
        {/* {condition && <p>...</p>} means "only show this if condition is true" */}
        {won && <p className="win">You Win!</p>}
        {lost && <p className="lose">Game Over!</p>}
      </div>

      <div className="controls">
        <button onClick={startNewGame}>Reset Game</button>
        <button onClick={() => setLevel(null)}>Change Difficulty</button>
      </div>
    </div>
  )
}

export default App
