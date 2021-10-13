function readPackage(pkg, context) {
    if (pkg.dependencies["@material-ui/core"]) {
        pkg.dependencies["@material-ui/core"] = "5.0.0-beta.3"
    }
    if (pkg.dependencies["@material-ui/styles"]) {
        pkg.dependencies["@material-ui/styles"] = "5.0.0-beta.3"
    }
    if (pkg.dependencies["@material-ui/icons"]) {
        pkg.dependencies["@material-ui/icons"] = "5.0.0-beta.1"
    }

    return pkg
}

module.exports = {
    hooks: {
        readPackage,
    },
}
