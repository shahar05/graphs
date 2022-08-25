import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GetMetricPayload, graphNames, InventoryDetailsObject, MetricCard, MetricMetaData, ReportData, ReportType } from '@infinipoint/infp-graph/@types';
import { MetricService, ReportService } from '@infinipoint/infp-graph';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

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

const TimeInSec = {
  second: 1,
  hour: 60 * 60,
  day: 60 * 60 * 24,
  week: 60 * 60 * 24 * 7
};



@Component({
  selector: 'metrics-dashboard',
  templateUrl: './metrics-dashboard.component.html',
  styleUrls: ['./metrics-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricsDashboardComponent implements OnInit {
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

  metricsCard: MetricCard[] = [];
  graphNames = graphNames;
  reportData: ReportData;
  metricForm: FormGroup;

  constructor(private reportService: ReportService, private metricService: MetricService, private cdr: ChangeDetectorRef, private http: HttpClient) { }

  ngOnInit(): void {
    this.initMetricsAndForm();
  }


  initMetricsAndForm() {
    this.metricService.getAllMetricsMetaData().subscribe((metricMetaData: MetricMetaData[]) => {
      if (!metricMetaData?.length) {
        console.warn('metricMetaData is null');
        return;
      }

      const defaultMetricFormValue: MetricFormValue = this.getMetricFromValue({ metricsNames: metricMetaData.map(m => m.name) });
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

    this.cdr.detectChanges();
  }


  listenMetricFormChanges() {
    this.metricForm.valueChanges.subscribe((m: MetricFormValue) => {
      if (this.metricForm.invalid) {
        return;
      }
      const metricRequest: GetMetricPayload = this.getMetricRequest(m);
      this.getMetrics(metricRequest);
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

  getMetrics(metricRequest: GetMetricPayload = null) {
    if (this.metricForm.invalid) {
      return;
    }

    if (!metricRequest) {
      metricRequest = this.getMetricRequest(this.metricForm.value);
    }

    this.metricService.getMetric(metricRequest)
      .subscribe((metricsCard: MetricCard[]) => { this.metricsCard = metricsCard });
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
      metrics: this.metricsCard
    };

    this.cdr.detectChanges();
  }

  clearReportData() {
    this.reportData = null;
  }


  addGraphToDB() {
    // const graph = {
    //   name: 'MySessions',
    //   title: 'Sessions Title',
    //   subTitle: 'Sessions Sub-Title ',
    //   query: `SELECT
    //   (intDiv(toUInt64(timestamp), %[2]d) * %[2]d)  as Key,
    //   COUNT(DISTINCT(rootAuthSessionId)) as Value
    //   FROM diaas_events
    //   WHERE tenantId in (%[1]d)
    //   AND timestamp >= %[3]d AND timestamp <= %[4]d
    //   AND eventType = 'diaas.auth.session.started'
    //   GROUP BY Key
    //   ORDER BY Key`,
    //   description: 'Some Description',
    // }

    // this.http.get('/m/metrics').subscribe(res => {
    //   console.log(res);
    // })


    const array = [
      {
        name: 'MySessions',
        title: 'Sessions Title',
        subTitle: 'Sessions Sub-Title ',
        query: `SELECT
          (intDiv(toUInt64(timestamp), %[2]d) * %[2]d)  as Key,
          COUNT(DISTINCT(rootAuthSessionId)) as Value
          FROM diaas_events
          WHERE tenantId in (%[1]d)
          AND timestamp >= %[3]d AND timestamp <= %[4]d
          AND eventType = 'diaas.auth.session.started'
          GROUP BY Key
          ORDER BY Key`,
        description: 'Some Description',
      }
    ]


    for (let index = 0; index < array.length; index++) {
      const graph = array[index];

      this.metricService.createMetric(graph).subscribe(res => {
        console.log(res);
      })

    }


  }
}
