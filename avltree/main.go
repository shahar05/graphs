// package main

// import "fmt"

// type Node struct {
// 	value  int
// 	height int
// 	right  *Node
// 	left   *Node
// }

// func newNode(value int) *Node {
// 	return &Node{
// 		value:  value,
// 		left:   nil,
// 		right:  nil,
// 		height: 1,
// 	}
// }

// func getMax(a, b int) int {
// 	if a > b {
// 		return a
// 	}
// 	return b
// }

// func getHeight(n *Node) int {
// 	if n == nil {
// 		return 0
// 	}
// 	return n.height
// }

// func getBalance(n *Node) int {
// 	if n == nil {
// 		return 0
// 	}
// 	return getHeight(n.left) - getHeight(n.right)
// }

// func (y *Node) rotateRight() *Node {
// 	x := y.left
// 	T2 := x.right
// 	x.right = y
// 	y.left = T2

// 	y.height = getMax(getHeight(y.left), getHeight(y.right)) + 1
// 	x.height = getMax(getHeight(x.left), getHeight(x.right)) + 1

// 	return x
// }

// func (x *Node) rotateLeft() *Node {
// 	y := x.right
// 	T2 := y.left

// 	y.left = x
// 	x.right = T2

// 	x.height = getMax(getHeight(x.left), getHeight(x.right)) + 1
// 	y.height = getMax(getHeight(y.left), getHeight(y.right)) + 1

// 	return x
// }

// func insertNode(n *Node, value int) *Node {
// 	if n == nil {
// 		return newNode(value)
// 	}

// 	if value < n.value {
// 		n.left = insertNode(n.left, value)
// 	} else if value > n.value {
// 		n.right = insertNode(n.right, value)
// 	} else {
// 		return n
// 	}

// 	n.height = 1 + getMax(getHeight(n.left), getHeight(n.right))

// 	balance := getBalance(n)

// 	if balance > 1 && value < n.left.value {
// 		return n.rotateRight()
// 	}

// 	if balance > 1 && value > n.left.value {
// 		n.left = n.left.rotateLeft()
// 		return n.rotateRight()
// 	}

// 	if balance < -1 && value > n.right.value {
// 		return n.rotateLeft()
// 	}

// 	if balance < -1 && value < n.right.value {
// 		n.right = n.right.rotateRight()
// 		return n.rotateLeft()
// 	}

// 	return n
// }

// func printInOrder(n *Node) {
// 	if n != nil {
// 		fmt.Printf("%v ", n.value)
// 		printInOrder(n.left)
// 		printInOrder(n.right)
// 	}
// }

// func main() {
// 	root := insertNode(nil, 2)
// 	root = insertNode(root, 1)
// 	root = insertNode(root, 7)
// 	root = insertNode(root, 4)
// 	root = insertNode(root, 5)
// 	root = insertNode(root, 3)
// 	root = insertNode(root, 8)

// 	printInOrder(root)
// }
