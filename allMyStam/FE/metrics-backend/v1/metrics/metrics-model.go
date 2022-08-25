package metrics

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

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
	MetricMetadata *MetricMetadata `json:"metricMetadata"`
	Metrics        []*MetricEntity `json:"metrics"`
}

type MetricType int // Tooltip --> Type of graph --> {  Seconds(Time)  , Amount(Number) ,    }

const (
	MetricType_Time   MetricType = 0
	MetricType_Amount MetricType = 1
)

type MetricMetadataFE struct {
	MetricId    string `db:"metric_id" json:"name"`
	Title       string `db:"title" json:"title"`
	Description string `db:"description" json:"description"`
	Order       int    `db:"metric_order" json:"order"`
	Type        int    `db:"type" json:"type"`
}

type MetricMetadata struct {
	MetricMetadataFE
	Queries []MetricQueryModel `db:"queries" json:"queries,omitempty"`
}

// QueriesRaw  interface{} `db:"queries"`
// QueriesRaw  *json.RawMessage   `db:"queries"`

func (m MetricMetadata) Value() (driver.Value, error) {
	return json.Marshal(m)
}

func (m *MetricMetadata) Scan(value interface{}) error {
	if value == nil {
		return nil
	}

	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(b, &m)
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
	MetricsIds       []string `json:"metrics"`
	MinDate          int64    `json:"minDate"`
	MaxDate          int64    `json:"maxDate"`
	AggregateSeconds int      `json:"aggregateSeconds"`
}
