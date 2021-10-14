import React, { useState } from "react"
import { store } from "./state"
import CircularProgress from "@material-ui/core/CircularProgress"
import LinearProgress from "@material-ui/core/LinearProgress"
import { Column, Row, Text } from "@re-do/components"
import { getScore } from "./dictionary.js"

import { Icons } from "@re-do/components"
import Accordion, { AccordionProps } from "@material-ui/core/Accordion"
import AccordionSummary from "@material-ui/core/AccordionSummary"
import AccordionDetails from "@material-ui/core/AccordionDetails"

type StepProps = Partial<AccordionProps> & {
    summary: string
    children: JSX.Element | JSX.Element[]
}

const Expandable = ({
    summary,
    children,
    defaultExpanded,
    ...rest
}: StepProps) => {
    const [expanded, setExpanded] = useState(!!defaultExpanded)
    return (
        <Accordion
            key={summary}
            style={{
                background: "transparent",
            }}
            elevation={0}
            onChange={(_, open) => setExpanded(open)}
            defaultExpanded={defaultExpanded ?? false}
            {...rest}
        >
            <AccordionSummary expandIcon={<Icons.expandDown />}>
                <Row align="center">
                    <Text variant="h6">{summary}</Text>
                </Row>
            </AccordionSummary>
            <AccordionDetails>{children}</AccordionDetails>
        </Accordion>
    )
}

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
    const [windowWidth] = useState(window.innerWidth)
    const progressByLength: JSX.Element[] = []
    Object.entries(solutionsByLength).forEach(([length, solutions], index) => {
        const foundOfLength = foundByLength[length] ?? []
        progressByLength.push(
            <Column key={length} style={{ minHeight: 104, maxWidth: 270 }}>
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
            <Row height={40} align="baseline">
                <LinearProgress
                    value={(score / maxScore) * 100}
                    variant="determinate"
                    style={{ width: "100%" }}
                />
                <Text variant="h6" style={{ minWidth: 150, paddingLeft: 8 }}>
                    {score} of {maxScore}
                </Text>
            </Row>
            <Row height={40} align="baseline" justify="space-around">
                <Text>Best word: {bestWord}</Text>
                <Text>Best possible: {revealed ? maxWord : "???"}</Text>
            </Row>
            <Row justify="space-around">
                <Text>
                    {`(${bestWordScore} points${
                        bestWordProgressToEmoji[
                            Math.floor((bestWordScore / maxWordScore) * 10)
                        ]
                    })`}
                </Text>
                <Text>({maxWordScore} points🤖)</Text>
            </Row>
            <Row style={{ padding: 8 }}>
                {windowWidth >= 800 ? (
                    <Row wrap="wrap">{...progressByLength}</Row>
                ) : (
                    <Expandable
                        summary="Words"
                        children={<Row wrap="wrap">{...progressByLength}</Row>}
                    />
                )}
            </Row>
        </Column>
    )
}
