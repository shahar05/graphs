 /**
  * https://observablehq.com/@bjedwards/multi-line-chart-d3-v6
  */
 
 // we have to break out the svg and the group we are appending to it because Observable needs to 
  // return the svg.node(). 
  const svg = d3.create("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
  
  const svgg = svg.append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
  
  
  // Not much changes here with the original function
  // group makes it a little easier, just pass the data and a function that
  // tells you how to get each key. Instead of returning a nest object it returns
  // a javascript Map. We can still iterate over maps as we'll see in a bit.
  //var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
  //  .key(function(d) { return d.name;})
  //  .entries(data);

  var sumstat = d3.group(data, d => d.name);
  
  // Add X axis --> it is a date format
  var x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.year))
    .range([ 0, width ]);
  svgg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(5));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, d3.max(data, d => +d.n)])
    .range([ height, 0 ]);
  svgg.append("g")
    .call(d3.axisLeft(y));
  
  // color palette
  var res = Array.from(sumstat.keys()); // list of group names
  var color = d3.scaleOrdinal()
    .domain(res)
    .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])
  
  // This is where things change a bit. First rather than use the append().enter() pattern we're going
  // to use the new 'join' pattern, it's a bit cleaner. Next all we have to realize is that instead of 
  // getting an array of objects have a `key` and `values` properties, it's going to be a length two 
  // array with the key being the first entry and the rest of the data as the second.
  svgg.selectAll("path")
    .data(sumstat)
    .join("path")
      .attr('fill', 'none')
      .attr('stroke-width', 1.5)
      .attr('stroke', d => color(d[0]))
      .attr("d", d => {
           return d3.line()
             .x(d => x(d.year))
             .y(d => y(+d.n))
             (d[1])
         });
  return(svg.node()); 

}