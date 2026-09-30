#README
# to use, add a new function that defines a block, and add that function to LoadAllBlocks()

def loadAllBlocks():
    result = ""
    result += testBlock() + "\n"
    result += forLoopBlock() + "\n"
    return result

#placeholder
def testBlock():
    return "Test Block"

#placeholder
def forLoopBlock():
    return "For Loop Block"