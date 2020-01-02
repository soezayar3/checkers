function makeMoves(parent, parentBoard, friendly, friendlyKing) {
    var moves = new Array();

    for (var i = 0; i < parentBoard.length; i++) {
        if (parentBoard[i] == friendly || parentBoard[i] == friendlyKing) {
            if (canMoveUpLeft(parentBoard, i, parentBoard[i])) {
                var childBoard = copyBoard(parentBoard);
                moveUpLeft(childBoard, i);
                var len = moves.length;
                moves[len] = new node(childBoard, parent);
            } 
            if (canMoveUpRight(parentBoard, i, parentBoard[i])) {
                var childBoard = copyBoard(parentBoard);
                moveUpRight(childBoard, i);
                var len = moves.length;
                moves[len] = new node(childBoard, parent);
            } 
            if (canMoveDownLeft(parentBoard, i, parentBoard[i])) {
                var childBoard = copyBoard(parentBoard);
                moveDownLeft(childBoard, i);
                var len = moves.length;
                moves[len] = new node(childBoard, parent);
            } 
            if (canMoveDownRight(parentBoard, i, parentBoard[i])) {
                var childBoard = copyBoard(parentBoard);
                moveDownRight(childBoard, i);
                var len = moves.length;
                moves[len] = new node(childBoard, parent);
            } 
        }
    }
    return moves;
}

function jumpUpLeft(board, oldPos) {
    var temp = board[oldPos];
    board[oldPos] = WHITE;
    board[oldPos-9] = WHITE;
    board[oldPos-18] = temp;
    if (oldPos-18 <= 7 && board[oldPos-18] == HUMAN) {
        board[oldPos-18] = HUMANKING;
    }
}
function jumpUpRight(board, oldPos) {
    var temp = board[oldPos];
    board[oldPos] = WHITE;
    board[oldPos-7] = WHITE;
    board[oldPos-14] = temp;
    if (oldPos-14 <= 7 && board[oldPos-14] == HUMAN) {
        board[oldPos-14] = HUMANKING;
    }
}
function jumpDownLeft(board, oldPos) {
    var temp = board[oldPos];
    board[oldPos] = WHITE;
    board[oldPos+7] = WHITE;
    board[oldPos+14] = temp;
    if (oldPos+14 >= 56 && board[oldPos+14] == AI) {
        board[oldPos+14] = AIKING;
    }
}
function jumpDownRight(board, oldPos) {
    var temp = board[oldPos];
    board[oldPos] = WHITE;
    board[oldPos+9] = WHITE;
    board[oldPos+18] = temp;
    if (oldPos+18 >= 56 && board[oldPos+18] == AI) {
        board[oldPos+18] = AIKING;
    }
}

var UPLEFTJUMP = -18;
var UPRIGHTJUMP = -14;
var DOWNLEFTJUMP = 14;
var DOWNRIGHTJUMP = 18;

function makeJumps(parentBoard, friendly, friendlyKing, enemy, enemyKing, position) {
    var jumps = new Array();
    
    if (canJumpUpLeft(position, parentBoard, friendly, friendlyKing, enemy, enemyKing)) {
        var childBoard = copyBoard(parentBoard);
        jumpUpLeft(childBoard, position);
        if (canJump(position+UPLEFTJUMP, childBoard, friendly, friendlyKing, enemy, enemyKing)) {
            append(jumps, makeJumps(childBoard, friendly, friendlyKing, enemy, enemyKing, position+UPLEFTJUMP));
        } else {
            append(jumps, [childBoard]);
        }
    }
    if (canJumpUpRight(position, parentBoard, friendly, friendlyKing, enemy, enemyKing)) {
        var childBoard = copyBoard(parentBoard);
        jumpUpRight(childBoard, position);
        if (canJump(position+UPRIGHTJUMP, childBoard, friendly, friendlyKing, enemy, enemyKing)) {
            append(jumps, makeJumps(childBoard, friendly, friendlyKing, enemy, enemyKing, position+UPRIGHTJUMP));
        } else {
            append(jumps, [childBoard]);
        }
    }
    if (canJumpDownLeft(position, parentBoard, friendly, friendlyKing, enemy, enemyKing)) {
        var childBoard = copyBoard(parentBoard);
        jumpDownLeft(childBoard, position);
        if (canJump(position+DOWNLEFTJUMP, childBoard, friendly, friendlyKing, enemy, enemyKing)) {
            append(jumps, makeJumps(childBoard, friendly, friendlyKing, enemy, enemyKing, position+DOWNLEFTJUMP));
        } else {
            append(jumps, [childBoard]);
        }
    }
    if (canJumpDownRight(position, parentBoard, friendly, friendlyKing, enemy, enemyKing)) {
        var childBoard = copyBoard(parentBoard);
        jumpDownRight(childBoard, position);
        if (canJump(position+DOWNRIGHTJUMP, childBoard, friendly, friendlyKing, enemy, enemyKing)) {
            append(jumps, makeJumps(childBoard, friendly, friendlyKing, enemy, enemyKing, position+DOWNRIGHTJUMP));
        } else {
            append(jumps, [childBoard]);
        }
    }
    return jumps;
}

