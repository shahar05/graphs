package main

import (
	"fmt"
	"math/rand"
	"sort"
	"time"
)

type Vertex struct {
	key int
}

type Edge struct {
	weight     int
	fromVertex *Vertex
	toVertex   *Vertex
}

type Graph struct {
	vertices   map[int]*Vertex
	edges      map[int]*Edge
	isDirected bool
}

func NewGraph(isDirected bool) *Graph {
	return &Graph{
		vertices:   map[int]*Vertex{},
		edges:      map[int]*Edge{},
		isDirected: isDirected,
	}
}

func NewEdge(weight int, fromVertex, toVertex *Vertex) *Edge {
	return &Edge{
		weight:     weight,
		fromVertex: fromVertex,
		toVertex:   toVertex,
	}
}

func NewVertex(key int) *Vertex {
	return &Vertex{
		key: key,
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
		return fmt.Errorf("edge cannot have same value")
	}

	fromVertex, fromFound := g.vertices[from]
	toVertex, toFound := g.vertices[to]

	if !fromFound || !toFound {
		fmt.Printf("{\nfromFound: %v,\ntoFound: %v\n}\n", fromFound, toFound)
		return fmt.Errorf("cannot add Edge because vertex to: %v OR  vertex from: %v are missing", to, from)
	}

	//Check if edge exists
	foundEdge, edgeExists := g.edges[from]
	if edgeExists && foundEdge.toVertex.key == to {
		return fmt.Errorf("this edge already exists")
	}

	g.edges[from] = NewEdge(1, fromVertex, toVertex)

	if !g.isDirected {
		g.edges[to] = NewEdge(1, toVertex, fromVertex)
	}

	return nil
}

func (e *Edge) PrintTowDirectionEdge() {
	fmt.Printf(" (%v) <---> (%v) \n", e.fromVertex.key, e.toVertex.key)
}

func copyMap(originalMap map[int]*Edge) map[int]Edge {
	CopiedMap := make(map[int]Edge)
	for key, value := range originalMap {
		CopiedMap[key] = *value
	}
	return CopiedMap
}

func (e *Edge) PrintEdge() {
	fmt.Printf(" (%v) ---> (%v) \n", e.fromVertex.key, e.toVertex.key)
}

func (g *Graph) edgeHasTwoDirections(e *Edge) (bool, error) {
	if e == nil {
		return false, fmt.Errorf("Edge is null")
	}

	if !g.isDirected {
		return true, nil
	}

	return g.edges[e.toVertex.key].toVertex == e.fromVertex, nil

}

//from := e.fromVertex.key
// to := e.toVertex.key
//hasFromTo := g.edges[from]
// fromToVertex := g.edges[from]
// toFromVertex := g.edges[to]
// hasToFrom :=

func (g *Graph) PrintGraph() {
	fmt.Println("Start printing")

	edges := copyMap(g.edges)

	for _, edge := range edges {
		// Check if there is from to & to from
		if g.edgeHasTwoDirections() {
			oppositeEdge.PrintTowDirectionEdge()
			//delete(edges, fromVertex)
		} else {
			edge.PrintEdge()
		}

	}
}

func getEdgesAsSlice(edgesMap map[int]*Edge) []Edge {
	edges := make([]Edge, 0, len(edgesMap))
	for _, e := range edgesMap {
		edges = append(edges, *NewEdge(e.weight, e.fromVertex, e.toVertex))
	}
	return edges
}

func (g *Graph) PrintSortedGraph() {
	fmt.Println("Start printing")
	edges := getEdgesAsSlice(g.edges)
	sort.SliceStable(edges, func(i, j int) bool { return edges[i].fromVertex.key < edges[j].fromVertex.key })
	//numOfEdges := len(edges)
	for _, edge := range edges {
		// if !g.isDirected && numOfEdges/2 == i {
		// 	break
		// }

		// if !g.isDirected {
		// 	g.edges[edge.toVertex.key].PrintEdge()
		// }

		edge.PrintEdge()
	}
}

func main() {
	createDemoGraph()
}

func createDemoGraph() {
	s1 := rand.NewSource(time.Now().UnixNano())
	r1 := rand.New(s1)
	graph := NewGraph(true)

	for i := 0; i < 20; i++ {
		err := graph.AddVertex(i)
		if err != nil {
			fmt.Println(err)
		}
	}

	for i := 0; i < 10; i++ {
		v1, v2 := r1.Intn(20), r1.Intn(20)
		err := graph.AddEdge(v1, v2)
		if err != nil {
			fmt.Printf(" (%v) ---> (%v) |  ", v1, v2)
			fmt.Println(err)
		}
	}

	graph.PrintGraph()
	fmt.Println("-----------------------")
	//graph.PrintSortedGraph()
}
