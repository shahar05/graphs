import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NetService } from '../../services/net.service';
import { LineChartCardConfig, LineChartConfig, GetMetricPayload, MetricEntity, MetricsResponse, MetricSize, MetricSizes } from '@infinipoint/infp-graph/@types';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { map } from 'rxjs/internal/operators/map';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ReportData } from '../../app.models';
import { ReportType } from '../../app.enums';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { DashboardResponseItem, DashboardWidget, Tenant } from '@infinipoint/types';
import { MetricService } from '../../services/metric.service';






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

interface Widgets {
  widgets: { type: DashboardWidget, data: { total: number; }; }[];
}

@Component({
  selector: 'metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.scss'],
})
export class MetricsComponent implements OnInit {
  readonly aggregationTimeList: AggregateTimeItem[] = [ // TODO: Create Dynamic Aggregation
    { text: 'One Second', value: TimeInSec.second },
    { text: 'Half Hour', value: TimeInSec.hour / 2 },
    { text: 'One Hour', value: TimeInSec.hour },
    { text: 'Six Hours', value: TimeInSec.hour * 6 },
    { text: 'Half Day', value: TimeInSec.day / 2 },
    { text: 'One Day', value: TimeInSec.day },
    { text: 'One Week', value: TimeInSec.week },
    { text: 'One Month', value: TimeInSec.day * 30 },
  ];

  readonly graphNames = {
    sessions: { name: "Access Over Time", subTitle: "Sessions" }, // 5 Sessions per Day
    issues: { name: "Issues", subTitle: "Sessions done with issues" }, // 10 Sessions Done with Issues per Day
    avg_diaas: { name: "Compliant Device Access", subTitle: "Average session duration with no issue found" }, // Average session duration with no issue found per day
    resolved_issues: { name: "Resolved Issues", subTitle: "Issues resolved" }, // 13 Issues resolved per day
    approved_by_grace: { name: "Approved By Grace", subTitle: "Users approved by grace" }, // 7 Users approved by grace per Day
  };

  tenants: Tenant[] = null;
  metricForm: FormGroup;
  metricsNameList: MetricNameItem[] = null;
  metricsConfig: MetricConfig[] = [];
  isAlreadyListenToFormChanges = false;

  reportName: string = ReportType.UserExperienceReport;
  reportData: ReportData;

  constructor(private net: NetService, private metricService: MetricService) { }

  ngOnInit() {
    this.initMetricsAndForm();
  }

  initMetricsAndForm() {
    const TenantsSubscriber = this.net.getTenants();
    const metricsNameSubscriber = this.net.getAllMetricsNames();

    forkJoin([TenantsSubscriber, metricsNameSubscriber]).subscribe((resList) => {

      this.tenants = <Tenant[]>(resList[0]['tenants']);

      const defaultMetricFormValue: MetricFormValue = this.getMetricFromValue(
        {
          tenant: this.tenants.find(t => t.selected),
          metricsNames: resList[1] // In the beginning All Metrics has been chosen
        });

      this.reportName = "User Experience Report - " + defaultMetricFormValue.tenant.name;

      this.initMetricForm(defaultMetricFormValue);

      this.listenMetricFormChanges();

      const metricRequest: GetMetricPayload = this.getMetricRequest(this.metricForm.value);

      this.getMetrics(metricRequest);
    });
  }