function append(arr1, arr2) {
    var len = arr1.length;
    for (var i = 0; i < arr2.length; i++) {
        arr1[len+i] = arr2[i];
    }
}

function generateChildren(parent, depth) {
    if (depth%2 == 0) {
        var friendly = AI;
        var enemy = HUMAN;
        var friendlyKing = AIKING;
        var enemyKing = HUMANKING;
    } else {
        var friendly = HUMAN;
        var enemy = AI;
        var friendlyKing = HUMANKING;
        var enemyKing = AIKING;
    }
    var board = parent.board;
    var id = 0;
    var jumps = new Array();
    
    for (var i = 0; i < parent.board.length; i++) {
        if (parent.board[i] == friendly || parent.board[i] == friendlyKing) {
            append(jumps, makeJumps(parent.board, friendly, friendlyKing, enemy, enemyKing, i));
        }
    }
    if (jumps.length > 0) {
        parent.children = new Array();
        for (var i = 0; i < jumps.length; i++) {
            parent.children[i] = new node(jumps[i], parent);
        }
    } else {
        var moves = makeMoves(parent, parent.board, friendly, friendlyKing);
        parent.children = moves;
    }
}

function getAiBoard(queue) {
    for (var temp = queue.getMax(); temp.previous.previous != null; temp = temp.previous);
    return temp.board;
}


function AiJump(parent, i, ai, human) {
    var hasJumped = false;
    var board = parent.board;
    if ((((i%8)|0)+((i/8)|0))%2 != 0) {
        if (board[i] == ai || board[i] == ai + 10) {
            if (i+14 < 64 && board[i] != 2) {
                if (board[i+14] == 0) {
                    if (board[i+7] == human || board[i+7] == human+10) {
                        var childBoard = copyBoard(parent.board);
                        if (i+14 >= 64-8 && board[i] < 10) {
                            childBoard[i+14] = ai+10;
                        } else {
                            childBoard[i+14] = board[i];
                        }
                        childBoard[i] = 0;
                        childBoard[i+7] = 0;
                        var len = parent.children.length;
                        parent.children[len] = new node(childBoard, parent);
                        hasJumped = true;
                    }
                }
            }
            if (i+18 < 64 && board[i] != 2) {
                if (board[i+18] == 0) {
                    if (board[i+9] == human || board[i+9] == human+10) {
                        var childBoard = copyBoard(parent.board);
                        if (i+18 >= 64-8 && board[i] < 10) {
                            childBoard[i+18] = ai+10;
                        } else {
                            childBoard[i+18] = board[i];
                        }

                        childBoard[i] = 0;
                        childBoard[i+9] = 0;
                        var len = parent.children.length;
                        parent.children[len] = new node(childBoard, parent);
                        hasJumped = true;
                    }
                }
            }
            if (i-14 > 0 && board[i] != 1) {
                if (board[i-14] == 0) {
                    if (board[i-7] == human || board[i-7] == human+10) {
                        var childBoard = copyBoard(parent.board);
                        if (i-14 <= 7 && board[i] < 10) {
                            childBoard[i-14] = ai+10;
                        } else {
                            childBoard[i-14] = board[i];
                        }

                        childBoard[i] = 0;
                        childBoard[i-7] = 0;
                        var len = parent.children.length;
                        parent.children[len] = new node(childBoard, parent);
                        hasJumped = true;
                    }
                }
            }
            if (i-18 > 0 && board[i] != 1) {
                if (board[i-18] == 0) {

                    if (board[i-9] == human || board[i-9] == human+10) {
                        var childBoard = copyBoard(parent.board);
                        if (i-18 <= 7 && board[i] < 10) {
                            childBoard[i-18] = ai+10;
                        } else {
                            childBoard[i-18] = board[i];
                        }
                        childBoard[i] = 0;
                        childBoard[i-9] = 0;
                        var len = parent.children.length;
                        parent.children[len] = new node(childBoard, parent);
                        hasJumped = true;
                    }
                }
            }
        }
    }

    return hasJumped;
    
}


