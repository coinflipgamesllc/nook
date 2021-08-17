import { Fragment } from 'react'

import useGameState from './util/useGameState'

import OnBoarding from './components/OnBoarding';

import './App.scss'
import Deck from './components/Deck';
import Card from './components/Card';

function App() {
  const { state, startGame, deal, draw, startRound, playCard, discardCard, playPerfectCard } = useGameState()

  // console.log(state)

  if (state === null) {
    return <OnBoarding startGame={startGame} />
  }

  if (state.phase === 'done') {
    return (<div>Player {state.turn} wins! <button onClick={startGame}>Play again</button></div>)
  }

  let drawActions = []
  if (state.turn === null) {
    drawActions.push({ label: 'Deal', func: deal })
  } else if (state.turn === 0 && state.phase === 'play') {
    drawActions.push({ label: 'Draw', func: draw })
  }

  let playActions = []
  if (state.phase === 'wait') {
    playActions.push({ label: 'Ready!', func: startRound })
  }

  let discardString = ''
  if (state.toDiscard > 0) {
    discardString = ` ${state.toDiscard}`
  }

  let statusString = ''
  if (state.phase === null || state.phase === 'wait') {
    statusString = 'Waiting to start...'
  } else if (state.turn === 0) {
    statusString = `It's your turn! (${state.phase}ing${discardString})`
  } else {
    statusString = `It is ${state.players[state.turn].name}'s turn (${state.phase}ing${discardString})`
  }

  return (
    <div className="App">
      <h1>{statusString}</h1>

      <Deck 
        label="Draw"
        location="draw-pile"
        cards={[] }// state.deck}
        cardsVisible={false}
        actions={drawActions}
        state={state}
      />

      <Deck 
        label="Play"
        location="center"
        cards={[] }// state.center}
        cardsVisible={state.phase !== 'wait'}
        actions={playActions}
        state={state}
      />

      <Deck 
        label="Discard"
        location="discard-pile"
        cards={[] }// state.discard}
        cardsVisible={false}
        state={state}
      />

      <Deck
        label=""
        location="hand"
        cards={[] }// state.players[0].hand}
        cardsVisible={true}
        playCard={playCard}
        discardCard={discardCard}
        playPerfectCard={playPerfectCard}
        state={state}
      />

      <Deck 
        label={`${state.players[1].name} (${state.players[1].hand.length})`}
        location="cpu-1"
        cards={[] }// state.players[1].hand}
        cardsVisible={false}
        state={state}
      />

      <Deck 
        label={`${state.players[2].name} (${state.players[2].hand.length})`}
        location="cpu-2"
        cards={[] }// state.players[2].hand}
        cardsVisible={false}
        state={state}
      />

      {state ? state.cards.map((card, i) => (
          <Card 
              key={`c${i}`} 
              {...card} 
              playCard={() => playCard(i)}
              discardCard={() => discardCard(i)}
              playPerfectCard={() => playPerfectCard(i)}
              state={state}
          />
      )) : <Fragment/>}
    </div>
  )
}

export default App
