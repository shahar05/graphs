package main

import (
	"fmt"
	"math/rand"
	"time"
)

type Color int

const (
	White Color = 1
	Gray  Color = 2
	Black Color = 3
)

const MaxInt = int(^uint(0) >> 1)
const Infinity = MaxInt

type Vertex struct {
	key       int
	adjacent  map[int]*Vertex
	visited   bool
	parent    *Vertex
	color     Color
	distance  int
	startTime int
	endTime   int
}

type Node struct {
	vertex *Vertex
	next   *Node
}

type LinkedList struct {
	head *Node
	tail *Node
	size int
}

type Queue struct {
	vertices []*Vertex
	size     int
}

type Edge struct {
	from   int
	to     int
	weight int
}

type Graph struct {
	vertices   map[int]*Vertex
	edges      map[int]map[int]*Edge
	isDirected bool
}

func NewLinkedList() *LinkedList {
	return &LinkedList{
		head: nil,
		tail: nil,
		size: 0,
	}
}

func NewQueue(capacity int) *Queue {
	return &Queue{
		vertices: make([]*Vertex, 0, capacity),
		size:     0,
	}
}

func NewEdge(from, to, weight int) *Edge {
	return &Edge{
		from:   from,
		to:     to,
		weight: weight,
	}
}

func NewVertex(key int) *Vertex {
	return &Vertex{
		key:      key,
		adjacent: map[int]*Vertex{},
		visited:  false,
		parent:   nil,
		color:    White,
		distance: Infinity,
	}
}

func NewDirectedGraph() *Graph {
	return &Graph{
		vertices:   map[int]*Vertex{},
		edges:      map[int]map[int]*Edge{},
		isDirected: true,
	}
}

func NewNode(v *Vertex) *Node {
	return &Node{
		vertex: v,
		next:   nil,
	}
}

func (l *LinkedList) insert(v *Vertex) {
	l.size++
	// head is Special case
	if l.head == nil {
		l.head = NewNode(v)
		return
	}
	node := NewNode(v)
	node.next = l.head
	l.head = node
}

func buildLinkedList(vertices map[int]*Vertex) *LinkedList {
	ll := NewLinkedList()
	for _, v := range vertices {
		ll.insert(v)
	}
	return ll
}

func (l *LinkedList) extractMin() *Vertex {
	if l.size == 0 {
		return nil
	}

	if l.size == 1 {
		temp := l.head.vertex
		l.head = nil
		l.size--
		return temp
	}

	l.size--

	current := l.head
	minV := l.head.vertex

	//find min
	for current != nil {
		if minV.distance > current.vertex.distance {
			minV = current.vertex
		}
		current = current.next
	}

	// special case if it's head & has more items
	if minV.key == l.head.vertex.key {
		l.head = l.head.next
	}

	current = l.head

	// stop one step before node to delete
	for current.next != nil && current.next.vertex.key != minV.key {
		current = current.next
	}

	// delete node from middle or end
	if current.next != nil {
		current.next = current.next.next
	}

	return minV
}

func NewUndirectedGraph() *Graph {
	return &Graph{
		vertices: map[int]*Vertex{},
		edges:    map[int]map[int]*Edge{},
	}
}

func (q *Queue) Enqueue() {

}

func (q *Queue) Dequeue() {

}

func (g *Graph) AddVertex(key int) error {
	_, exists := g.vertices[key]

	if exists {
		return fmt.Errorf("Vertex %v is already exists", key)
	}

	g.vertices[key] = NewVertex(key)
	return nil
}

func (g *Graph) AddEdge(from, to, weight int) error {

	if from == to {
		return fmt.Errorf("vertex cannot connect to itself")
	}

	fromVetrex := g.vertices[from]
	toVetrex := g.vertices[to]

	// return an error if one of the vertices doesn't exist
	if fromVetrex == nil || toVetrex == nil {
		return fmt.Errorf("not all vertices exist")
	}

	// do nothing if the vertices are already connected
	if _, ok := fromVetrex.adjacent[to]; ok {
		return fmt.Errorf("edge are already connected")
	}

	// *allocate new map if the is adjacent to this vertex yet
	if g.edges[from] == nil {
		g.edges[from] = map[int]*Edge{}
	}

	g.edges[from][to] = NewEdge(from, to, weight)

	fromVetrex.adjacent[to] = toVetrex

	if !g.isDirected { // !isDirected ==> Add opposite Edge

		if g.edges[to] == nil { // *same
			g.edges[to] = map[int]*Edge{}
		}

		g.edges[to][from] = NewEdge(to, from, weight)
		toVetrex.adjacent[from] = fromVetrex
	}

	return nil
}

