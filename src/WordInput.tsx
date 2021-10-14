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

export const getValidPaths = (
    input: string,
    { positions: letterMap, adjacencies: adjacencyMap }: LetterAnalysis
) => {
    const result = {
        isValid: false,
        lastValidPath: undefined as undefined | LetterPosition[],
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
    lastValidPath: LetterPosition[] | undefined,
    previousSegments: Segments | undefined
) => {
    if (lastValidPath && lastValidPath.length > 1) {
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
    const { input, error } = store.useQuery({
        input: true,
        error: true,
    })
    const inputScore = getScore(input)
    // @ts-ignore
    const segmentColors = Object.values(store.useGet("segments/0"))
    return (
        <Column align="center">
            <Row justify="center">
                {isMobile ? (
                    <>
                        <TextInput style={{ flexGrow: 1 }} kind="underlined">
                            {input}
                        </TextInput>
                        <Button
                            Icon={BackIcon}
                            style={{ marginRight: 8 }}
                            onClick={() =>
                                store.update({
                                    input: input.slice(-1),
                                })
                            }
                        />

                        <Button
                            Icon={ClearIcon}
                            onClick={() =>
                                store.update({
                                    input: "",
                                })
                            }
                        />

                        <Button
                            style={{ marginLeft: 8 }}
                            Icon={EnterIcon}
                            onClick={() => store.$.submitInput()}
                        />
                    </>
                ) : (
                    <>
                        <TextInput
                            value={input}
                            onChange={({ target }) => {
                                store.update({ input: target.value })
                            }}
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
                    </>
                )}
            </Row>
            {error ? <ErrorText>{error}</ErrorText> : null}
        </Column>
    )
}
