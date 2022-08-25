CREATE TABLE metrics (
    metric_id VARCHAR(100) NOT NULL PRIMARY KEY, 
    title VARCHAR(100) NOT NULL, 
    description VARCHAR(255) NOT NULL,
    metric_order SMALLINT NOT NULL CONSTRAINT metric_order UNIQUE
    type SMALLINT NOT NULL
);


CREATE TABLE graph_queries (
    query_id SERIAL NOT NULL CONSTRAINT queries_pkey PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    query VARCHAR(4096) NOT NULL,
    description VARCHAR(255) NOT NULL,
);


CREATE TABLE metrics_graph_queries (
    query_id INT NOT NULL  CONSTRAINT query_id_fk REFERENCES graph_queries ON DELETE CASCADE,
    metric_id VARCHAR(100) NOT NULL CONSTRAINT metric_id_fk REFERENCES metrics ON DELETE CASCADE
);




metric_id | query_id
    1     |   A
    1     |   B
    1     |   C
    1     |   D


type CreateMetricModel struct {
	MetricId    string              `db:"metric_id" json:"name"`
	Title       *string             `db:"title" json:"title"`
	Description *string             `db:"description" json:"description"`
	Queries     []*MetricQueryModel `json:"query, omitempty"`
}

type MetricQueryModel struct {
	QueryId     *string `db:"query_id" json:"query_id,omitempty"`
	Query       *string `db:"query" json:"query"`
	Title       *string `db:"title" json:"title"`
	Description *string `db:"description" json:"description"`
}
