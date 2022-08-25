
import { AfterViewInit, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { select, scaleLinear, axisBottom, selectAll, axisLeft, line, format, extent, timeFormat, curveBasis, curveLinear, curveBasisOpen, curveCatmullRom, curveCardinal, curveNatural, curveMonotoneY, curveMonotoneX, curveStepBefore, curveLinearClosed, curveBundle, curveCatmullRomClosed } from 'd3';
import { LineChartConfig, MetricSizes } from '../infp-graph.models';

const DAY_IN_MIL_SEC = 1000 * 3600 * 24;

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
  selector: 'line-graph',
  template: `
      <div [id]="dynamicId"></div> 
  `,
  styleUrls: ['./line-graph.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { 'class': `time-series-chart` },

})
export class LineGraphComponent implements OnInit, AfterViewInit {
  @Input() config: LineChartConfig;
  dynamicId = makeid(6);

  // set the dimensions and margins of the graph
  margin = { top: 5, right: 24, bottom: 25, left: 24 };

  width;
  height;

  dataSource: any;
  xAxis;
  yAxis;
  svg;

  showNoData = false;

  ngOnInit(): void {
    const metricSize = MetricSizes[this.config.size]
    this.width = metricSize.w - this.margin.left - this.margin.right;
    this.height = metricSize.h - this.margin.top - this.margin.bottom;
  }

  ngAfterViewInit(): void {

    if (!this.config?.data?.length) {
      // TODO: Maybe add warn?
      return;
    }
    this.dataSource = this.config.data;
    this.init();
  }

  init() {
    const margin = this.margin;
    const width = this.width;
    const height = this.height;

    // append the svg object to the body of the page
    this.svg = select(`#${this.dynamicId}`)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

    this.generateAxis(height);

    this.generateLine();
  }


  generateAxis(height: number) {
    this.generateXaxis(height);
    this.generateYaxis(height);
  }


  generateYAxisTickValues(maxValue: number, numOfTicks = 5, minValue: number = 0) {
    let tickValues = [minValue];
    let gapValue = Math.ceil(maxValue / (numOfTicks - 1));
    let currentValue = 0;

    for (let i = 1; i < numOfTicks; i++) {
      currentValue += gapValue;
      if (maxValue > currentValue) {
        tickValues.push(currentValue);
      }
    }

    return tickValues;
  }

  generateYaxis(height: number) {

    const y = scaleLinear()
      .domain([0, this.config.maxValue])
      .range([height, 0])

      .nice();

    let tickValues = this.generateYAxisTickValues(this.config.maxValue);

    // TODO: Sometimes format('.0f') Is not needed because you the decimal point

    this.svg.append('g')
      .attr('class', 'axis-y')
      .attr('transform', `translate(${this.margin.left - 20}, ${this.margin.top})`)
      .call(axisLeft(y)
        .tickFormat(format('.0f'))
        .tickValues(tickValues)
        .tickSize(-45 - this.width)
      );

    selectAll(`#${this.dynamicId} .axis-y .tick text`).each(function (x, y) {

      select(this)
        .attr('dy', '-5px')
        .attr('x', (d) => { // If the Value is More than 2 digits and so on
          if (d > 1000) {
            return '14';
          }
          if (d > 100) {
            return '12';
          }
          return '5';
        })
        .attr("font-size", '8px')
        .attr("font-weight", '200')
        .attr("font-family", 'Nunito Sans')
        .attr("stroke-width", '.1px')
        .attr("stroke", "#828282");
    });

    selectAll(`#${this.dynamicId} .axis-y .tick line`).each(function (x, y) {
      select(this)
        .attr("fill", "#EBEDF0")
        .attr("stroke-width", .5)
        .attr("stroke", "#EBEDF0");
    });
    

    this.yAxis = y;
  }

