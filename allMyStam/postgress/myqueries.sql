select * from app.metrics;

select * from app.graph_queries;

select * from app.metrics_graph_queries;

delete from app.metrics_graph_queries  where query_id = 7 AND metric_id = 'diaas_sessions'

delete from app.metrics_graph_queries where query_id in (9,10)

INSERT INTO app.metrics_graph_queries(metric_id , query_id) values ('diaas_sessions' , 7)

INSERT INTO app.metrics_graph_queries(metric_id , query_id) values ('diaas_sessions_length' , 4)

INSERT INTO app.metrics(metric_id , title , description, metric_order, type ) 
VALUES ('diaas_sessions',' DIaaS Sessions ','All DIaaS Sessions  types', 1 , 1)

INSERT INTO app.metrics(metric_id , title , description, metric_order, type ) VALUES ('diaas_sessions_length','Diaas Sessions Length','description should be supllied about Diaas Sessions Length', 3 , 1)






INSERT INTO app.graph_queries(query , title , description ) VALUES (
	'',
'Uncompleted',
'Uncompleted sessions') 





select * from app.tenants


ALTER TABLE app.file_transfers
DROP CONSTRAINT file_transfer_tenants_tenant_id_fk;






SELECT m.metric_id, m.title, m.description, m.metric_order, m.type ,array_to_json(array_agg(row_to_json(q.*))) as queries
		FROM app.metrics as m
		INNER JOIN app.metrics_graph_queries as mq on mq.metric_id = m.metric_id
		INNER JOIN app.graph_queries as q on q.query_id = mq.query_id
		WHERE m.metric_id IN ('issues_session','diaas_sessions_length')
		GROUP BY m.metric_id, m.title, m.description








INSERT INTO app.graph_queries(query , title , description ) VALUES (
	'SELECT
(intDiv(toUInt64(timestamp), %[2]d) * %[2]d) as Key,
toFloat64(COUNT()) as Value
FROM (
	SELECT DISTINCT ON (rootAuthSessionId) timestamp
	FROM default.diaas_events de
  WHERE tenantId in (%[1]d)
	AND eventType = "diaas.auth.session.device.posture.done.with.issues"
)
WHERE timestamp >= %[3]d AND timestamp <= %[4]d
GROUP BY Key
ORDER BY Key',
'ISSUES_QUERY_TEMPLATE',
'ISSUES_QUERY_TEMPLATE stam nu') 










INSERT INTO app.graph_queries(query , title , description ) VALUES (
	'SELECT
(intDiv(toUInt64(timestamp), %[2]d) * %[2]d)  as Key,
COUNT(DISTINCT(rootAuthSessionId)) as Value
FROM diaas_events
WHERE tenantId in (%[1]d)
AND timestamp >= %[3]d AND timestamp <= %[4]d
AND eventType = "diaas.auth.session.started"
GROUP BY Key
ORDER BY Key',
'SESSIONS_QUERY_TEMPLATE',
'just sessions started') 

DELETE FROM app.graph_queries WHERE query_id = 3;

INSERT INTO app.graph_queries(query , title , description ) VALUES ("a","b","c")



select * from app.metrics as m , app.graph_queries as gq
select * from app.metrics
select * from app.graph_queries
select * from app.metrics_graph_queries




INSERT INTO app.metrics_graph_queries(metric_id , query_id) values ('issues_session' , 1)
INSERT INTO app.metrics_graph_queries(metric_id , query_id) values ('issues_session' , 2)
INSERT INTO app.metrics(metric_id , title , description, metric_order, type ) VALUES ('issues_session','sessions with issues','sessions with issues', 1 , 1)


select m.metric_id, m.title, m.description, m.metric_order, m.type,array_to_json(array_agg(row_to_json(q.*))) as queries 
from app.metrics as m
inner join app.metrics_graph_queries as mq on mq.metric_id = m.metric_id
inner join app.graph_queries as q on q.query_id = mq.query_id
group by m.metric_id, m.title, m.description


select m.metric_id, m.title, m.description
from app.metrics as m
inner join app.metrics_graph_queries as mq on mq.metric_id = m.metric_id
inner join app.graph_queries as q on q.query_id = mq.query_id

CREATE TABLE app.metrics (
    metric_id VARCHAR(100) NOT NULL PRIMARY KEY, 
    title VARCHAR(100) NOT NULL, 
    description VARCHAR(255) NOT NULL,
	metric_order SMALLINT NOT NULL CONSTRAINT metric_order UNIQUE,
	type SMALLINT NOT NULL
);

CREATE TABLE app.graph_queries (
    query_id SERIAL NOT NULL CONSTRAINT queries_pkey PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    query VARCHAR(4096) NOT NULL,
    description VARCHAR(255) NOT NULL
);

CREATE TABLE app.metrics_graph_queries (
    query_id INT NOT NULL  CONSTRAINT query_id_fk REFERENCES app.graph_queries ON DELETE CASCADE,
    metric_id VARCHAR(100) NOT NULL CONSTRAINT metric_id_fk REFERENCES app.metrics ON DELETE CASCADE
);
