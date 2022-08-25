INSERT INTO
    queries(query, title, description)
VALUES
    ($ 1, $ 2, $ 3)
select
    m.metirc_id,
    m.title,
    m.description,
    array_to_json(array_agg(row_to_json(q.*)))
from
    app.metrics as m
    inner join app.metrics_graph_queries as mq on mq.metric_id = m.metric_id
    inner join app.graph_queries as q on q.query_id = mq.query_id
group by
    m.metirc_id,
    m.title,
    m.description / / err := s.context.Db.Select(
        & metricsModel,
        / / `SELECT m.metric_id, m.metric_description , m.title
	// 	 FROM metrics m
	// 	 WHERE m.metric_id IN ($1)`,
        / / queryModel.Metrics
    )