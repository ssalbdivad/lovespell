import React, { useEffect, useState } from "react"
import { store } from "../state.js"
import { Column, Text } from "@re-do/components"
import { getProgress, progressToEmoji } from "../progress.js"
import { randomRgbStringFromSeed } from "../random.js"
import { CircularProgress } from "@material-ui/core"

export type PerpetualProgressProps = {}

export const PerpetualProgress = ({}: PerpetualProgressProps) => {
    const { score, gameOver } = store.useQuery({
        gameOver: true,
        score: true,
    })
    const progress = score > 1000 ? 100 : (score / 1000) * 100
    return (
        <Column align="center">
            <CircularProgress
                value={progress}
                variant="determinate"
                style={{
                    height: "min(20vh, 250px)",
                    width: "min(20vh, 250px)",
                    marginTop: -20,
                }}
            />
            <Text
                variant="h5"
                style={{
                    position: "relative",
                    bottom: 120,
                    color: randomRgbStringFromSeed(score),
                }}
            >
                {score} of 1000
            </Text>
            <Text variant="h3" style={{ position: "relative", bottom: 120 }}>
                {progressToEmoji(progress)}
            </Text>
            {gameOver ? <GameResults win={score >= 1000} /> : <TimeRemaining />}
        </Column>
    )
}

export type GameResultsProps = {
    win: boolean
}

export const GameResults = ({ win }: GameResultsProps) => {
    const resultMessage = win ? "You win!🎊" : "You lose.😭"
    return (
        <Column align="center">
            <Text variant="h3">Game Over!</Text>
            <Text variant="h5">{resultMessage}</Text>
            <Text variant="h5">
                Insert 4 quarters or press New Game to continue
            </Text>
        </Column>
    )
}

export const TimeRemaining = () => {
    const { lastGameStart } = store.useQuery({ lastGameStart: true })
    if (!lastGameStart) {
        return (
            <Text variant="h5">Spell your first word to start the game!</Text>
        )
    }
    const getTimeRemaining = () => {
        const secondsRemaining = Math.round(
            (100000 - (Date.now() - lastGameStart)) / 1000
        )
        if (secondsRemaining <= 0) {
            store.update({ gameOver: true })
            return 0
        }
        return secondsRemaining
    }
    const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining())
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeRemaining(getTimeRemaining())
        }, 1000)
        return () => clearInterval(interval)
    }, [])
    const timeRemainingProgress = (timeRemaining / 100) * 100
    return (
        <Column align="center">
            <CircularProgress
                value={timeRemainingProgress}
                variant="determinate"
                style={{
                    height: "min(20vh, 250px)",
                    width: "min(20vh, 250px)",
                    marginTop: -20,
                }}
            />
            <Text
                variant="h3"
                style={{
                    position: "relative",
                    bottom: 120,
                }}
            >
                {timeRemaining}
            </Text>
        </Column>
    )
}
