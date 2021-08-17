import { useEffect, useState } from 'react'
import { numMatches } from './card';

// eslint-disable-next-line
Array.prototype.shuffle = function() {
    return this.map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
}
// eslint-disable-next-line
Array.prototype.first = function () {
    if (this.length === 0) {
        return undefined
    }
    return this[0]
}
// eslint-disable-next-line
Array.prototype.last = function () {
    if (this.length === 0) {
        return undefined
    }
    return this[this.length - 1]
}

const defaultGameState = {
    deck: [],     // Shuffled deck
    players: [],  // Which players are playing
    turn: null,   // Which player's turn it is
    phase: null,  // What phase of their turn it is (wait/play/discard)
    toDiscard: 0, // Number of cards to discard
    discard: [],  // Deck of discarded cards
    center: [],   // Deck of played cards. The last in the array is the top of the pile
}

const useGameState = () => {
    const [state, setState] = useState(null)
    const [cpu1Timeout, setCPU1Timeout] = useState(null)
    const [cpu2Timeout, setCPU2Timeout] = useState(null)

    // Try to save/load the state from localstorage
    useEffect(() => {
        // Try to pull state from localstorage and only populate if we don't already have a state in memory
        const gameData = window.localStorage.getItem('gameData')
        if (gameData !== null && state === null) {
            setState(JSON.parse(gameData))
        }

        // Save state to localstorage if we have a state to save
        if (state !== null) {
            window.localStorage.setItem('gameData', JSON.stringify(state))
        }
    }, [state])

    // Check for a win
    useEffect(() => {
        if (state && ![null, 'wait', 'done'].includes(state.phase)) {
            let newState = JSON.parse(JSON.stringify(state))

            for (let i = 0; i < state.players.length; i++) {
                if (state.players[i].hand.length === 0) {
                    clearTimeout(cpu1Timeout)
                    clearTimeout(cpu2Timeout)

                    // Empty hand!
                    console.log(`${state.players[i].name} wins round!`)
                    
                    // Give winning player a new card in their win pile
                    newState.players[i].wins.push(newState.discard.first())
    
                    // Reset the draw pile
                    newState.deck.push(...newState.discard)
                    newState.discard = []

                    newState.deck.push(...newState.center)
                    newState.center = []

                    newState.deck.push(...newState.players[0].hand)
                    newState.players[0].hand = []

                    newState.deck.push(...newState.players[1].hand)
                    newState.players[1].hand = []

                    newState.deck.push(...newState.players[2].hand)
                    newState.players[2].hand = []

                    newState.deck = newState.deck.shuffle()
    
                    newState.turn = i
                    newState.phase = 'wait'
                    newState.toDiscard = 0

                    if (newState.players[i].wins.length >= 3) {
                        console.log(`${newState.players[i].name} wins game!`)
        
                        newState.phase = 'done'
                    } else {
                        // Give each player 10 cards +1 for each round they've won
                        newState.players.forEach((player) => {
                            for (let i = 0; i < 10 + player.wins.length; i++) {
                                player.hand.push(newState.deck.pop())
                            }
                        })

                        console.log(`Dealt player ${newState.players[0].hand.length} cards`)
                        console.log(`Dealt CPU 1 ${newState.players[1].hand.length} cards`)
                        console.log(`Dealt CPU 2 ${newState.players[2].hand.length} cards`)

                        // Seed the center with a single card
                        newState.center.push(newState.deck.pop())
                    }

                    setState(newState)
                    return
                }
            }
        }
    }, [state, cpu1Timeout, cpu2Timeout])

    // Computer 1 AI
    useEffect(() => {
        // Normal turn
        if (state && !['wait', 'think', 'done'].includes(state.phase) && state.turn === 1) {
            const t = setTimeout(() => {
                let newState = JSON.parse(JSON.stringify(state))

                // Randomize cards in hand
                newState.players[1].hand = newState.players[1].hand.shuffle()

                let foundMatch = false
                let card = null
                let matches = 0

                while (!foundMatch && newState.players[1].hand.length > 0) {
                    // Find the first matching card
                    for (let i = 0; i < newState.players[1].hand.length; i++) {
                        matches = numMatches(newState.players[1].hand[i], newState.center.last())
                        if (matches > 0) {
                            card = newState.players[1].hand.splice(i, 1)[0]
                            foundMatch = true
                            break
                        }
                    }

                    // If our hand has no matches, draw a card and try again
                    if (!foundMatch) {
                        newState.players[1].hand.push(newState.deck.pop())
                    }
                }

                console.log(`CPU 1 played card ${card.color}/${card.wallpaper}/${card.decoration} has ${matches} match(es) with center card ${newState.center.last().color}/${newState.center.last().wallpaper}/${newState.center.last().decoration}`)
                newState.center.push(card)

                if (matches > 1) {
                    newState.phase = 'discard'
                    newState.toDiscard = matches - 1
                }

                // Discard from the front
                console.log(`CPU 1 discarded ${newState.toDiscard}`)
                newState.discard.push(...newState.players[1].hand.splice(0, newState.toDiscard))
                newState.toDiscard = 0
                newState.turn = 2
                newState.phase = 'play'

                setState(newState)
            }, Math.max(1000, Math.random() * 8000))

            setState({ ...state, phase: 'think' })
            setCPU1Timeout(t)
        }

        // Check for perfect match
        if (state && state.phase !== 'wait' && state.turn !== 1) {
            let newState = JSON.parse(JSON.stringify(state))
            let card = null 

            for (let i = 0; i < newState.players[1].hand.length; i++) {
                if (numMatches(newState.players[1].hand[i], newState.center.last()) === 3) {
                    card = newState.players[1].hand.splice(i, 1)[0]
                    break
                }
            }

            if (card !== null && Math.random() > 0.5) {
                clearTimeout(cpu1Timeout)
                clearTimeout(cpu2Timeout)
                
                console.log(`CPU 1 played perfect match ${card.color}/${card.wallpaper}/${card.decoration} with center card ${newState.center.last().color}/${newState.center.last().wallpaper}/${newState.center.last().decoration}`)
                newState.center.push(card)

                newState.toDiscard = 0
                newState.turn = 1
                newState.phase = 'play'

                setState(newState)
            }
        }
    }, [state, cpu1Timeout, cpu2Timeout])

    // Computer 2 AI
    useEffect(() => {
        // Normal turn
        if (state && !['wait', 'think', 'done'].includes(state.phase) &&  state.turn === 2) {
            const t = setTimeout(() => {
                let newState = JSON.parse(JSON.stringify(state))

                // Find best match to play
                let foundMatch = false
                let card = null
                let matches = 0

                while (!foundMatch && newState.players[2].hand.length > 0) {
                    // Find the first matching card
                    for (let i = 0; i < newState.players[2].hand.length; i++) {
                        const thisMatch = numMatches(newState.players[2].hand[i], newState.center.last())
                        if (thisMatch > 0 && thisMatch > matches) {
                            card = newState.players[2].hand.splice(i, 1)[0]
                            foundMatch = true
                            matches = thisMatch
                            break
                        }
                    }

                    // If our hand has no matches, draw a card and try again
                    if (!foundMatch) {
                        newState.players[2].hand.push(newState.deck.pop())
                    }
                }

                console.log(`CPU 2 played card ${card.color}/${card.wallpaper}/${card.decoration} has ${matches} match(es) with center card ${newState.center.last().color}/${newState.center.last().wallpaper}/${newState.center.last().decoration}`)
                newState.center.push(card)

                if (matches > 1) {
                    newState.phase = 'discard'
                    newState.toDiscard = matches - 1
                }
                
                // Discard from the front
                console.log(`CPU 2 discarded ${newState.toDiscard}`)
                newState.discard.push(...newState.players[2].hand.splice(0, newState.toDiscard))
                newState.toDiscard = 0
                newState.turn = 0
                newState.phase = 'play'

                setState(newState)
            }, Math.max(1000, Math.random() * 8000))

            setState({ ...state, phase: 'think' })
            setCPU2Timeout(t)
        }

        // Check for perfect match
        if (state && state.phase !== 'wait' && state.turn !== 2) {
            let newState = JSON.parse(JSON.stringify(state))
            let card = null 

            for (let i = 0; i < newState.players[2].hand.length; i++) {
                if (numMatches(newState.players[2].hand[i], newState.center.last()) === 3) {
                    card = newState.players[2].hand.splice(i, 1)[0]
                    break
                }
            }

            if (card !== null && Math.random() > 0.5) {
                clearTimeout(cpu1Timeout)
                clearTimeout(cpu2Timeout)
                
                console.log(`CPU 2 played perfect match ${card.color}/${card.wallpaper}/${card.decoration} with center card ${newState.center.last().color}/${newState.center.last().wallpaper}/${newState.center.last().decoration}`)
                newState.center.push(card)

                newState.toDiscard = 0
                newState.turn = 2
                newState.phase = 'play'

                setState(newState)
            }
        }
    }, [state, cpu1Timeout, cpu2Timeout])

    const generateDeck = () => {
        const colors = ['blue', 'grey', 'red']
        const wallpapers = ['flower', 'stripes', 'chevron']
        const decorations = ['clock', 'picture', 'plant']

        const deck = []
        for (let i = 0; i < 2; i++) {
            colors.forEach((color) => {
                wallpapers.forEach((wallpaper) => {
                    decorations.forEach((decoration) => {
                        deck.push({ color, wallpaper, decoration })
                    })
                })
            })
        }

        console.log(`Generated deck with ${deck.length} cards`)

        return deck.shuffle()
    }

    const startGame = () => {
        console.log(`Starting game...`)

        setState({ 
            ...defaultGameState,
            deck: generateDeck(),
            players: [{
                name: 'You',
                hand: [],
                wins: [],
            }, {
                name: 'CPU 1',
                hand: [],
                wins: [],
            }, {
                name: 'CPU 2',
                hand: [],
                wins: [],
            }]
        })
    }

    const deal = () => {
        let newState = JSON.parse(JSON.stringify(state))

        // Give each player 10 cards +1 for each round they've won
        newState.players.forEach((player) => {
            for (let i = 0; i < 10 + player.wins.length; i++) {
                player.hand.push(newState.deck.pop())
            }
        })

        console.log(`Dealt player ${newState.players[0].hand.length} cards`)
        console.log(`Dealt CPU 1 ${newState.players[1].hand.length} cards`)
        console.log(`Dealt CPU 2 ${newState.players[2].hand.length} cards`)

        // Seed the center with a single card
        newState.center.push(newState.deck.pop())

        // Randomly pick a starting player
        newState.turn = Math.floor(Math.random()*newState.players.length)
        newState.phase = 'wait'

        setState(newState)
    }

    const draw = () => {
        let newState = JSON.parse(JSON.stringify(state))

        newState.players[0].hand.push(newState.deck.pop())

        setState(newState)
    }

    const startRound = () => {
        clearTimeout(cpu1Timeout)
        clearTimeout(cpu2Timeout)

        console.log(`Starting round...`)

        setState({
            ...state,
            phase: 'play',
        })
    }

    const playCard = (cardIndex) => {
        // No off-turn plays unless it's a perfect match
        if (0 !== state.turn) {
            return
        }

        let newState = JSON.parse(JSON.stringify(state))

        const card = newState.players[newState.turn].hand.splice(cardIndex, 1)[0]
        const matches = numMatches(card, newState.center.last())

        console.log(`Played card ${card.color}/${card.wallpaper}/${card.decoration} has ${matches} match(es) with center card ${newState.center.last().color}/${newState.center.last().wallpaper}/${newState.center.last().decoration}`)

        // Can't play this card! Don't update the state
        if (matches === 0) {
            return
        }

        newState.center.push(card)

        if (matches > 1) {
            newState.phase = 'discard'
            newState.toDiscard = matches - 1
        } else {
            newState.turn++
        }

        setState(newState)
    }

    const discardCard = (cardIndex) => {
        // Nothing to discard! Or this is an off-turn discard
        if (state.toDiscard <= 0 || 0 !== state.turn) {
            return
        }

        let newState = JSON.parse(JSON.stringify(state))

        const card = newState.players[newState.turn].hand.splice(cardIndex, 1)[0]
        newState.discard.push(card)

        newState.toDiscard--

        // Done! Move to the next player
        if (newState.toDiscard <= 0) {
            newState.turn++
            if (newState.turn >= newState.players.length) {
                newState.turn = 0
            }
            newState.phase = 'play'
        }

        console.log(`Player discarded 1`)

        setState(newState)
    }

    const playPerfectCard = (cardIndex) => {
        let newState = JSON.parse(JSON.stringify(state))

        const card = newState.players[0].hand.splice(cardIndex, 1)[0]
        const matches = numMatches(card, newState.center.last())

        // This isn't a perfect match. Get outta here!
        if (matches !== 3) {
            return
        }

        clearTimeout(cpu1Timeout)
        clearTimeout(cpu2Timeout)

        console.log(`Played perfect match off turn!`)

        newState.center.push(card)

        newState.turn = 0
        newState.phase = 'play'

        setState(newState)
    }

    return {
        state,
        startGame,
        deal,
        draw,
        startRound,
        playCard,
        discardCard,
        playPerfectCard,
        cards: state ? [
            ...[...state.deck].map((c) => ({ ...c, location: 'deck', visible: false })),
            ...[...state.center].map((c) => ({ ...c, location: 'center', visible: true })),
            ...[...state.discard].map((c) => ({ ...c, location: 'discard', visible: false })),
            ...[...state.players[0].hand].map((c) => ({ ...c, location: 'hand', visible: true })),
            ...[...state.players[0].wins].map((c) => ({ ...c, location: 'p0wins', visible: false })),
            ...[...state.players[1].hand].map((c) => ({ ...c, location: 'cpu1', visible: false })),
            ...[...state.players[1].wins].map((c) => ({ ...c, location: 'p1wins', visible: false })),
            ...[...state.players[2].hand].map((c) => ({ ...c, location: 'cpu2', visible: false })),
            ...[...state.players[2].wins].map((c) => ({ ...c, location: 'p2wins', visible: false })),
        ] : null,
    }
}

export default useGameState
