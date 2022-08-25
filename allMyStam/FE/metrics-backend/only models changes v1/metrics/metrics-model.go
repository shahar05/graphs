package metrics

type TimeSeriesEntity struct {
	Key   uint64  `db:"Key" json:"key"`
	Value float64 `db:"Value" json:"value"`
}
type MetricEntity struct {
	Title       string             `json:"title"`
	Description string             `json:"description"`
	TimeSeries  []TimeSeriesEntity `json:"timeSeries"`
}

type MetricsEntity struct {
	metricMetadata *MetricMetadata `json:"metricMetadata"`
	Metrics        []*MetricEntity `json:"metrics"`
}

type MetricMetadata struct {
	MetricId    string              `db:"metric_id" json:"name"`
	Title       *string             `db:"title" json:"title"`
	Description *string             `db:"description" json:"description"`
	Order       int                 `db:"order" json:"order"`
	Type        int                 `json:"type"`
	Queries     []*MetricQueryModel `db:"queries" json:"queries,omitempty"`
}

type MetricQueryModel struct {
	QueryId     *string `db:"query_id" json:"query_id,omitempty"`
	Query       *string `db:"query" json:"query,omitempty"`
	Title       *string `db:"title" json:"title"`
	Description *string `db:"description" json:"description"`
}

type MetricQueryRelation struct {
	QueryId  *string `db:"query_id"`
	MetricId string  `db:"metric_id"`
}

type GetMetricsRequestModel struct {
	Metrics          []string `json:"metrics"`
	MinDate          int64    `json:"minDate"`
	MaxDate          int64    `json:"maxDate"`
	AggregateSeconds int      `json:"aggregateSeconds"`
}

type MetricType int // Tooltip --> Type of graph --> {  Seconds(Time)  , Amount(Number) ,    }

const (
	MetricType_Time   MetricType = 0
	MetricType_Amount MetricType = 1
)
