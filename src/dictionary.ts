import { randomInRange } from "./random.js"

// @ts-ignore
import dictionaryTrieJson from "./dictionaryTrie.json"

// @ts-ignore
const dictionaryTrie: WordsTrie = dictionaryTrieJson

// @ts-ignore
import sortedDictionaryJson from "./sortedDictionary.json"

// @ts-ignore
const sortedDictionary: SortedDictionary = sortedDictionaryJson

export const letterFrequencies = {
    e: 11,
    a: 9,
    r: 7,
    i: 7,
    o: 7,
    t: 7,
    s: 7,
    n: 6,
    l: 5,
    c: 4,
    u: 4,
    d: 3,
    p: 3,
    m: 3,
    h: 3,
    g: 2,
    b: 2,
    f: 2,
    y: 1,
    w: 1,
    k: 1,
    v: 1,
    x: 1,
    z: 1,
    j: 1,
    q: 1,
}

export const letterScores = Object.fromEntries(
    Object.entries(letterFrequencies).map(([letter, frequency]) => [
        letter,
        Math.round(20 / frequency),
    ])
)

export type Letter = keyof typeof letterFrequencies
export const alphabet = Object.keys(letterFrequencies) as Letter[]

export type WordsTrie = {
    [K in keyof typeof letterFrequencies]?: WordsTrie
} & {
    "!"?: 1
}

export type SortedDictionary = {
    [wordLength: number]: string[]
}

export const buildSortedDictionary = async () => {
    // @ts-ignore
    // const dictionary = await import("./dictionaryFrequencies.json")
    const dictionary = {}
    const sortedDictionary: SortedDictionary = {}
    Object.keys(dictionary).forEach((word) => {
        console.log(`Adding '${word}'...`)
        if (!sortedDictionary[word.length]) {
            sortedDictionary[word.length] = [word]
        } else {
            sortedDictionary[word.length].push(word)
        }
    })
    return sortedDictionary
}

export const buildWordsTrie = async () => {
    // @ts-ignore
    // const dictionary = await import("./dictionaryFrequencies.json")
    const dictionary = {}
    const wordList = Object.keys(dictionary)
    const root: WordsTrie = {}
    const addSuffixToTrie = (trie: WordsTrie, suffix: string) => {
        if (!suffix) {
            trie["!"] = 1
            return
        }
        const firstLetter = suffix.charAt(0) as Letter
        if (!trie[firstLetter]) {
            trie[firstLetter] = {}
        }
        addSuffixToTrie(trie[firstLetter]!, suffix.slice(1))
    }
    wordList.forEach((word) => {
        console.log(`Adding ${word}...`)
        addSuffixToTrie(root, word)
    })
    return root
}

export const getTrie = (prefix: string) => {
    const recurse = (
        trie: WordsTrie,
        suffix: string
    ): WordsTrie | undefined => {
        if (!suffix) {
            return trie
        }
        const firstLetter = suffix.charAt(0) as Letter
        if (firstLetter in trie) {
            return recurse(trie[firstLetter]!, suffix.slice(1))
        }
        return undefined
    }
    return recurse(dictionaryTrie, prefix)
}

export const isWord = (input: string) => !!getTrie(input)?.["!"]

export type CommonWordsByLengthOptions = {
    maxResults?: number
    percent?: number
}

export const randomCommonWordByLength = (
    length: number,
    { maxResults, percent }: CommonWordsByLengthOptions = {}
) => {
    const wordsOfLength = sortedDictionary[length]
    let maxIndex = wordsOfLength.length - 1
    if (percent) {
        maxIndex = Math.floor((maxIndex * percent) / 100)
    }
    if (maxResults && maxIndex > maxResults) {
        maxIndex = maxResults
    }
    return wordsOfLength[randomInRange(0, maxIndex)]
}

export const getScore = (input: string) => {
    if (!input) {
        return 0
    }
    return (
        input
            .split("")
            .reduce((score, char) => score + (letterScores[char] ?? 1), 1) *
        input.length
    )
}
