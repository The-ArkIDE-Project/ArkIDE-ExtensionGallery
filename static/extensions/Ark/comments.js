(function(Scratch){
    if(!Scratch.extensions.unsandboxed){alert("This extension must run unsandboxed!"); return}

    class CommentBlocks {
        getInfo(){return{
            id: "commentblocks",
            name: "Comment Blocks",
            color1: "#7a7a7a",
            color2: "#5a5a5a",
            blocks: [
                {
                    opcode: "comment",
                    text: "// [comment]",
                    blockType: Scratch.BlockType.COMMAND,
                    arguments: {
                        comment: {type: Scratch.ArgumentType.STRING, defaultValue: "This is a comment"}
                    }
                },
                {
                    opcode: "commentSection",
                    text: "// [comment]",
                    blockType: Scratch.BlockType.CONDITIONAL,
                    arguments: {
                        comment: {type: Scratch.ArgumentType.STRING, defaultValue: "Section label"}
                    },
                    branchCount: 1
                },
                "---",
                {
                    opcode: "todo",
                    text: "TODO: [comment]",
                    blockType: Scratch.BlockType.COMMAND,
                    arguments: {
                        comment: {type: Scratch.ArgumentType.STRING, defaultValue: "Fix this later"}
                    }
                },
                {
                    opcode: "todoSection",
                    text: "TODO: [comment]",
                    blockType: Scratch.BlockType.CONDITIONAL,
                    arguments: {
                        comment: {type: Scratch.ArgumentType.STRING, defaultValue: "Fix this later"}
                    },
                    branchCount: 1
                },
                "---",
                {
                    opcode: "note",
                    text: "NOTE: [comment]",
                    blockType: Scratch.BlockType.COMMAND,
                    arguments: {
                        comment: {type: Scratch.ArgumentType.STRING, defaultValue: "Important note"}
                    }
                },
                {
                    opcode: "noteSection",
                    text: "NOTE: [comment]",
                    blockType: Scratch.BlockType.CONDITIONAL,
                    arguments: {
                        comment: {type: Scratch.ArgumentType.STRING, defaultValue: "Important note"}
                    },
                    branchCount: 1
                },
                "---",
                {
                    opcode: "region",
                    text: "region [comment]",
                    blockType: Scratch.BlockType.LOOP,
                    arguments: {
                        comment: {type: Scratch.ArgumentType.STRING, defaultValue: "My Region"}
                    },
                    isTerminal: false
                },
                "---",
                {
                    opcode: "disabled",
                    text: "DISABLED [comment]",
                    blockType: Scratch.BlockType.CONDITIONAL,
                    arguments: {
                        comment: {type: Scratch.ArgumentType.STRING, defaultValue: ""}
                    },
                    branchCount: 1
                },
            ]
        }}

        // Plain comment - does nothing
        comment(){ }

        // C block comment - just runs inner code
        commentSection(args, util){
            if(util.stackFrame.loopCounter === undefined){
                util.stackFrame.loopCounter = 1
            }
            if(util.stackFrame.loopCounter > 0){
                util.stackFrame.loopCounter--
                util.startBranch(1, false)
            }
        }

        // TODO inline
        todo(){ }

        // TODO C block
        todoSection(args, util){
            if(util.stackFrame.loopCounter === undefined){
                util.stackFrame.loopCounter = 1
            }
            if(util.stackFrame.loopCounter > 0){
                util.stackFrame.loopCounter--
                util.startBranch(1, false)
            }
        }

        // NOTE inline
        note(){ }

        // NOTE C block
        noteSection(args, util){
            if(util.stackFrame.loopCounter === undefined){
                util.stackFrame.loopCounter = 1
            }
            if(util.stackFrame.loopCounter > 0){
                util.stackFrame.loopCounter--
                util.startBranch(1, false)
            }
        }

        // Region loop wrapper - runs inner code once and stops (acts like a C block but uses LOOP type for cap)
        region(args, util){
            if(util.stackFrame.loopCounter === undefined){
                util.stackFrame.loopCounter = 1
            }
            if(util.stackFrame.loopCounter > 0){
                util.stackFrame.loopCounter--
                util.startBranch(1, false)
            }
        }

        // DISABLED C block - swallows all code inside and does NOT run it
        disabled(args, util){
            // intentionally do nothing - code inside never runs
        }
    }

    Scratch.extensions.register(new CommentBlocks())
})(Scratch)