function getBestChild(parent, depth) {
    var bestChild = parent.children[0];
    for (var i = 1; i < parent.children.length; i++) {
        if (parent.children[i] == null) {
            break;
        }
        if (depth%2 == 0) {
            if (parent.children[i].score > bestChild.score) {
                bestChild = parent.children[i];
            }
        } else {
            if (parent.children[i].score < bestChild.score) {
                bestChild = parent.children[i];
            }
        }
    }
    return bestChild;
}

function prune(parent, depth, j) {
    var count = 0;
    for (var i = j+1; i < parent.children.length; i++) {
        count++;
        parent.children[i] = null;
    }
}

function deepEqual(arr1, arr2) {
    if (arr1.length != arr2.length) {
        return false;
    }
    for (var i = 0; i < arr1.length; i++) {
        if (arr1[i] != arr2[i]) {
            return false;
        }
    }
    return true;
}

function buildTree(parent, depth, maxDepth, parentNodeNumber) {
    if (maxDepth != depth) {
        linkCount++;
        nodeCount++;
        var myLink = linkCount;
        var myNode = nodeCount;
        generateChildren(parent, depth);
        
        if (parent.children.length == 0) {
            parent.score = getScore(parent.board, depth);
            
            return;
        }
        for (var i = 0; i < parent.children.length; i++) {
            buildTree(parent.children[i], depth+1, maxDepth, myNode);

            if (i == 0) {
                parent.score = parent.children[i].score;
            } else {
                if (depth%2 == 0) {
                    if (parent.children[i].score > parent.score) {
                        parent.score = parent.children[i].score;
                    }
                } else {
                    if (parent.children[i].score < parent.score) {
                        parent.score = parent.children[i].score;
                    }
                }
            }
        }
        
        var val = 15;
        if (parent.score == 1) {
            val = 40;
        } else if (parent.score == -1) {
            val = 1;
        }
        if (parentNodeNumber == -1) {

            link_str = '{"source":0,"target":0,"value":'+val+'}'+link_str;
            node_str = '{"name":"Root","group":0}'+node_str;
        } else {
            link_str = ',{"source":'+myLink+',"target":'+parentNodeNumber+',"value":'+val+'}'+link_str;
            node_str = ',{"name":"Branch","group":'+myNode+'}'+node_str;
        }
    } else {
        parent.score = getScore(parent.board, depth);
        linkCount++;
        nodeCount++;
        var val = 15;
        if (parent.score == 1) {
            val = 40;
        } else if (parent.score == -1) {
            val = 1;
        }
        link_str = ',{"source":'+linkCount+',"target":'+parentNodeNumber+',"value":'+val+'}'+link_str;
        node_str = ',{"name":"Leaf","group":'+nodeCount+'}'+node_str;
    }
}

function testForJumps(board) {
    var tempRoot = new node(board, null);
    var children = new Array();
    for (var i = 0; i < board.length; i++) {
        if (board[i] == AI || board[i] == AIKING) {
            children = makeRecordedJumps(tempRoot, AI, AIKING, HUMAN, HUMANKING, i, children);
        }
    }
    return children;
}

