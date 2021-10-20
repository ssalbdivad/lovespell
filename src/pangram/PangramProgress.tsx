import React from "react"
import CircularProgress from "@material-ui/core/CircularProgress"
import { Column, Row, Text } from "@re-do/components"
import { getProgress, progressToEmoji } from "../progress.js"
import { store } from "../state.js"
import { maxPositionsUsed } from "../generateGrid.js"

export const PangramProgress = () => {
    // @ts-ignore
    const solutions = store.useGet("analysis")[0].solutions
    const { wordsFound, revealed, path, pangramsFound } = store.useQuery({
        wordsFound: true,
        revealed: true,
        path: true,
        pangramsFound: true,
    })
    const { max } = getProgress({
        solutions,
        wordsFound,
    }).positionsUsed
    const positionsUsedForInput = maxPositionsUsed([path]).count
    const percent = (positionsUsedForInput / max.count) * 100
    return (
        <Column align="center">
            <CircularProgress
                value={percent}
                variant="determinate"
                style={{
                    height: "min(20vh, 250px)",
                    width: "min(20vh, 250px)",
                    marginTop: -20,
                }}
            />
            <Text variant="h4" style={{ position: "relative", bottom: 120 }}>
                {positionsUsedForInput} of {max.count}
            </Text>
            <Text variant="h3" style={{ position: "relative", bottom: 120 }}>
                {progressToEmoji(percent)}
            </Text>
            {revealed ? (
                <Text
                    variant="h6"
                    style={{ position: "relative", bottom: 100 }}
                >
                    🤖: "{max.word}"
                </Text>
            ) : null}
            {pangramsFound ? (
                <Text
                    variant="h6"
                    style={{ position: "relative", bottom: 100 }}
                >
                    {pangramsFound} pangrams found!
                </Text>
            ) : null}
        </Column>
    )
}
