package main

import (
	"fmt"
	"math/rand"
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
	foundVertex, ok := g.vertices[key]
	if !ok {
		return fmt.Errorf("Vertex %v is already exists", key)
	}

	g.vertices[key] = foundVertex
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
	if _, ok := g.edges[from]; !ok {
		return fmt.Errorf("this edge already exists")
	}

	g.edges[from] = NewEdge(1, fromVertex, toVertex)

	if !g.isDirected {
		g.edges[from] = NewEdge(1, toVertex, fromVertex)
	}

	return nil
}

func (g *Graph) Print() {
	for _, edge := range g.edges {
		fmt.Printf(" (%v) ---> (%v) \n", edge.fromVertex.key, edge.toVertex.key)
	}
}

func main() {

	graph := NewGraph(true)

	for i := 0; i < 20; i++ {
		err := graph.AddVertex(i)
		if err != nil {
			fmt.Println(err)
		}
	}

	for i := 0; i < 10; i++ {
		err := graph.AddEdge(rand.Intn(20), rand.Intn(20))
		if err != nil {
			fmt.Println(err)
		}
	}

	graph.Print()

}