  generateXaxis(height: number) {

    const x = scaleLinear()
      .domain(extent(this.dataSource, (d) => new Date(d['time'])))
      .range([0, this.width]);

    let tickValues = this.genXDateTicks();

    this.svg.append('g')
      .attr('class', 'axis-x')
      .attr('transform', `translate(${this.margin.left}, ${height + 5})`)
      .call(
        axisBottom(x)
          .tickSize(0)
          .tickValues(tickValues)
          .tickFormat(timeFormat('%d.%m'))
      );

    selectAll(`#${this.dynamicId} .axis-x .tick text`).each(function (x, y) {
      select(this)
        .attr("font-weight", '200')
        .attr("font-family", 'Nunito Sans')
        .attr("font-size", '8px')
        .attr("stroke-width", '.1px')
        .attr("stroke", "#828282");
    });
    this.xAxis = x;
  }


  genValue(limit: number){
    return Math.floor(Math.random() * limit);
  }

  generateLine() {
    const lineFunction = line()
      .x((d) => this.xAxis(+d['time']))
      .y((d) => this.yAxis(+d['value']))

    this.svg.append("path")
      .attr("d", lineFunction(this.dataSource))
      .attr("stroke", this.config.color)
      .attr('transform', `translate(${this.margin.left}, 0)`)
      .attr("stroke-width", 3)
      .attr("fill", "none");



      // const a = [...this.dataSource.map(d => {
      //   return {time: new Date(d.time.getTime() + this.genValue(20000))  , value: this.genValue(this.config.maxValue)}
      // } )]

      // const a = [...this.dataSource.map(d => {
      //   return {time: new Date((d.time as Date).getDay() + this.genValue(20000))  , value: d.value}
      // } )]
      

      // this.svg.append("path")
      // .attr("d", lineFunction(a))
      // .attr("stroke", '#E79E0D')
      // .attr('transform', `translate(${this.margin.left}, 0)`)
      // .attr("stroke-width", 3)
      // .attr("fill", "none");
  }


  genXDateTicks(numOfTicks = 6): Date[] {
    const dateTicks: Date[] = [];

    const dates: Date[] = this.dataSource.map(d => new Date(d.time));
    dates.sort((a, b) => a.getTime() - b.getTime());
    const endDate = dates[dates.length - 1];
    endDate.setDate(dates[dates.length - 1].getDate())

    const daysDiff: number = this.getDaysDiff(dates[0], endDate);
    let dist: number = Math.ceil(daysDiff / numOfTicks);
    let remainder: number = daysDiff % numOfTicks;
    let hasReminder = 0;
    let tickDate = dates[0];

    dateTicks.push(tickDate);

    for (let i = 0; i < numOfTicks - 1; i++) {
      tickDate = new Date(tickDate);

      if (remainder !== 0) {
        hasReminder = 1;
        remainder--;
      } else {
        hasReminder = 0;
      }

      tickDate.setDate(tickDate.getDate() + dist + hasReminder);

      if (tickDate.getTime() < endDate.getTime()) {
        dateTicks.push(tickDate);
      }

    }

    if (dateTicks.length && this.getDaysDiff(endDate, dateTicks[dateTicks.length - 1]) === 1) {
      dateTicks.pop();
    }

    dateTicks.push(endDate)

    return dateTicks;
  }


  removeDuplicateDays(dates: Date[]) {
    dates.sort((a, b) => a.getTime() - b.getTime());
    const nonDupDates = [];
    for (let i = 0; i < dates.length - 1; i++) {
      if (dates[i].getDate() != dates[i + 1].getDate()) {
        nonDupDates.push(dates[i]);
      }
    }
    const len = dates.length;
    if (dates[len - 1].getDate() != dates[len - 2].getDate()) {
      nonDupDates.push(dates[len - 1]);
    }

    return nonDupDates;
  }

  getDaysDiff(s: Date, e: Date): number {
    if (!s || !e || !(e instanceof Date) || !(s instanceof Date)) {
      return 0;
    }
    return (e.getTime() - s.getTime()) / (DAY_IN_MIL_SEC);
  }


}








