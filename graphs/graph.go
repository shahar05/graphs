package main

import "fmt"

// EDGE:
// weight
// length
// traffic
// numOfLanes - netivim ~~ Capacity

type Vertex struct {
	key      int
	Adjacent map[int]*Vertex
}

func NewVertex(key int) *Vertex {
	return &Vertex{
		key:      key,
		Adjacent: map[int]*Vertex{},
	}
}

type Graph struct {
	Vertices        map[int]*Vertex
	isDirectedGraph bool
}

func NewDirectedGraph() *Graph {
	return &Graph{
		Vertices:        map[int]*Vertex{},
		isDirectedGraph: true,
	}
}

func NewUndirectedGraph() *Graph {
	return &Graph{
		Vertices: map[int]*Vertex{},
	}
}

func (g *Graph) AddVertex(key int) error {
	v := NewVertex(key)
	_, ok := g.Vertices[key]
	if ok {
		g.Vertices[key] = v
		return nil
	}

	return fmt.Errorf("this vertex exists")
}

func (g *Graph) AddEdge(from, to int) error {
	fromVertice := g.Vertices[from]
	toVertice := g.Vertices[to]

	if fromVertice == nil || toVertice == nil {
		return fmt.Errorf("not all vertices exists | from: %d , to: %d \n", from, to)
	}

	// do nothing if the vertices are already connected
	if _, ok := fromVertice.Adjacent[to]; ok {
		return fmt.Errorf("This vertice is already exists")
	}

	// Add a directed edge between v1 and v2
	// If the graph is undirected, add a corresponding
	// edge back from v2 to v1, effectively making the
	// edge between v1 and v2 bidirectional

	fromVertice.Adjacent[to] = toVertice

	if !g.isDirectedGraph && from != to {
		toVertice.Adjacent[from] = fromVertice //TODO: create add Edge function
	}

	// Add the vertices to the graph's vertex map
	g.Vertices[from] = fromVertice
	g.Vertices[to] = toVertice
}

func main() {
	fmt.Println("Hello, world.")
}
