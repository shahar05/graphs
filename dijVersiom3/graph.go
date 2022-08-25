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
	edges      map[int]map[int]*Edge
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
		edges:      map[int]map[int]*Edge{},
		isDirected: true,
	}
}

func NewUndirectedGraph() *Graph {
	return &Graph{
		vertices: map[int]*Vertex{},
		edges:    map[int]map[int]*Edge{},
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

	if g.edges[from] == nil {
		g.edges[from] = map[int]*Edge{}
	}

	g.edges[from][to] = NewEdge(from, to, weight)
	fromVetrex.adjacent[to] = toVetrex
	if !g.isDirected {
		if g.edges[to] == nil {
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
	vLen := 5
	eLen := 10
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
	fmt.Println("\n-------------PrintGraph & Weight-------------")
	g.PrintGraphEdges()
	fmt.Println("\n-------------PrintGraph-------------")
	g.PrintGraph()
}
