import { getWebConfig } from "@re-do/configs"
import { fromHere, isProd } from "@re-do/node-utils"

const pkgRoot = fromHere("src")

export default getWebConfig({
    srcDir: pkgRoot,
    outDir: fromHere("docs"),
    watch: !isProd(),
    options: {
        build: {
            sourcemap: false,
        },
        server: {
            port: Number(process.env.VITE_DEV_SERVER_PORT),
        },
    },
})