func (fromVertex *Vertex) PrintEdge(toVertex *Vertex) {
	if fromVertex == nil || toVertex == nil || fromVertex.adjacent[toVertex.key] == nil {
		return
	}

	from, to := fromVertex.key, toVertex.key

	if toVertex.isBidirectional(fromVertex) {
		fmt.Printf(" (%2v) <---> (%2v) \n", from, to)
	} else {
		fmt.Printf(" (%2v) ----> (%2v) \n", from, to)
	}
}

func (v1 *Vertex) isBidirectional(v2 *Vertex) bool {
	if v1 == nil || v2 == nil {
		return false // should return err
	}

	if v1.adjacent[v2.key] == nil {
		return false
	}

	return v1.adjacent[v2.key].key == v2.key

}

func (g *Graph) PrintGraph() {
	for _, v := range g.vertices {
		v.visited = false
	}

	for _, fromVertex := range g.vertices {
		fromVertex.visited = true
		for _, toVertex := range fromVertex.adjacent {
			if !toVertex.visited || !toVertex.isBidirectional(fromVertex) {
				fromVertex.PrintEdge(toVertex)
			}
		}
	}
}

func (g *Graph) findOppositeEdge(e *Edge) *Edge {
	from, to := e.from, e.to
	if g.edges[to] == nil {
		return nil
	}

	return g.edges[to][from]

}

func (e *Edge) PrintEdge(isBidirectional bool, g *Graph) {
	if !isBidirectional {
		fmt.Printf(" (%2v) ---{%2v}---> (%2v) \n", e.from, e.weight, e.to)
		return
	}

	o := g.findOppositeEdge(e)
	fmt.Printf("\n")
	fmt.Printf("   --- {%2v} ---> \n", e.weight)
	fmt.Printf("(%2v)          (%2v)\n", e.from, e.to)
	fmt.Printf("   <--- {%2v} --- \n", o.weight)
	fmt.Printf("\n")
}

func (g *Graph) PrintGraphEdges() {

	for _, v := range g.vertices {
		v.visited = false
	}

	for from, adjacent := range g.edges { // adjacent is a map that
		fromV := g.vertices[from]
		fromV.visited = true
		for to, e := range adjacent {
			toV := g.vertices[to]
			if !toV.visited || !toV.isBidirectional(fromV) {
				e.PrintEdge(toV.isBidirectional(fromV), g)
			}
		}
	}
}

func generateGraph() *Graph {
	s1 := rand.NewSource(time.Now().UnixNano())
	r1 := rand.New(s1)
	g := NewDirectedGraph()
	vLen := 10
	eLen := 30
	for i := 0; i < vLen; i++ {
		g.AddVertex(i)
	}

	for i := 0; i < eLen; i++ {
		from, to, weight := r1.Intn(vLen), r1.Intn(vLen), r1.Intn(100)
		err := g.AddEdge(from, to, weight)
		if err == nil {
			fmt.Printf(" (%2v) ---{%2v}---> (%2v) \n", from, weight, to)
		}
	}
	println("End print creation")
	return g
}

func (v *Vertex) printPath() {
	temp := v
	for temp.parent != nil {
		fmt.Printf(" {Key: %v} <--", temp.key)
		temp = temp.parent
	}
	fmt.Printf(" { Key: 0 } \n")
}

func (v *Vertex) printVertex() {
	fmt.Printf(" (Vertex: %v) \n", v.key)
	var pKey int = -999
	if v.parent != nil {
		pKey = v.parent.key
	}
	v.printPath()
	fmt.Printf(" {\n color: %v \n parent: %v \n distance: %v \n}\n \n", v.color, pKey, v.distance)
}

func (v *Vertex) printDFSVertex() {
	fmt.Printf(" (Vertex: %v) \n", v.key)
	var pKey int = -999
	if v.parent != nil {
		pKey = v.parent.key
	}

	fmt.Printf(" {\n color: %v \n parent: %v \n startTime: %v \n endTIme: %v \n}\n \n", v.color, pKey, v.startTime, v.endTime)
}

func (g *Graph) prepareToBFS(sKey int) (*Vertex, error) {
	for _, v := range g.vertices {
		v.color = White
		v.distance = Infinity
		v.parent = nil
	}
	s := g.vertices[sKey]
	if s == nil {
		return nil, fmt.Errorf("the start vertex key isn't belong to the vertices graph")
	}
	s.color = Gray
	s.distance = 0
	s.parent = nil
	return s, nil
}

