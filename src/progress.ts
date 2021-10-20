import { getScore } from "./dictionary.js"
import { Position, Solutions } from "./generateGrid.js"
import { store } from "./state.js"

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

export const progressToEmoji = (percent: number) =>
    bestWordProgressToEmoji[Math.floor(percent / 10)]

export type GetProgressOptions = {
    solutions: Solutions
    wordsFound: string[]
}

export const getProgress = ({ solutions, wordsFound }: GetProgressOptions) => {
    let bestWord = ""
    let bestWordScore = 0
    let currentScore = 0
    let longestWord = ""
    let mostPositionsUsed = 0
    let mostPositionsUsedWord = ""
    const foundByLength = wordsFound.reduce((result, word) => {
        if (word.length > longestWord.length) {
            longestWord = word
        }
        const wordScore = getScore(word)
        if (wordScore > bestWordScore) {
            bestWordScore = wordScore
            bestWord = word
        }
        currentScore += wordScore
        const positionsUsed = solutions[word].positionsUsed
        if (positionsUsed > mostPositionsUsed) {
            mostPositionsUsed = positionsUsed
            mostPositionsUsedWord = word
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
    let maxWordScore = 0
    let maxTotalScore = 0
    let maxWord = ""
    let maxLengthWord = ""
    let maxPositionsUsed = 0
    let maxPositionsUsedWord = ""
    const solutionsByScore = Object.entries(solutions).reduce(
        (byScore, [word, { score }]) => {
            if (word.length > maxLengthWord.length) {
                maxLengthWord = word
            }
            if (score > maxWordScore) {
                maxWordScore = score
                maxWord = word
            }
            maxTotalScore += score
            const positionsUsed = solutions[word].positionsUsed
            if (positionsUsed > maxPositionsUsed) {
                maxPositionsUsed = positionsUsed
                maxPositionsUsedWord = word
            }
            return {
                ...byScore,
                [score]: [...(byScore[`${length}`] ?? []), word],
            }
        },
        {} as WordsByMetric
    )
    const progressByWordLength: Record<
        string,
        { found: string[]; possible: string[]; percent: number }
    > = {}
    Object.entries(solutionsByLength).forEach(
        ([length, solutionsOfLength], index) => {
            const foundOfLength = foundByLength[length] ?? []
            progressByWordLength[length] = {
                found: foundOfLength,
                possible: solutionsOfLength,
                percent:
                    (foundOfLength.length / solutionsOfLength.length) * 100,
            }
        }
    )
    const scoreProgress = {
        current: currentScore,
        max: maxTotalScore,
        percent: (currentScore / maxTotalScore) * 100,
    }
    const bestWordPercent = (bestWordScore / maxWordScore) * 100
    const bestWordProgress = {
        current: {
            word: bestWord,
            score: bestWordScore,
        },
        max: {
            word: maxWord,
            score: maxWordScore,
        },
        progress: {
            percent: bestWordPercent,
            emoji: progressToEmoji(bestWordPercent),
        },
    }
    store.update({ currentPangram: maxPositionsUsedWord })
    const positionsUsedPercent = (mostPositionsUsed / maxPositionsUsed) * 100
    const positionsUsedProgress = {
        current: {
            word: mostPositionsUsedWord,
            count: mostPositionsUsed,
        },
        max: {
            word: maxPositionsUsedWord,
            count: maxPositionsUsed,
        },
        progress: {
            percent: positionsUsedPercent,
            emoji: progressToEmoji(maxPositionsUsed),
        },
    }
    return {
        score: scoreProgress,
        bestWord: bestWordProgress,
        byLength: progressByWordLength,
        positionsUsed: positionsUsedProgress,
    }
}
