// -------------------------------------------- BE ---------------------------------
export enum MetricType {
    Time,
    Amount
}
export interface TimeSeriesEntity {
    key: number;    // X \\  Date
    value: number; //  Y  \\ Value
}

export interface MetricEntity { // One Query/Line of Metric
    title: string; // Legend
    description: string; // Now no Need
    timeSeries: TimeSeriesEntity[];
    hide: boolean; // Switch On/Off 
}

export interface MetricsEntity { // One Whole Metric
    metricMetaData: MetricMetaData;
    metrics: MetricEntity[];
    // hide: boolean; (Probably no need)
}

export interface MetricMetaData {
    name: string;
    title: string;
    description: string;
    order: number;
    type: MetricType;
}

export interface GetMetricPayload {
    metrics: string[];
    minDate: number;
    maxDate: number;
    aggregateSeconds: number;
}

export interface MetricsResponse {
    itemsTotal: number;
    items: MetricsEntity[];
}

// -------------------------------------------- FE ---------------------------------



export interface LineChartConfig { // One Line Graph
    size: MetricSize;
    GraphsData: GraphData[];
}

export interface GraphData { // This in one line 
    minValue?: number;
    maxValue?: number;
    color: string;
    avg?: string;
    data: TimeSeriesEntity[];
    description: string;
    legend: string; // Title of query
}

export interface MetricCardConfig { // This is WHOLE Metric
    metricMetaData: MetricMetaData;
    metricCardConfig: LineChartCardConfig;
}


export interface MetricConfig {
    metricCardConfig: LineChartCardConfig,
    hide: boolean,
    name: string;
}

export interface LineChartCardConfig {
    header?: {
        text: string,
        count: number,
        countText: string,
        subText?: string,
    },
    graph?: LineChartConfig,
}


export enum MetricSize {
    Small = 'sm',
    Medium = 'md',
    Large = 'lg',
    XL = ' xl'
}

export enum ReportType {
    UserExperienceReport = 'User Experience Report',
    SecurityImpactReport = 'Security Impact Report'
}

export const MetricSizes = {
    [MetricSize.Small]: { w: 335, h: 185 },
    [MetricSize.Medium]: { w: 430, h: 270 },
    [MetricSize.Large]: { w: 500, h: 300 },
    [MetricSize.XL]: { w: 880, h: 460 },
}

export const graphNames = {
    sessions: { name: "Daily Sessions", description: "Average daily sessions going through DIaaS" }, // 5 Sessions per Day
    issues: { name: "Sessions with Issues ", description: "Daily session with issues found" }, // 10 Sessions Done with Issues per Day
    avg_diaas: { name: "Session duration - Compliant devices", description: "Duration in seconds an end-user spends on the DIaaS page when the device is Compliant" }, // Average session duration with no issue found per day
    resolved_issues: { name: "Resolved Issues", description: "Daily resolved issues" }, // 13 Issues resolved per day
    approved_by_grace: { name: "Progressed Session with Issues", description: "DIaaS sessions that redirected with remaining issues, to Service or Application, as a result of End-Users initiated progression" }, // 7 Users approved by grace per Day
    avg_diaas_non_compliant: { name: "Session duration - Non Compliant devices", description: "Duration in seconds an end-user spends on the DIaaS page when the device is Non-Compliant" }, // Average session duration with no issue found per day
};


export interface ReportData {
    metrics?: LineChartCardConfig[];
    type: ReportType;
    name: string;
    startDate: number;
    endDate: number;
    invetoryUserIdentities: number;
    invetoryUserSessionAvg: number;
    showVisibility: boolean;
    invetoryDeviceIdentities: number;
}

