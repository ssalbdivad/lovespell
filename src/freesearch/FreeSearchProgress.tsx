import React, { useState } from "react"
import { store } from "../state"
import CircularProgress from "@material-ui/core/CircularProgress"
import LinearProgress from "@material-ui/core/LinearProgress"
import { Column, Row, Text } from "@re-do/components"
import { Expandable } from "../Expandable.js"
import { getProgress } from "../progress.js"

export const FreeSearchProgress = () => {
    // @ts-ignore
    const solutions = store.useGet("analysis")[0].solutions
    const wordsFound = store.useGet("wordsFound")
    const revealed = store.useGet("revealed")
    const progress = getProgress({ solutions, wordsFound })
    const [windowWidth] = useState(window.innerWidth)
    const progressComponentByLength: JSX.Element[] = []
    Object.entries(progress.byLength).forEach(
        ([length, { found, possible, percent }], index) => {
            progressComponentByLength.push(
                <Column key={length} style={{ minHeight: 104, maxWidth: 270 }}>
                    <Row align="center" justify="center" position="relative">
                        <Text variant="h6" style={{ width: 80 }}>
                            {length}-letter
                        </Text>
                        <CircularProgress
                            variant="determinate"
                            value={percent}
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
                            {found.length} of {possible.length}
                        </Text>
                    </Row>
                    <Text>
                        {revealed ? possible.join(", ") : found?.join(", ")}
                    </Text>
                </Column>
            )
        }
    )
    return (
        <Column align="center">
            <Row height={40} align="baseline">
                <LinearProgress
                    value={progress.score.percent}
                    variant="determinate"
                    style={{ width: "100%" }}
                />
                <Text variant="h6" style={{ minWidth: 150, paddingLeft: 8 }}>
                    {progress.score.current} of {progress.score.max}
                </Text>
            </Row>
            <Row height={40} align="baseline" justify="space-around">
                <Text>Best word: {progress.bestWord.current.word}</Text>
                <Text>
                    Best possible:{" "}
                    {revealed ? progress.bestWord.max.word : "???"}
                </Text>
            </Row>
            <Row justify="space-around">
                <Text>
                    {`(${progress.bestWord.current.score} points${progress.bestWord.progress.emoji})`}
                </Text>
                <Text>({progress.bestWord.max.score} points🤖)</Text>
            </Row>
            <Row style={{ padding: 8, marginTop: 16 }}>
                {windowWidth >= 800 ? (
                    <Row wrap="wrap">{...progressComponentByLength}</Row>
                ) : (
                    <Expandable
                        summary="Words"
                        children={
                            <Row wrap="wrap">
                                {...progressComponentByLength}
                            </Row>
                        }
                    />
                )}
            </Row>
        </Column>
    )
}
