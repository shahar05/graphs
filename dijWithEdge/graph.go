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

const Infinity = -1

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

type Edge struct {
	from   int
	to     int
	weight int
}

type Graph struct {
	vertices   map[int]*Vertex
	isDirected bool
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
		isDirected: true,
	}
}

func NewUndirectedGraph() *Graph {
	return &Graph{
		vertices: map[int]*Vertex{},
	}
}

func (g *Graph) AddVertex(key int) error {
	_, exists := g.vertices[key]

	if exists {
		return fmt.Errorf("Vertex %v is already exists", key)
	}

	g.vertices[key] = NewVertex(key)
	return nil
}

func (g *Graph) AddEdge(from, to int) error {
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

	// Add a directed edge between v1 and v2
	// If the graph is undirected, add a corresponding
	// edge back from v2 to v1, effectively making the
	// edge between v1 and v2 bidirectional
	fromVetrex.adjacent[to] = toVetrex
	if !g.isDirected {
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
	for _, fromVertex := range g.vertices {
		fromVertex.visited = true
		for _, toVertex := range fromVertex.adjacent {
			if !toVertex.visited || !toVertex.isBidirectional(fromVertex) {
				fromVertex.PrintEdge(toVertex)
			}
		}
	}
}

func generateGraph() *Graph {
	s1 := rand.NewSource(time.Now().UnixNano())
	r1 := rand.New(s1)

	g := NewDirectedGraph()

	for i := 0; i < 10; i++ {
		g.AddVertex(i)
	}

	for i := 0; i < 30; i++ {
		from, to := r1.Intn(10), r1.Intn(10)
		g.AddEdge(from, to)
	}

	g.PrintGraph()

	return g
}

func (v *Vertex) printVertex() {
	fmt.Printf(" (Vertex: %v) \n", v.key)
	var pKey int = -999
	if v.parent != nil {
		pKey = v.parent.key
	}

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

func main() {
	g := generateGraph()
	//testBFS(g)
	g.DFS()
	g.printDFSTree()

}

/*
// here, we import the graph we defined in the previous section as the `graph` package
func (g *Graph) DFS(startVertex *Vertex, visitCb func(int)) {
	// we maintain a map of visited nodes to prevent visiting the same
	// node more than once
	visited := map[int]bool{}

	if startVertex == nil {
		return
	}

	startVertex.printVertex()

	visited[startVertex.key] = true
	visitCb(startVertex.key)

	// for each of the adjacent vertices, call the function recursively
	// if it hasn't yet been visited
	for _, v := range startVertex.adjacent {
		if visited[v.key] {
			continue
		}
		g.DFS(v, visitCb)
	}
}


func testDFS(g *Graph) {
	visitedOrder := []int{}
	g.DFS(g.vertices[1], func(i int) {
		visitedOrder = append(visitedOrder, i)
	})
}
*/
