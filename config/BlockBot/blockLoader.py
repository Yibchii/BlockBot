def loadAllBlocks():
    result = ""
    result += testBlock() + "\n"
    result += forLoopBlock() + "\n"
    return result

def testBlock():
    return "Test Block"

def forLoopBlock():
    return "For Loop Block"