import { Injectable } from '@angular/core';
import { LineChartCardConfig, LineChartConfig, MetricEntity, MetricSize, MetricsResponse } from '@infinipoint/infp-graph/@types';
import { MetricConfig, MetricFormValue } from '../app.models';
import { NetService } from './net.service';

@Injectable({
  providedIn: 'root'
})
export class MetricService {

  constructor(private net: NetService) { }

  changeTenant(tenantId: string) {
    return this.net.changeTenant(tenantId);
  }



  parseMetrics(metricRes: MetricsResponse): MetricConfig[] {
    const metricsConfig: MetricConfig[] = [];
    const metrics = metricRes.items.metrics;

    for (let i = 0; i < metrics.length; i++) {
      const metric = metrics[i];
      const metricColor = this.getMetricColor(i);

      const metricConfig: MetricConfig = this.getCardMetricConfig(metric, metricColor);

      if (this.metricsConfig) {
        const foundMetric = this.metricsConfig.find(x => x.name === metric.name);
        if (foundMetric) {
          metricConfig.hide = foundMetric.hide;
        }
      }

      metricsConfig.push(metricConfig);
    }

    return metricsConfig;
  }


  getMetricColor(i: number) {
    const colorList = ['#359cdb', '#32ae60', '#eb5757'];// TODO: add some more colors
    return colorList[i % colorList.length];
  }

  getCardMetricConfig(m: MetricEntity, graphColor: string, mfv: MetricFormValue): MetricConfig {
    
    const header: {
      text: string,
      count: number,
      countText: string,
      subText?: string,
    } = {
      text: this.graphNames[m.name].name,
      count: m.timeSeries?.length,
      countText: this.graphNames[m.name].subTitle + " per " + mfv.aggregationTime.text.toLowerCase()
    };

    const graph: LineChartConfig = {
      minValue: Number.MAX_VALUE,
      maxValue: Number.MIN_VALUE,
      color: graphColor,
      avg: "0",
      data: [],
      size: MetricSize.Large
    };


    let sum = 0;

    if (!m?.timeSeries) {

      return {
        metricCardConfig: { header, graph },
        hide: false,
        name: m.name
      };

    }

    for (const timeSeriesItem of m.timeSeries) {

      if (!timeSeriesItem.value) {
        continue;
      }

      if (timeSeriesItem.value > graph.maxValue) {
        graph.maxValue = timeSeriesItem.value;
      }

      if (timeSeriesItem.value < graph.minValue) {
        graph.minValue = timeSeriesItem.value;
      }

      sum += timeSeriesItem.value;
      let time = new Date(timeSeriesItem.key);
      let value = timeSeriesItem.value;
      graph.data.push({ time, value });
    }


    header.count = Number((sum / m.timeSeries?.length).toFixed(1));

    graph.avg = header.count + "";

    const lineChartCardConfig: LineChartCardConfig = { header, graph };

    const metricConfig: MetricConfig = {
      metricCardConfig: lineChartCardConfig,
      hide: false,
      name: m.name
    };

    return metricConfig;

  }

}
