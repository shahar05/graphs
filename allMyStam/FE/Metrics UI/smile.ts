import { Component, OnInit } from '@angular/core';
import { select } from 'd3';

@Component({
  selector: 'smile',
  template: ` <svg width="960" height="500"></svg>`,
  styleUrls: ['./smile.component.scss']
})
export class SmileComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    const svg = select('svg');
    const width = +svg.attr('width');
    const height = +svg.attr('height');

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);
    const circle = g.append('circle');

    circle.attr('r', height / 2);
    circle.attr('fill', 'yellow');
    circle.attr('stroke', 'black');

    const eyeSpacing = 101;
    const eyeYOffset = -89;
    const eyeRadius = 40;

    const eyebrowWidth = 70;
    const eyebrowHeight = 20;
    const eyebrowYOffset = -70;


    const eyesG = g
      .append('g')
      .attr('transform', `translate(0, ${eyeYOffset})`);


  }
}

/*
genXTicks() {
    // If its more than 8 days
    const startTime = new Date(this.data[0].Key);
    startTime.setHours(0, 0, 0, 0);

    const endTime = new Date(this.data[this.data.length - 1].Key);
    endTime.setDate(endTime.getDate() + 1);
    endTime.setHours(0, 0, 0, 0);
    
    const timeDist = endTime.getTime() - startTime.getTime();
    const daysDist = Math.floor(timeDist / 1000 * 60 * 60 * 24);

    // if(daysDist < 8){

    // }

    const ticks = 
    
  }


  randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }


  dupData() {

    const data = this.metricsResponse.items.Metrics[0].TimeSeries;
    const maxVal = max(data.map(d => d.Value));
    const minVal = min(data.map(d => d.Value));
    data.sort((a, b) => a.Key - b.Key);

    console.log(new Date(data[data.length - 4].Key));
    console.log(new Date(data[data.length - 3].Key));
    console.log(new Date(data[data.length - 2].Key));
    console.log(new Date(data[data.length - 1].Key));


    const currTime = data[data.length - 1].Key
    const dayAfter = new Date(currTime);
    const len = data.length


    for (let i = 1; i < len; i++) {
      //60*60*1000

      const ts: TimeSeriesEntity = { Key: currTime + (i * 60 * 60 * 1000), Value: this.randomIntFromInterval(minVal, maxVal) };
      data.push(ts)
    }



    data.sort((a, b) => a.Key - b.Key);
    console.log(new Date(data[len - 1].Key));
    console.log(new Date(data[data.length - 1].Key));

  }

  prepareData() {
    //console.log(metricsResponse.items.Metrics[0].TimeSeries.map(t => new Date(t.Key)));
    const data = this.metricsResponse.items.Metrics[0].TimeSeries.slice(0, 10) ;

    

    let minTime = data[0];
    for (const d of data) {
      if (d.Key < minTime.Key) {
        minTime = d;
      }
    }

    let minDate = new Date(minTime.Key);

    let yesterday = new Date(minDate);

    yesterday.setDate(minDate.getDate() - 1);

    let TimeSeriesEntity: TimeSeriesEntity = { Key: yesterday.getTime(), Value: null };

    //data.unshift( TimeSeriesEntity )



    const a = data;
    a.forEach(b => {
      const da = new Date(b.Key);
      const date = da.getDate() + "/" + (da.getMonth() + 1);
      const value = b.Value;
      const hour = da.getHours();
      const day = da.getDay();
      //console.log({ date, hour, day, value });

    })


  }


*/
