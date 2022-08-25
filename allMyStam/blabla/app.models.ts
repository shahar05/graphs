import { LineChartCardConfig } from '@infinipoint/infp-graph/@types';
import { Tenant } from '@infinipoint/types';
import { ReportType } from "./app.enums";

export interface ReportData {
    metrics?: LineChartCardConfig[];
    type: ReportType;
    name: string;
    startDate: number;
    endDate: number;
    invetoryUserIdentities: number;
    invetoryUserSessionAvg: number;
    showVisibility: boolean;
    csv: string;
    invetoryDeviceIdentities: number;
}

export interface ReportDataInventoryStatusItem {
    iconSrc: string,
    centerContentText: string,
    footerNumber: string,
    bgColor: string;
}

export interface ReportDataPolicyIssuesGeneralData {
    reportDataPolicyIssues: ReportDataPolicyIssues[];
    totalIssues: number;
    resolvedIssue: number;
}


export interface ReportDataPolicyIssues {
    logo: string,
    name: string,
    policyName: string,
    policyoriginalName: string;
    resolvedIssues: ReportDataIssue[],
    openIssues: ReportDataIssue[];
    hide: boolean;

}
export interface ReportDataIssue {
    amount: number,
    issueName: string,
    open?: number;
    checkSign: boolean;
    hide: boolean;


}

export interface NavItem {
    displayValue: string;
    route: string;
}



export interface MetricConfig {
    metricCardConfig: LineChartCardConfig,
    hide: boolean,
    name: string;
}


export interface MetricFormValue {
    startDate: Date,
    endDate: Date,
    tenant: Tenant,
    aggregationTime: AggregateTimeItem,
    metricsNames: string[];
}

export interface AggregateTimeItem {
    text: string,
    value: number;
}