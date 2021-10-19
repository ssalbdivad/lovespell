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
import { isMobile, store } from "./state"
import BackIcon from "@material-ui/icons/KeyboardBackspace"
import EnterIcon from "@material-ui/icons/Check"
import ClearIcon from "@material-ui/icons/Clear"
import { isEmpty } from "@re-do/utils"
import { getValidPaths } from "./getValidPaths.js"
import { randomRgbFromSeed } from "./random.js"

export const WordInput = () => {
    const { error, input } = store.useQuery({
        input: true,
        error: true,
    })
    const inputScore = getScore(input)
    // @ts-ignore
    const analysis = store.useGet("analysis")[0]
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
                            path: lastValidPath,
                            input: updatedInput,
                            errors: "",
                            isValid,
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
                        color: randomRgbFromSeed(inputScore),
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
