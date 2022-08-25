import { HttpClient } from '@angular/common/http';
import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { MetricsResponse, TimeSeriesEntity } from '@infinipoint/infp-graph/@types';
import { select, scaleLinear, max, scaleBand, extent, axisLeft, axisBottom, curveBasis, line, scaleTime, min, selectAll } from 'd3';
import { ScaleTime } from 'd3-scale'
//import("d3-scale").ScaleTime<number, number>;
/*
amountOfValueLayers: number
data: {key, value}[]
TODO: add time selection ==> Date Picker
*/

/*
no need:
aggregationTime:  1s | 1m | 1h | 1d | 1w | 1y
startTime - EndTime
numOfRecords:number
*/

/*
TODO: get Width & Height from outside
*/



function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}


@Component({
  selector: 'infinipoint-test-graph',
  template: `
        <div [id]="dynamicId"></div> 
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./test-graph.component.scss']
})
export class TestGraphComponent implements AfterViewInit {
  @Input() metricsResponse: MetricsResponse;
  @Input() title: string = 'aaa';

  dynamicId = makeid(10);


  
  svg
  width = 500;
  height = 250;

  ngAfterViewInit(): void {
    this.renderGraph(this.metricsResponse);
  }

  setSvg() {
    this.svg = select(`#${this.dynamicId}`)
      .append('svg')
      .attr("width", this.width)
      .attr("height", this.height);
  }

  renderGraph(metricsResponse: MetricsResponse) {
    console.log('this is: ' + this.title);
    console.log(metricsResponse);

    if (!metricsResponse) return;
    
    this.setSvg();

    const data = metricsResponse.items.Metrics[0].TimeSeries as any;
    data.sort((a, b) => a.Key - b.Key);
    const title = this.title;
    const xValue = d => new Date(d.Key);
    const xAxisLabel = 'Time';
    const yValue = d => +d.Value;
    const yAxisLabel = 'Sessions';

    const margin = { top: 60, right: 40, bottom: 88, left: 105 };
    const innerWidth = this.width - margin.left - margin.right;
    const innerHeight = this.height - margin.top - margin.bottom;

    const xScale = scaleTime()
      .domain(extent(data, xValue))
      .range([0, innerWidth])
      .nice();

    const yScale = scaleLinear()
      .domain(extent(data, yValue))
      .range([innerHeight, 0])
      .nice();

    const g = this.svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xAxis = axisBottom(xScale)
      .tickSize(-innerHeight)
      .tickPadding(15);

    const yAxis = axisLeft(yScale)
      .tickSize(-innerWidth)
      .tickPadding(10);

    const yAxisG = g.append('g').call(yAxis);
    yAxisG.selectAll('.domain').remove();

    const xAxisG = g.append('g').call(xAxis)
      .attr('transform', `translate(0,${innerHeight})`);

    xAxisG.selectAll('line').remove();
    xAxisG.select('.domain').remove();

    // this.setVerticalText({ yAxisG, yAxisLabel, innerHeight });
    // this.setHorizontalText({ xAxisG, xAxisLabel, innerWidth });

    this.generateLine({ xScale, xValue, yScale, yValue, data, g });

    this.setMetricTitle({ g, title });
  }

  setMetricTitle({ g, title }) {
    g.append('text')
      .attr('class', 'title')
      .attr('y', -10)
      .text(title);
  }

  generateLine({ xScale, xValue, yScale, yValue, data, g }) {
    const lineGenerator = line()
      .x(d => xScale(xValue(d)))
      .y(d => yScale(yValue(d)))
      //`.curve(curveBasis);

    g.append('path')
      .attr('class', 'line-path')
      .attr('d', lineGenerator(data));
  }

  setVerticalText({ yAxisG, yAxisLabel, innerHeight }) {
    yAxisG.append('text')
      .attr('class', 'axis-label')
      .attr('y', -60)
      .attr('x', -innerHeight / 2)
      .attr('fill', 'black')
      .attr('transform', `rotate(-90)`)
      .attr('text-anchor', 'middle')
      .text(yAxisLabel);
  }


  setHorizontalText({ xAxisG, xAxisLabel, innerWidth }) {
    xAxisG.append('text')
      .attr('class', 'axis-label')
      .attr('y', 80)
      .attr('x', innerWidth / 2)
      .attr('fill', 'black')
      .text(xAxisLabel);
  }

}




/*
    const metric = data.items.Metrics[0].TimeSeries;

    const svg = select('svg');
    const xValue = (d: TimeSeriesEntity) => d.Key;
    const yValue = (d: TimeSeriesEntity) => d.Value + "";

    const xScale = scaleLinear()
      .domain(extent(data.items.Metrics[0].TimeSeries.map(ts => new Date(ts.Key))))
      .range([0, this.width]);

    const yScale = scaleBand()
      .domain(metric.map(yValue))
      .range([0, this.height]);

    // const yScale = scaleLinear()
    //   .domain(extent(data.items.Metrics[0].TimeSeries.map(ts => ts.Value)))
    //   .range([0, this.height]);

    svg.selectAll('rect').data(metric).enter().append('rect')
      .attr('y', d => yScale(yValue(d)))
      .attr('width', d => xScale(xValue(d)))
      .attr('height', yScale.bandwidth())

    //data.items.Metrics[0].TimeSeries.map(ts => ts.Key)
*/






   // Convert Dates to start of the day
   const dates: Date[] = this.dataSource.map(d => {
    const startDay = new Date(d.time);
    //startDay.setUTCHours(0, 0, 0, 0);
    return startDay;
  });

  dates.sort((a, b) => a.getTime() - b.getTime());



  curl -sLX POST 'http://localhost:8010/admin/tenants/create' \
--header 'Content-Type: application/json' \
--data-raw '{
	"name": "a2"
}'