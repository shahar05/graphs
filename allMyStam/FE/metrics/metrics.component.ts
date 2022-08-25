import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LineChartCardConfig, GetMetricPayload } from '@infinipoint/infp-graph/@types';
import { map } from 'rxjs/internal/operators/map';

import { graphNames, InventoryDetailsObject, MetricConfig, ReportData } from '../../app.models';
import { ReportType } from '../../app.enums';
import { MetricService } from '../../services/metric.service';
import { ReportService } from '../../services/report.service';

interface AggregateTimeItem {
  text: string,
  value: number;
}

interface MetricFormValue {
  startDate: Date,
  endDate: Date,
  aggregationTime: AggregateTimeItem,
  metricsNames: string[];
}

interface MetricNameItem {
  name: string,
  display: boolean;
}

const TimeInSec = {
  second: 1,
  hour: 60 * 60,
  day: 60 * 60 * 24,
  week: 60 * 60 * 24 * 7
};

@Component({
  selector: 'metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.scss'],
})
export class MetricsComponent implements OnInit {
  readonly aggregationTimeList: AggregateTimeItem[] = [ // TODO: Create Dynamic Aggregation --> I mean Table of unit time && amount 
    { text: 'One Second', value: TimeInSec.second },
    { text: 'Half Hour', value: TimeInSec.hour / 2 },
    { text: 'One Hour', value: TimeInSec.hour },
    { text: 'Six Hours', value: TimeInSec.hour * 6 },
    { text: 'Half Day', value: TimeInSec.day / 2 },
    { text: 'One Day', value: TimeInSec.day },
    { text: 'One Week', value: TimeInSec.week },
    { text: 'One Month', value: TimeInSec.day * 30 },
  ];
  graphNames = graphNames;
  metricForm: FormGroup;
  metricsConfig: MetricConfig[] = [];
  reportData: ReportData;

  constructor(private reportService: ReportService, private metricService: MetricService) { }

  ngOnInit() {
    this.initMetricsAndForm();
  }

  initMetricsAndForm() {
    this.metricService.getAllMetricsNames().subscribe((metricsNames: string[]) => {
      const defaultMetricFormValue: MetricFormValue = this.getMetricFromValue({ metricsNames });
      this.initMetricForm(defaultMetricFormValue);
      this.listenMetricFormChanges();
      this.getMetrics();
    });
  }

  getMetricFromValue({ metricsNames }: { metricsNames: string[]; }): MetricFormValue {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 1); // get one month back

    return {
      aggregationTime: this.aggregationTimeList.find(at => at.value === TimeInSec.day),
      endDate,
      startDate,
      metricsNames
    };
  }

  initMetrics(metricsNames: string[]): LineChartCardConfig[] {
    return metricsNames.map(metricName => ({
      header: null,
      graph: null,
      hide: true,
      name: metricName
    }));
  }

  listenMetricFormChanges() {
    this.metricForm.valueChanges.subscribe(async (m: MetricFormValue) => {

      if (this.metricForm.invalid) {
        return;
      }
      const metricRequest: GetMetricPayload = this.getMetricRequest(m);
      this.getMetrics(metricRequest);
    });
  }

  initMetricForm(metricFormValue: MetricFormValue) {

    let startDate = new FormControl(metricFormValue.startDate, [Validators.required]);
    let endDate = new FormControl(metricFormValue.endDate, [Validators.required]);
    let aggregationTime = new FormControl(metricFormValue.aggregationTime, [Validators.required]);
    let metricsNames = new FormControl(metricFormValue.metricsNames);

    this.metricForm = new FormGroup({
      aggregationTime,
      startDate,
      endDate,
      metricsNames
    });
  }

  getMetricRequest(mfv: MetricFormValue): GetMetricPayload {
    let maxDate = null;
    if (mfv?.endDate) {
      maxDate = new Date(mfv.endDate.getTime());
      maxDate.setDate(mfv.endDate.getDate() + 1);
      maxDate = maxDate.getTime();
    }

    const metricRequest: GetMetricPayload = {
      metrics: mfv?.metricsNames,
      minDate: mfv?.startDate?.getTime(),
      maxDate,
      aggregateSeconds: mfv?.aggregationTime?.value,
    };

    return metricRequest;
  }


  getMetrics(metricRequest: GetMetricPayload = null, keepMetricsNameOrder = true) {
    if (this.metricForm.invalid) {
      return; // Maybe add MarkAllAsTouched()
    }
    if (!metricRequest) {
      metricRequest = this.getMetricRequest(this.metricForm.value);
    }
    this.metricService.getMetric(metricRequest)
      .pipe(map((metricsConfig: MetricConfig[]) => this.parseMetrics(metricsConfig)))
      .subscribe((metricsConfig: MetricConfig[]) => {
        if (this.metricsConfig?.length) {
          for (let i = 0; i < this.metricsConfig.length; i++) {
            const metricName = this.metricsConfig[i].name;
            const foundMetricIndex = metricsConfig.findIndex((m) => m.name === metricName);
            const temp = metricsConfig[foundMetricIndex];
            metricsConfig[foundMetricIndex] = metricsConfig[i];
            metricsConfig[i] = temp;
          }
        }
        this.metricsConfig = metricsConfig;
      });
  }

  parseMetrics(metricsConfig: MetricConfig[]): MetricConfig[] {

    for (const metric of metricsConfig) {
      const foundMetric = this.metricsConfig.find(x => x.name === metric.name);
      if (foundMetric) {
        metric.hide = foundMetric.hide;
      }
    }

    return metricsConfig;
  }

  setMetricsNames(metricsNames: string[]) {
    this.metricForm.get('metricsNames').setValue(metricsNames, { emitEvent: false });
  }

  generatePdf() {
    if (this.metricForm.invalid) {//TODO: Display Some Error Message
      return;
    }
    const metricRequest: GetMetricPayload = this.getMetricRequest(this.metricForm.value);

    this.reportService.getInventoryDetails({ start: metricRequest.minDate, end: metricRequest.maxDate })
      .subscribe((inventoryDetails: InventoryDetailsObject) => this.initReportData(inventoryDetails));
  }

  initReportData(inventoryDetails: InventoryDetailsObject) {

    if (!inventoryDetails) {
      return;
    }

    this.reportData = {
      type: ReportType.UserExperienceReport,
      name: ReportType.UserExperienceReport,
      startDate: this.metricForm.get('startDate').value.getTime(),
      endDate: this.metricForm.get('endDate').value.getTime(),
      invetoryUserIdentities: inventoryDetails.userIdentities,
      invetoryUserSessionAvg: inventoryDetails.userSessionAvg,
      invetoryDeviceIdentities: inventoryDetails.deviceIdentities,
      showVisibility: true,
      metrics: this.metricsConfig.filter(m => !m.hide).map(m => m.metricCardConfig)
    };
  }

  clearReportData() {
    this.reportData = null;
  }


}
