import React, { useState } from "react"
import {
    Row,
    Column,
    Text,
    TextInput,
    ErrorText,
    Button,
} from "@re-do/components"
import { isWord, getScore } from "./dictionary.js"
import {
    LetterPosition,
    randomInRange,
    LetterAnalysis,
} from "./generateLetterGrid.js"
import { isMobile, Segments, store } from "./state"
import BackIcon from "@material-ui/icons/KeyboardBackspace"
import EnterIcon from "@material-ui/icons/Check"
import ClearIcon from "@material-ui/icons/Clear"
import { isEmpty } from "@re-do/utils"

export const getValidPaths = (
    input: string,
    { positions: letterMap, adjacencies: adjacencyMap }: LetterAnalysis
) => {
    const result = {
        isValid: false,
        lastValidPath: [] as LetterPosition[],
        validPaths: [] as LetterPosition[][],
    }
    if (!input) {
        return result
    }
    if (!letterMap[input[0]]) {
        return result
    }
    result.validPaths = letterMap[input[0]].map((position) => [position])
    input
        .substring(1)
        .split("")
        .forEach((char) => {
            const nextValidPaths: LetterPosition[][] = []
            result.validPaths.forEach((path) => {
                const nextValidPositions =
                    adjacencyMap[path[path.length - 1]].adjacent[char]
                if (nextValidPositions) {
                    nextValidPositions.forEach((position) =>
                        nextValidPaths.push([...path, position])
                    )
                }
            })
            if (nextValidPaths.length) {
                result.lastValidPath = nextValidPaths[0]
                result.isValid = true
            } else {
                result.isValid = false
            }
            result.validPaths = nextValidPaths
        })
    return result
}

export const getSegments = (
    isValid: boolean,
    lastValidPath: LetterPosition[],
    previousSegments: Segments | undefined
) => {
    if (!isEmpty(lastValidPath)) {
        if (isValid) {
            return lastValidPath!.reduce(
                (colors, position, index, positions) => {
                    if (!index) {
                        return colors
                    }
                    const segmentName = `${
                        positions[index - 1]
                    }:${position}` as const
                    return {
                        ...colors,
                        [segmentName]:
                            previousSegments &&
                            segmentName in previousSegments &&
                            previousSegments[segmentName] !== errorRed
                                ? previousSegments[segmentName]
                                : // Random color that should be dark enough to see
                                  `rgb(${randomInRange(
                                      55,
                                      255
                                  )}, ${randomInRange(
                                      55,
                                      255
                                  )}, ${randomInRange(55, 255)})`,
                    }
                },
                {}
            )
        } else {
            return lastValidPath.reduce(
                (colors, position, index, positions) =>
                    index > 0
                        ? {
                              ...colors,
                              [`${positions[index - 1]}:${position}`]: errorRed,
                          }
                        : colors,
                {}
            )
        }
    }
    return {}
}

const errorRed = "rgb(255, 0, 0)"

export const WordInput = () => {
    const { error, input } = store.useQuery({
        input: true,
        error: true,
    })
    const inputScore = getScore(input)
    // @ts-ignore
    const analysis = store.useGet("analysis")[0]
    // @ts-ignore
    const segments = store.useGet("segments")[0]
    const segmentColors = Object.values(segments)
    return (
        <Column align="center">
            <Row justify="center">
                <TextInput
                    value={input}
                    onChange={({ target }) => {
                        const updatedInput = target.value.toLowerCase()
                        const { isValid, lastValidPath } = getValidPaths(
                            updatedInput,
                            analysis
                        )
                        store.update({
                            currentPath: lastValidPath,
                            input: updatedInput,
                            errors: "",
                            isValid,
                            segments: [
                                getSegments(isValid, lastValidPath, segments),
                            ],
                        })
                    }}
                    kind="underlined"
                    onKeyPress={({ key }) => {
                        if (key === "Enter") {
                            store.$.submitInput(input)
                        }
                    }}
                />
                <Text
                    style={{
                        color: segmentColors[segmentColors.length - 1],
                    }}
                >
                    +{inputScore}
                </Text>
                {isMobile ? (
                    <>
                        <Button
                            Icon={BackIcon}
                            style={{ marginRight: 8 }}
                            onClick={() =>
                                store.update({
                                    input: input.slice(0, -1),
                                    errors: "",
                                })
                            }
                        />

                        <Button
                            Icon={ClearIcon}
                            onClick={() =>
                                store.update({
                                    input: "",
                                    errors: "",
                                })
                            }
                        />

                        <Button
                            style={{ marginLeft: 8 }}
                            Icon={EnterIcon}
                            onClick={() => store.$.submitInput()}
                        />
                    </>
                ) : null}
            </Row>
            {error ? <ErrorText>{error}</ErrorText> : null}
        </Column>
    )
}
