package main

import (
	"fmt"
)

func main() {
	a := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	fmt.Println(a)
	b := append(a[:1], a[1:]...)
	a[1] = 23
	fmt.Println(b)
	fmt.Println(a[:1])

	a[2] = 82
	a[9] = 45

	b = append(b, 83)
	a = append(a, 76)
	a[2] = 67
	a[10] = 99
	fmt.Printf("Capacity A: %v \n", cap(a))
	fmt.Printf("Length A: %v \n", len(a))
	fmt.Printf("Capacity B: %v \n", cap(b))
	fmt.Printf("Length B: %v \n", len(b))
}
