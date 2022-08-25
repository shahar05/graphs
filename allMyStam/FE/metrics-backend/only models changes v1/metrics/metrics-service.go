package metrics

import (
	"eagle-server/shared/management/core"
	"fmt"
	"strings"

	"github.com/kataras/golog"
)

type Service struct {
	context *core.AppContext
}

func New(appContext *core.AppContext) *Service {
	return &Service{
		context: appContext,
	}
}

func (s *Service) CreateNewMetric(mm *MetricMetadata) error {
	insertIntoMetricsResult, err := s.context.Db.Exec(`
	INSERT INTO metrics 
	(metric_id , description , title, metric_order, type ) VALUES 
	($1, $2, $3, $4, $5)`,
		mm.MetricId, mm.Description, mm.Title, mm.Order, mm.Type)

	golog.Info(insertIntoMetricsResult)

	if err != nil {
		golog.Info(" Error INSERT INTO metrics")
		golog.Info(err)
		return err
	}

	var queryID string
	errOccurred := false

	for _, metricQuery := range mm.Queries {
		err := s.context.Db.QueryRow(`INSERT INTO graph_queries
		 (query , title , description ) VALUES ($1, $2, $3)
		 RETURNING query_id`, metricQuery.Query, metricQuery.Title, metricQuery.Description).Scan(&queryID)

		if err != nil {
			errOccurred = true
			golog.Info(" Error INSERT INTO graph_queries")
			golog.Info(err)
		}

		insertIntoMetricsQueriesResult, err := s.context.Db.Exec(`INSERT INTO metrics_queries (metric_id ,query_id ) VALUES ($1, $2)`, mm.MetricId, queryID)

		if err != nil {
			errOccurred = true
			golog.Info(" Error INSERT INTO metrics_queries")
			golog.Info(err)
		} else {
			golog.Info("Insert Into Metrics Queries Result: ")
			golog.Info(insertIntoMetricsQueriesResult)
		}

	}

	if errOccurred {
		golog.Info("Atomic Operation Has Failed Should delete those records from DB")
	}

	return err
}

func (s *Service) getMetricMetadata() ([]MetricMetadataFE, error) {
	var metricDataArray []MetricMetadataFE

	err := s.context.Db.Select(&metricDataArray, `SELECT m.metric_id, m.description, m.title, m.metric_order, m.type FROM metrics m`)

	return metricDataArray, err
}

func (s *Service) GetMetrics(tenantId int32, queryModel *GetMetricsRequestModel) []*MetricsEntity {
	golog.Info("Service.GetMetrics")
	metricsEntities := make([]*MetricsEntity, 0, len(queryModel.MetricsIds))

	golog.Info("bobo hagever")
	golog.Infof(" The Metrics Are: %s ", strings.Join(queryModel.MetricsIds, ","))

	rows, err := s.context.Db.Queryx(`
		SELECT m.metric_id, m.title, m.description, m.metric_order, m.type ,array_to_json(array_agg(row_to_json(q.*))) as queries
		FROM app.metrics as m
		INNER JOIN app.metrics_graph_queries as mq on mq.metric_id = m.metric_id
		INNER JOIN app.graph_queries as q on q.query_id = mq.query_id
		WHERE m.metric_id IN ($1)
		GROUP BY m.metric_id, m.title, m.description`,
		strings.Join(queryModel.MetricsIds, ","))

	if err != nil {
		golog.Info("bobo after Queryx")
		golog.Info(err)
		return nil
	}

	defer rows.Close()

	golog.Info("1")
	golog.Info(rows)
	golog.Info("2")
	golog.Info(fmt.Sprintf("rows: %v\n", rows.Rows))

	golog.Info(fmt.Sprintf("rows: %v\n", rows.Mapper))

	rowsColumns, rowsColumnsErr := rows.Columns()

	golog.Info("!!!BOBO!!!")

	golog.Info(fmt.Sprintf("rowsColumns: %s ", strings.Join(rowsColumns, " | ")))

	if rowsColumnsErr != nil {
		golog.Info(fmt.Sprintf(" rowsColumnsErr: %s", rowsColumnsErr.Error()))
	}

	metricsMetadata := make([]*MetricMetadata, 0)

	for rows.Next() {
		golog.Info("3")
		golog.Info(fmt.Sprintf("rows: %v\n", rows))

		var oi MetricMetadata
		err = rows.StructScan(&oi)
		if err != nil {
			golog.Infof("StructScan Error is: %s", err)
			golog.Error(err)
			return nil
		}

		metricsMetadata = append(metricsMetadata, &oi)
	}

	golog.Info(metricsMetadata)

	for i := range metricsMetadata {
		metricEntity := s.getMetric(metricsMetadata[i], queryModel, tenantId)
		metricsEntities = append(metricsEntities, metricEntity)
	}

	golog.Info("return metricsEntities")
	return metricsEntities
}

func NewMetricsEntity(metricMetadata *MetricMetadata) *MetricsEntity {
	return &MetricsEntity{
		MetricMetadata: metricMetadata,
		Metrics:        make([]*MetricEntity, 0, 5),
	}
}

func NewMetricEntity(mqm *MetricQueryModel) *MetricEntity {

	return &MetricEntity{
		Title:       *mqm.Title,
		Description: *mqm.Description,
		TimeSeries:  nil,
	}
}

func (s *Service) getMetric(metricMetadata *MetricMetadata, queryModel *GetMetricsRequestModel, tenantId int32) *MetricsEntity {
	golog.Info("getMetric")
	aggregationMilliSec := queryModel.AggregateSeconds * 1000 //Convert to milliseconds
	metricsEntity := NewMetricsEntity(metricMetadata)
	conn := s.context.Clickhouse.Conn
	var timeSeries []TimeSeriesEntity

	for _, mqm := range metricMetadata.Queries {
		err := conn.Select(&timeSeries, fmt.Sprintf(*mqm.Query, tenantId, aggregationMilliSec, queryModel.MinDate, queryModel.MaxDate))

		if err != nil {
			golog.Errorf("cannot produce metric: %s \t reason: %s", metricMetadata.Title, err)
			continue
		}

		metricsEntity.Metrics = append(metricsEntity.Metrics, NewMetricEntity(&mqm))
	}
	golog.Info("return metricsEntity")

	return metricsEntity
}

// func (m MetricMetadata) Value() (driver.Value, error) {
// 	return json.Marshal(m)
// }

// func (m *MetricMetadata) Scan(value interface{}) error {
// 	if value == nil {
// 		return nil
// 	}

// 	b, ok := value.([]byte)
// 	if !ok {
// 		return errors.New("type assertion to []byte failed")
// 	}

// 	return json.Unmarshal(b, &m)
// }

// func (m MetricQueryModel) Value() (driver.Value, error) {
// 	return json.Marshal(m)
// }

// func (m *MetricQueryModel) Scan(value interface{}) error {
// 	if value == nil {
// 		return nil
// 	}

// 	b, ok := value.([]byte)
// 	if !ok {
// 		return errors.New("type assertion to []byte failed")
// 	}
// 	return json.Unmarshal(b, &m)
// }
