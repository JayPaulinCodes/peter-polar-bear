"use strict"
const config = require("conventional-changelog-conventionalcommits");

module.exports = config({
    "types": [
        { type: "chore", hidden: "Misc" },
        { type: "deprecate", section: "Deprecated" },
        { type: "docs", hidden: "Documentation" },
        { type: "feat", section: "Added" },
        { type: "fix", section: "Fixed" },
        { type: "perf", section: "Performance" },
        { type: "remove", section: "Removed" },
        { type: "security", section: "Security" },
    ]
})