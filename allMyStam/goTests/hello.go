package main

import (
	"fmt"
	"time"
)

func main() {
	time := time.Now()

	fmt.Printf("%+v", time)
	fmt.Printf("%+v", time.Hour)
	// fmt.Printf("%+v", time.April)
	// fmt.Printf("%+v", time.Kitchen)
	fmt.Printf("%+v", time.Month)
	// fmt.Printf("%+v", time.Date())
}
