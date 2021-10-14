import React from "react"
import { AppContents, Column, Row, Text, DefaultTheme } from "@re-do/components"
import { StatelessProvider } from "react-statelessly"
import { store } from "./state"
import { SolutionProgress } from "./SolutionProgress.js"
import { Game } from "./Game.js"
import { CssBaseline } from "@material-ui/core"

export const App = () => (
    <StatelessProvider store={store}>
        <CssBaseline />
        <AppContents>
            <Column
                full
                align="center"
                justify="center"
                style={{ padding: 16 }}
            >
                <Row
                    align="center"
                    justify="center"
                    wrap="wrap"
                    style={{ maxHeight: "100%", maxWidth: 1200 }}
                    spacing={4}
                >
                    <Column
                        justify="center"
                        align="center"
                        overflow="auto"
                        style={{ maxWidth: 600 }}
                    >
                        <Text style={{ fontSize: "clamp(1rem, 12vw , 3rem)" }}>
                            Lovespell 💖🪄
                        </Text>
                        <Game />
                    </Column>
                    <Column style={{ maxWidth: 600 }} overflow="auto">
                        <SolutionProgress />
                    </Column>
                </Row>
            </Column>
        </AppContents>
    </StatelessProvider>
)