function makeRecordedJumps(parent, friendly, friendlyKing, enemy, enemyKing, position, children) {
    var parentBoard = parent.board;
    
    if (canJumpUpLeft(position, parentBoard, friendly, friendlyKing, enemy, enemyKing)) {
        var childBoard = copyBoard(parentBoard);
        jumpUpLeft(childBoard, position);
        var child = new node(childBoard, parent);
        parent.children[parent.children.length] = child;
        if (canJump(position+UPLEFTJUMP, childBoard, friendly, friendlyKing, enemy, enemyKing)) {
            makeRecordedJumps(child, friendly, friendlyKing, enemy, enemyKing, position+UPLEFTJUMP, children);
        } else {
            children[children.length] = child;
        }
    }
    if (canJumpUpRight(position, parentBoard, friendly, friendlyKing, enemy, enemyKing)) {
        var childBoard = copyBoard(parentBoard);
        jumpUpRight(childBoard, position);
        var child = new node(childBoard, parent);
        parent.children[parent.children.length] = child;
        if (canJump(position+UPRIGHTJUMP, childBoard, friendly, friendlyKing, enemy, enemyKing)) {
            makeRecordedJumps(child, friendly, friendlyKing, enemy, enemyKing, position+UPRIGHTJUMP, children);
        } else {
            children[children.length] = child;
        }
    }
    if (canJumpDownLeft(position, parentBoard, friendly, friendlyKing, enemy, enemyKing)) {
        var childBoard = copyBoard(parentBoard);
        jumpDownLeft(childBoard, position);
        var child = new node(childBoard, parent);
        parent.children[parent.children.length] = child;
        if (canJump(position+DOWNLEFTJUMP, childBoard, friendly, friendlyKing, enemy, enemyKing)) {
            makeRecordedJumps(child, friendly, friendlyKing, enemy, enemyKing, position+DOWNLEFTJUMP, children);
        } else {
            children[children.length] = child;
        }
    }
    if (canJumpDownRight(position, parentBoard, friendly, friendlyKing, enemy, enemyKing)) {
        var childBoard = copyBoard(parentBoard);
        jumpDownRight(childBoard, position);
        var child = new node(childBoard, parent);
        parent.children[parent.children.length] = child;
        if (canJump(position+DOWNRIGHTJUMP, childBoard, friendly, friendlyKing, enemy, enemyKing)) {
            makeRecordedJumps(child, friendly, friendlyKing, enemy, enemyKing, position+DOWNRIGHTJUMP, children);
        } else {
            children[children.length] = child;
        }
    }
    return children;
}

function makeAiMove() {
    node_str = '';
    link_str = '';
    linkCount = -1;
    nodeCount = -1;
    var maxDepth = 6;
    var rootNode = new node(board, null);
    node_str += '],';
    link_str += ']}';
    
    buildTree(rootNode, 0, maxDepth, -1);
    
    link_str = '"links":['+link_str;
    node_str = '{"nodes":['+node_str;
    
    // if (getBestChild(rootNode, 0) == null) {
    //     alert("Stalemate!");
    // }

    jumps = testForJumps(board);
    
    board = getBestChild(rootNode, 0).board;

    var jumpSteps = new Array();
    if (jumps.length > 0) {
        for (var i = 0; i < jumps.length; i++) {
            if (deepEqual(board, jumps[i].board)) {
                var tempNode = jumps[i];
                while (tempNode.parent != null) {
                    jumpSteps[jumpSteps.length] = tempNode.board;
                    tempNode = tempNode.parent;
                }
                break;
            }
        }
    }
    if (jumpSteps.length > 1) {
        var i = jumpSteps.length-1;
        function loop() {
            
            board = jumpSteps[i];
            paintWholeBoard();
            i--;

            if (i >= 0){
                setTimeout(loop, 1000);
            }
        }
        loop();
    }
        paintWholeBoard();
}

// sleep time expects milliseconds
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