  getMetricFromValue({ tenant, metricsNames }: { tenant: Tenant, metricsNames: string[]; }): MetricFormValue {
    const endDate = new Date();
    const startDate = new Date();

    startDate.setMonth(endDate.getMonth() - 1); // get one month back
    return {
      tenant,// BE will handle it and set default tenant || I should return my current tenant
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
    if (this.isAlreadyListenToFormChanges) {
      return;
    }

    this.isAlreadyListenToFormChanges = true;

    this.metricForm.valueChanges.subscribe(async (m: MetricFormValue) => {

      if (this.metricForm.invalid) {
        return;
      }
      const metricRequest: GetMetricPayload = this.getMetricRequest(m);
      this.getMetrics(metricRequest);
    });
  }

  changeTenant(tenant: Tenant) {
    this.metr.changeTenant(tenant.id).subscribe(() => {
      const metricRequest: GetMetricPayload = this.getMetricRequest(this.metricForm.value);
      this.getMetrics(metricRequest);
    });
  }


  initMetricForm(metricFormValue: MetricFormValue) {

    let startDate = new FormControl(metricFormValue.startDate, [Validators.required]);
    let endDate = new FormControl(metricFormValue.endDate, [Validators.required]);
    let tenant = new FormControl(metricFormValue.tenant, [Validators.required]);
    let aggregationTime = new FormControl(metricFormValue.aggregationTime, [Validators.required]);
    let metricsNames = new FormControl(metricFormValue.metricsNames);

    this.metricForm = new FormGroup({
      aggregationTime,
      startDate,
      endDate,
      tenant,
      metricsNames
    });
  }

  getMetricRequest(mfv: MetricFormValue): GetMetricPayload {

    const metricRequest: GetMetricPayload = {
      metrics: mfv?.metricsNames,
      minDate: mfv?.startDate?.getTime(),
      maxDate: mfv?.endDate?.getTime(),
      aggregateSeconds: mfv?.aggregationTime?.value,
    };

    return metricRequest;
  }

  drop(e) {
    moveItemInArray(this.metricsConfig, e.previousIndex, e.currentIndex);
  }


  getMetrics(metricRequest: GetMetricPayload) {
    if (this.metricForm.invalid) {
      return; // Maybe add MarkAllAsTouched()
    }

    this.net.getMetric(metricRequest)
      .pipe(map((metricRes: MetricsResponse) => this.parseMetrics(metricRes)))
      .subscribe((metricsConfig: MetricConfig[]) => {
        this.metricsConfig = metricsConfig;

      });
  }

  displayMetricChange(event: MatCheckboxChange, metricConfig: MetricConfig) {
    metricConfig.hide = !event.checked;

    const metricsNames = this.metricsConfig.map(m => m.name);
    this.metricForm.get('metricsNames').setValue(metricsNames, { emitEvent: false });
  }

  toggleMetricDisplay(metricNameItem: MetricNameItem) {
    if (!this.metricsConfig?.length) {
      // Message: Please Fill The Inputs Above
      return;
    }

    metricNameItem.display = !metricNameItem.display;
    const metricForToggleDisplay = this.metricsConfig.find(m => m.name === metricNameItem.name);
    if (metricForToggleDisplay) {
      metricForToggleDisplay.hide = !metricNameItem.display;
    }
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




  generatePdf() {
    if (this.metricForm.invalid) {
      //TODO: Display Some Error Message
      return;
    }

    this.net.getWidgetsData([DashboardWidget.DevicesTotal, DashboardWidget.UsersIdentityTotal]).subscribe((widgets: DashboardResponseItem[]) => {
      this.initReportData(widgets);
    })

  }

  initReportData(widgets: DashboardResponseItem[]) {

    if (!widgets?.length) {
      // ERROR !!!
      // What to do here:
      // 1. I can display the Widgets Inputs ---> NO NO NO 
      // 2. I can Set default Value --> maybe
      // 3. I can just Display a Error --> what error and how to display it??? --> Yes!
      return;
    }

    this.getAvgSessionPerDay()

    let invetoryUserSessionAvg = Number(this.metricsConfig.find(m => m.name === 'avg_diaas').metricCardConfig.graph.avg);
    let invetoryUserIdentities = widgets.find((w) => w.type === DashboardWidget.UsersIdentityTotal)?.data?.total;
    let invetoryDeviceIdentities = widgets.find((w) => w.type === DashboardWidget.DevicesTotal)?.data?.total;

    const { startDate, endDate } = this.metricForm.value;


    this.reportData = {
      type: ReportType.UserExperienceReport,
      name: this.reportName || ReportType.UserExperienceReport,
      startDate: startDate.getTime(),//: this.metricForm.get('startDate').value.getTime(),
      endDate: endDate.getTime(), //: this.metricForm.get('endDate').value.getTime(),
      invetoryUserIdentities,
      invetoryUserSessionAvg,
      invetoryDeviceIdentities,
      showVisibility: true,
      csv: null,
      metrics: this.metricsConfig.filter(m => !m.hide).map(m => m.metricCardConfig)
    };
  }

  clearReportData() {
    this.reportData = null;
  }

  reportNameChange($e) {
    const { value } = $e.target;
    this.reportData.name = value;
    this.reportData = { ...this.reportData };

  }
}