func (g *Graph) BFS(s *Vertex) {
	queue := make([]*Vertex, 0, len(g.vertices))
	queue = append(queue, s)

	for len(queue) != 0 {
		u := queue[0]
		queue = queue[1:] // Dequeue
		for _, v := range u.adjacent {
			if v.color == White {
				v.color = Gray
				v.distance = u.distance + 1
				v.parent = u
				queue = append(queue, v) // Enqueue V
			}
		}
		u.color = Black
	}
}

func (g *Graph) printBFSTree() {
	fmt.Println("printBFSTree")
	for _, v := range g.vertices {
		v.printVertex()
	}
}

func (g *Graph) printDFSTree() {
	fmt.Println("printDFSTree")
	for _, v := range g.vertices {
		v.printDFSVertex()
	}
}

func testBFS(g *Graph) {
	s, err := g.prepareToBFS(1)
	if err != nil {
		return
	}
	g.BFS(s)
}

func DFSVisit(u *Vertex, time *int) {
	u.color = Gray
	*time++
	u.startTime = *time

	for _, v := range u.adjacent {
		if v.color == White {
			v.parent = u
			DFSVisit(v, time)
		}
	}

	u.color = Black
	*time++
	u.endTime = *time
}

func (g *Graph) DFS() {
	time := 0
	for _, u := range g.vertices {
		if u.color == White {
			DFSVisit(u, &time)
		}
	}
}

func (g *Graph) ResetVertices() {
	for _, v := range g.vertices {
		v.color = White
		v.distance = Infinity
		v.parent = nil
		v.visited = false
	}
}

func findNotInfVertex(vertices []*Vertex) (*Vertex, int) {
	for index, v := range vertices {
		if v.distance != Infinity {
			return v, index
		}
	}
	return nil, -1
}

func remove(slice []*Vertex, i int) []*Vertex {
	return append(slice[:i], slice[i+1:]...)
}

func (g *Graph) printVertices() {
	for _, v := range g.vertices {
		v.printVertex()
	}
}

func intersect(adjacent map[int]*Vertex, ll *LinkedList) []*Vertex {
	intersection := make([]*Vertex, 0, ll.size) // TODO: get min len(verticesInQ) - len(adjacent)
	curNode := ll.head
	for curNode != nil {
		if _, found := adjacent[curNode.vertex.key]; found {
			intersection = append(intersection, curNode.vertex)
		}
		curNode = curNode.next
	}
	return intersection
}

func createQueue(vertices map[int]*Vertex) []*Vertex {
	q := make([]*Vertex, 0, len(vertices))
	for _, v := range vertices {
		q = append(q, v)
	}
	return q
}

func (g *Graph) w(u, v *Vertex) int {
	return g.edges[u.key][v.key].weight
}

func sum(a, b int) int {
	if a == Infinity || b == Infinity {
		return Infinity
	}
	return a + b
}

func (g *Graph) Dijkstra(s *Vertex) {
	g.ResetVertices()
	linkedList := buildLinkedList(g.vertices)//Use Heap
	s.distance = 0

	for linkedList.size != 0 {
		u := linkedList.extractMin()
		if u == nil || u.distance == Infinity {
			break
		}

		for _, v := range u.adjacent {
			if !v.visited && v.distance > sum(u.distance, g.w(u, v)) {
				v.distance = u.distance + g.w(u, v)
				v.parent = u
			}
		}
		u.visited = true
	}
}

func main() {
	g := generateGraph()
	fmt.Println("\n-------------PrintGraph & Weight-------------")
	g.PrintGraphEdges()
	fmt.Println("\n-------------PrintGraph-------------")
	g.PrintGraph()
	fmt.Println("\n-------------Chosen-------------")
	g.vertices[0].printVertex()
	fmt.Println("\n-------------Chosen-------------")
	g.Dijkstra(g.vertices[0])
	g.printVertices()
}

// func intersect(adjacent map[int]*Vertex, verticesInQ []*Vertex) []*Vertex {
// 	intersection := make([]*Vertex, 0, len(verticesInQ)) // TODO: get min len(verticesInQ) - len(adjacent)
// 	for _, v := range verticesInQ {
// 		if _, found := adjacent[v.key]; found {
// 			intersection = append(intersection, v)
// 		}
// 	}
// 	return intersection
// }
