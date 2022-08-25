import { Injectable } from '@angular/core';
import { GetMetricPayload, MetricSize, MetricsResponse } from '@infinipoint/infp-graph/@types';
import { DashboardWidget } from '@infinipoint/types';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReportData, ReportDataIssue, ReportDataPolicyIssues, ReportDataPolicyIssuesGeneralData } from '../app.models';
import { MetricService } from './metric.service';
import { NetService } from './net.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private net: NetService, private metricService: MetricService) { }

  getTimeAvgSessions(metricRequest: GetMetricPayload) {
    return this.net.getMetric(metricRequest).pipe(map((metricRes: MetricsResponse) => this.metricService.parseMetrics(metricRes)));
  }

  getWidgetsData(widgets: DashboardWidget[]) {
    return this.net.getWidgetsData(widgets);
  }

  getInventoryDetails(metricRequest: GetMetricPayload) {
    const widgetsDataSubscriber = this.getWidgetsData([DashboardWidget.DevicesTotal, DashboardWidget.UsersIdentityTotal]);
    const timeAvgSessionsSubscriber = this.getTimeAvgSessions(metricRequest);

    forkJoin([widgetsDataSubscriber, timeAvgSessionsSubscriber]).subscribe((data) => {
      console.log(data);
    });

  }


  preparGraphData({ csv }: { csv: string; }) {
    let jsonData = this.csvJSON({ csv, numberValues: true });
    let sessionAccessTime = { color: '#359cdb', data: [], size: MetricSize.Small };
    let compliantDeviceAccessAverageTime = { color: '#32ae60', data: [], size: MetricSize.Small };
    let nonCompliantDeviceAccessAverageTime = { color: '#eb5757', data: [], size: MetricSize.Small };

    this.collectData({ source: jsonData, field: 'sessions_daily', resObj: sessionAccessTime });
    this.collectData({ source: jsonData, field: 'avarage_compliant_session_time', resObj: compliantDeviceAccessAverageTime });
    this.collectData({ source: jsonData, field: 'avarage_non_compliant_session_time', resObj: nonCompliantDeviceAccessAverageTime });

    return { sessionAccessTime, compliantDeviceAccessAverageTime, nonCompliantDeviceAccessAverageTime };
  }

  private collectData({ source, field, resObj }: { source: any[], field: string, resObj: any; }) {
    resObj.minValue = source[0][field];
    resObj.maxValue = source[0][field];
    let valuesTotal = 0;

    for (const day of source) {
      let datum = day[field];
      valuesTotal += datum;
      const { date, } = day;
      if (resObj.maxValue < datum) {
        resObj.maxValue = datum;
      }
      if (resObj.minValue > datum) {
        resObj.minValue = datum;
      }
      resObj.data.push({ time: date, value: datum });

    }
    resObj.avg = (valuesTotal / resObj.data.length).toFixed();
  }

  preparData(data: ReportData) {

    let inventoryStatus = this.buildInventoryStatus(data);

    let reportDataPolicyIssues = null;

    if (data.csv) {
      reportDataPolicyIssues = this.buildIssuesData(data);
    }

    const { startDate, endDate } = data;

    return { startDate, endDate, inventoryStatus, reportDataPolicyIssues, name: data.name };
  }

  buildIssuesData({ csv, showVisibility }: ReportData) {

    let res: ReportDataPolicyIssuesGeneralData = {
      reportDataPolicyIssues: [],
      resolvedIssue: 0,
      totalIssues: 0
    };

    let reposense: ReportDataPolicyIssues[] = [];

    let json = this.csvJSON({ csv: csv });

    let policyMap = this.getMapOfPolicies(json, showVisibility);

    policyMap.forEach((value, key) => {
      const { resolvedForDisplay, openForDisplay } = this.getResolvedIssues(value);

      for (const issue of resolvedForDisplay) {
        res.resolvedIssue += issue.amount;
        res.totalIssues += issue.amount;
      }

      for (const issue of openForDisplay) {
        res.totalIssues += issue.open;
      }

      let policySection: ReportDataPolicyIssues = {
        policyoriginalName: key,
        logo: '../assets/no-title-infp-logo.svg',
        name: key,
        policyName: key,
        resolvedIssues: resolvedForDisplay,
        openIssues: openForDisplay,
        hide: false
      };
      reposense.push(policySection);
    });



    let noResolvedPolicies = reposense.filter((x) => x.resolvedIssues.length === 0);
    for (const item of noResolvedPolicies) {
      for (const issue of item.openIssues) {
        item.resolvedIssues.push({
          amount: 0,
          issueName: issue.issueName,
          open: issue.amount,
          hide: false,
          checkSign: false
        });

      }
    }

    reposense.sort((a, b) => {
      let aResolvedIssues = a.resolvedIssues.reduce((total, x) => (total + x.amount), 0);
      let bResolvedIssues = b.resolvedIssues.reduce((total, x) => (total + x.amount), 0);
      return bResolvedIssues - aResolvedIssues;
    });
    res.reportDataPolicyIssues = reposense;

    return res;

  }

  private getResolvedIssues(issueList: any[]) {
    let resolved = [];
    let open = [];

    for (const item of issueList) {
      if (item.issueStatus === 'Open') {
        open.push(item);
        continue;
      }
      if (item.issueStatus === 'Resolved') {
        resolved.push(item);
        continue;
      }
    }
    // issueType: "Running processes"
    let resolvedForDisplay: ReportDataIssue[] = [];
    let openForDisplay: ReportDataIssue[] = [];
    for (const item of resolved) {
      let issue = resolvedForDisplay.find((x) => x.issueName === item.issueType);
      if (issue) {
        issue.amount = issue.amount + 1;
      } else {
        resolvedForDisplay.push({
          amount: 1,
          issueName: item.issueType,
          checkSign: true,
          hide: false,
          open: open.filter(x => x.issueType === item.issueType).length
        });
      }
    }

    for (const item of open) {
      let issue = openForDisplay.find((x) => x.issueName === item.issueType);
      if (issue) {
        issue.amount = issue.amount + 1;
      } else {
        openForDisplay.push({
          amount: 1,
          issueName: item.issueType,
          checkSign: false,
          hide: false,
          open: open.filter(x => x.issueType === item.issueType).length
        });
      }
    }


    return { resolvedForDisplay, openForDisplay };
  }

  private getMapOfPolicies(json: any[], showVisibility: boolean) {
    let issuesMap = new Map();

    for (const item of json) {
      if (!showVisibility && item.policyEnforceMode === 'Visibility') continue;

      let list = [item];
      if (issuesMap.has(item.policyName)) {
        list = issuesMap.get(item.policyName);
        list.push(item);
      }

      issuesMap.set(item.policyName, list);
    }
    return issuesMap;
  }

  private buildInventoryStatus({ invetoryUserIdentities: invetoryUserIdentities = 10, invetoryUserSessionAvg: invetoryUserSessionAvg = 10, invetoryDeviceIdentities: invetoryDeviceIdentities = 10 }: ReportData) {
    return [{
      iconSrc: "../../../../assets/user.svg",
      centerContentText: "User Identities",
      footerNumber: invetoryUserIdentities.toString(),
      bgColor: "#f2c94c"
    },
    {
      iconSrc: "../../../../assets/session.svg",
      centerContentText: "AVG Daily Sessions",
      footerNumber: invetoryUserSessionAvg.toString(),
      bgColor: "#BB6BD9"
    },
    {
      iconSrc: "../../../../assets/devices.svg",
      centerContentText: "Device Identities",
      footerNumber: invetoryDeviceIdentities.toString(),
      bgColor: "#56CCF2"
    }];
  }


  csvJSON({ csv, numberValues = false }) {
    const ignoreNumberField = ['date'];
    let lines = csv.split("\n");
    // let lines = csv.split("\r1");
    let result = [];

    // NOTE: If your columns contain commas in their values, you'll need
    // to deal with those before doing the next step 
    // (you might convert them to &&& or something, then covert them back later)
    // jsfiddle showing the issue https://jsfiddle.net/
    let headers = lines[0].split(",");

    lineloop:
    for (let i = 1; i < lines.length; i++) {

      let obj = {};
      let currentline = lines[i].split(",");

      fieldLoop:
      for (let j = 0; j < headers.length; j++) {
        let value = currentline[j]?.trim().replace(
          /^(?:")(.*)(?:")$/,
          "$1"
        );


        const key = this.lowerFirstLetter((headers[j].split(".")[1] ?? headers[j]).replace(/\s/g, '').replace(/"/g, ''));
        if (numberValues && !ignoreNumberField.includes(key)) {
          value = Number(value);
        }


        if (key === 'date') {
          value = new Date(value);
          if (isNaN(value)) continue lineloop;
        }

        obj[key] = value;

      }

      result.push(obj);

    }

    //return result; //JavaScript object
    return result; //JSON
  }
  lowerFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
  }

  getAverageDailyDIaaSSessions({ csv }: { csv: string; }) {
    let sessions = this.csvJSON({ csv });

    let total = 0;
    for (const session of sessions) {
      total += Number(session.sessions_daily);
    }
    return Math.ceil(total / sessions.length);
  }


}
