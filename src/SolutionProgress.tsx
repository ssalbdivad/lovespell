import React from "react"
import { store } from "./state"
import CircularProgress from "@material-ui/core/CircularProgress"
import LinearProgress from "@material-ui/core/LinearProgress"
import { Column, Row, Text } from "@re-do/components"
import { getScore } from "./dictionary.js"

export type SolutionProgressProps = {}

export type WordsByMetric = Record<string, string[]>

export const bestWordProgressToEmoji: Record<number, string> = {
    0: "🪦",
    1: "😴",
    2: "🤔",
    3: "👍",
    4: "🤓",
    5: "👏",
    6: "🍾",
    7: "🧠",
    8: "🦸",
    9: "🧙‍♂️",
    10: "🤖",
}

export const SolutionProgress = ({}: SolutionProgressProps) => {
    // @ts-ignore
    const solutions = store.useGet("analysis/0/words")
    const wordsFound = store.useGet("wordsFound")
    const revealed = store.useGet("revealed")
    const score = store.useGet("score")
    let bestWord = ""
    let bestWordScore = 0
    const foundByLength = wordsFound.reduce((result, word) => {
        const wordScore = getScore(word)
        if (wordScore > bestWordScore) {
            bestWordScore = wordScore
            bestWord = word
        }
        return {
            ...result,
            [word.length]: [...(result[`${word.length}`] ?? []), word],
        }
    }, {} as WordsByMetric)
    const solutionsByLength = Object.entries(solutions).reduce(
        (byLength, [word, { length }]) => ({
            ...byLength,
            [length]: [...(byLength[`${length}`] ?? []), word],
        }),
        {} as WordsByMetric
    )
    let maxScore = 0
    let maxWordScore = 0
    let maxWord = ""
    const solutionsByScore = Object.entries(solutions).reduce(
        (byScore, [word, { score }]) => {
            if (score > maxWordScore) {
                maxWordScore = score
                maxWord = word
            }
            maxScore += score
            return {
                ...byScore,
                [score]: [...(byScore[`${length}`] ?? []), word],
            }
        },
        {} as WordsByMetric
    )
    const progressColumns: JSX.Element[][] = [[], []]
    Object.entries(solutionsByLength).forEach(([length, solutions], index) => {
        const foundOfLength = foundByLength[length] ?? []
        progressColumns[index % 2].push(
            <Column key={length} style={{ minHeight: 104 }}>
                <Row align="center" justify="center" position="relative">
                    <Text variant="h6" style={{ width: 80 }}>
                        {length}-letter
                    </Text>
                    <CircularProgress
                        variant="determinate"
                        value={(foundOfLength.length / solutions.length) * 100}
                        style={{ width: 80 }}
                    />
                    <Text
                        style={{
                            position: "relative",
                            width: 80,
                            right: 45,
                            fontSize: 16,
                        }}
                    >
                        {foundOfLength.length} of {solutions.length}
                    </Text>
                </Row>
                <Text>
                    {revealed
                        ? solutions.join(", ")
                        : foundOfLength?.join(", ")}
                </Text>
            </Column>
        )
    })
    return (
        <Column align="center">
            <Text variant="h4">Score: {score}</Text>
            <Row height={40} align="baseline">
                <LinearProgress
                    value={(score / maxScore) * 100}
                    variant="determinate"
                    style={{ width: "100%" }}
                />
                <Text style={{ minWidth: 80, paddingLeft: 8 }}>
                    of {maxScore}
                </Text>
            </Row>
            <Row height={40} align="baseline" justify="space-around">
                <Text>
                    Best word:
                    {` ${bestWord} (${bestWordScore} points${
                        bestWordProgressToEmoji[
                            Math.floor((bestWordScore / maxWordScore) * 10)
                        ]
                    })`}
                </Text>
                <Text>
                    Best possible: {revealed ? maxWord : "???"} ({maxWordScore}{" "}
                    points🤖)
                </Text>
            </Row>
            <Row>
                <Column>{...progressColumns[0]}</Column>
                <Column>{...progressColumns[1]}</Column>
            </Row>
        </Column>
    )
}
