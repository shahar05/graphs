package main

import "fmt"

type Heap struct {
	arr  []int
	size int
}

func NewHeap(capacity int) *Heap {
	return &Heap{
		arr:  make([]int, 0, capacity),
		size: 0,
	}
}

// Left
func getLeftChildIndex(i int) int {
	return 2*i + 1
}

func (h *Heap) hasLeftChild(i int) bool {
	return getLeftChildIndex(i) < h.size
}

func (h *Heap) leftChild(i int) int {
	//TODO: check if has
	return h.arr[getLeftChildIndex(i)]
}

// Right
func getRightChildIndex(i int) int {
	return 2*i + 2
}

func (h *Heap) hasRightChild(i int) bool {
	return getRightChildIndex(i) < h.size
}

func (h *Heap) rightChild(i int) int {
	//TODO: check if has
	return h.arr[getRightChildIndex(i)]
}

// Parent
func getParentIndex(i int) int {
	return (i - 1) / 2
}

func hasParent(i int) bool {
	return getParentIndex(i) >= 0
}

func (h *Heap) parent(i int) int {
	//TODO: check if has
	return h.arr[getParentIndex(i)]
}

func (h *Heap) swap(i, j int) {
	temp := h.arr[i]
	h.arr[i] = h.arr[j]
	h.arr[j] = temp
}

func (h *Heap) peek() (int, error) {
	if h.size == 0 {
		return 0, fmt.Errorf("no items in the heap")
	}
	return h.arr[0], nil
}

func (h *Heap) getSmallerChildIndex(i int) int {
	smallerChildIndex := getLeftChildIndex(i)
	if h.hasRightChild(i) && h.rightChild(i) < h.leftChild(i) {
		smallerChildIndex = getRightChildIndex(i)
	}
	return smallerChildIndex
}

func (h *Heap) heapifyDown(i int) {
	for h.hasLeftChild(i) {
		smallerChildIndex := h.getSmallerChildIndex(i)
		if h.arr[i] < h.arr[smallerChildIndex] {
			break
		}
		h.swap(i, smallerChildIndex)
		i = smallerChildIndex
	}
}

func (h *Heap) heapifyUp(i int) {
	for hasParent(i) && h.parent(i) > h.arr[i] {
		h.swap(getParentIndex(i), i)
		i = getParentIndex(i)
	}
}

func (h *Heap) extract() (int, error) {
	if h.size == 0 {
		return 0, fmt.Errorf("no items in the heap")
	}
	item := h.arr[0]
	h.arr[0] = h.arr[h.size-1]
	h.size--
	h.heapifyDown(0)
	return item, nil
}

func (h *Heap) add(item int) {
	h.arr = append(h.arr, item)
	h.size++
	h.heapifyUp(h.size - 1)
}

func (h *Heap) buildMinHeap() {
	for index := ((h.size / 2) - 1); index >= 0; index-- {
		h.heapifyDown(index)
	}
}

func main() {
	inputArray := []int{6, 5, 3, 7, 2, 8}
	minHeap := NewHeap(len(inputArray))
	minHeap.arr = inputArray
	minHeap.size = len(minHeap.arr)

	minHeap.buildMinHeap()

	for i := 0; i < len(inputArray); i++ {
		fmt.Println(minHeap.extract())
	}

}