export interface InventoryDetailsObject {
    userIdentities: number,
    userSessionAvg: number,
    deviceIdentities: number,
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


export interface ReportDataPolicyIssuesGeneralData {
    reportDataPolicyIssues: ReportDataPolicyIssues[];
    totalIssues: number;
    resolvedIssue: number;
}


export interface ReportDataInventoryStatusItem {
    iconSrc: string,
    centerContentText: string,
    footerNumber: string,
    bgColor: string;
}

export interface NavItem {
    displayValue: string;
    route: string;
}





// -------------------------------------------- BE ---------------------------------
export enum MetricType {
    Time,
    Amount
}
export interface TimeSeriesEntity {
    key: number;    // X \\  Date
    value: number; //  Y  \\ Value
}

export interface MetricEntity {
    metricMetaData: MetricMetaData;
    timeSeries: TimeSeriesEntity[];
}

export interface MetricsEntity {
    title: string;
    description: string;
    metrics: MetricEntity[];
}

export interface MetricMetaData {
    name: string;
    title: string;
    description: string;
    order: number;
    type: MetricType;
}

export interface GetMetricPayload {
    metrics: string[];
    minDate: number;
    maxDate: number;
    aggregateSeconds: number;
}

export interface MetricsResponse {
    itemsTotal: number;
    items: MetricsEntity[];
}

// -------------------------------------------- FE ---------------------------------



export interface MetricCardConfig {
    cardDetails: 
}

export interface GraphData { // This in one line 
    minValue?: number;
    maxValue?: number;
    color: string;
    avg?: string;
    data: TimeSeriesEntity[];
    description: string;
    legend: string; // Title of query
}

export interface LineChartConfig {
    size: MetricSize;
    graphData: GraphData[]
}

export interface LineChartCardHeader {
    title: string;
    legends: string[];
    description?: string;
}

export interface LineChartCardConfig {
    header: LineChartCardHeader;
    graphs: LineChartConfig[];
}

export interface MetricCardConfig { // This is one Metric
    metricCardConfig: LineChartCardConfig;
    description: string;
    type: MetricType;
    order: number;
    hide: boolean;
    name: string;
}



export enum MetricSize {
    Small = 'sm',
    Medium = 'md',
    Large = 'lg',
    XL = ' xl'
}

export enum ReportType {
    UserExperienceReport = 'User Experience Report',
    SecurityImpactReport = 'Security Impact Report'
}

export const MetricSizes = {
    [MetricSize.Small]: { w: 335, h: 185 },
    [MetricSize.Medium]: { w: 430, h: 270 },
    [MetricSize.Large]: { w: 500, h: 300 },
    [MetricSize.XL]: { w: 880, h: 460 },
}

export const graphNames = {
    sessions: { name: "Daily Sessions", description: "Average daily sessions going through DIaaS" }, // 5 Sessions per Day
    issues: { name: "Sessions with Issues ", description: "Daily session with issues found" }, // 10 Sessions Done with Issues per Day
    avg_diaas: { name: "Session duration - Compliant devices", description: "Duration in seconds an end-user spends on the DIaaS page when the device is Compliant" }, // Average session duration with no issue found per day
    resolved_issues: { name: "Resolved Issues", description: "Daily resolved issues" }, // 13 Issues resolved per day
    approved_by_grace: { name: "Progressed Session with Issues", description: "DIaaS sessions that redirected with remaining issues, to Service or Application, as a result of End-Users initiated progression" }, // 7 Users approved by grace per Day
    avg_diaas_non_compliant: { name: "Session duration - Non Compliant devices", description: "Duration in seconds an end-user spends on the DIaaS page when the device is Non-Compliant" }, // Average session duration with no issue found per day
};


export interface ReportData {
    metrics?: LineChartCardConfig[];
    type: ReportType;
    name: string;
    startDate: number;
    endDate: number;
    invetoryUserIdentities: number;
    invetoryUserSessionAvg: number;
    showVisibility: boolean;
    invetoryDeviceIdentities: number;
}

export interface InventoryDetailsObject {
    userIdentities: number;
    userSessionAvg: number;
    deviceIdentities: number;
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


export interface ReportDataPolicyIssuesGeneralData {
    reportDataPolicyIssues: ReportDataPolicyIssues[];
    totalIssues: number;
    resolvedIssue: number;
}


export interface ReportDataInventoryStatusItem {
    iconSrc: string;
    centerContentText: string;
    footerNumber: string;
    bgColor: string;
}

export interface NavItem {
    displayValue: string;
    route: string;
}



