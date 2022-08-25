package metrics

// %[1]d = Tenant
// %[2]d = Aggregation Time
// %[3]d = min Date
// %[4]d = max Date

// Sessions Done with Issues
const ISSUES_QUERY_TEMPLATE = `
SELECT
(intDiv(toUInt64(timestamp), %[2]d) * %[2]d) as Key,
toFloat64(COUNT()) as Value
FROM (
	SELECT DISTINCT ON (rootAuthSessionId)
	timestamp
	FROM default.diaas_events de
	WHERE tenantId in (%[1]d)
	AND eventType = 'diaas.auth.session.device.posture.done.with.issues'
)
GROUP BY Key
ORDER BY Key
`

// Sessions
const SESSIONS_QUERY_TEMPLATE = `
SELECT
(intDiv(toUInt64(timestamp), %[2]d) * %[2]d) as Key,
toFloat64(COUNT()) as Value
FROM (
    SELECT DISTINCT ON (rootAuthSessionId)
    timestamp
    FROM default.diaas_events de
    WHERE tenantId in (%[1]d)
)
GROUP BY Key
ORDER BY Key
`

/*
SELECT
(intDiv(toUInt32(datetime), 1800) * 1800) * 1000 as t,
COUNT(DISTINCT(rootAuthSessionId)) as `diaas sessions`
FROM default.diaas_events de
WHERE tenantId in (80)
AND date >= toDate(1645857478) AND date <= toDate(1646114763) AND datetime >= toDateTime(1645857478) AND datetime <= toDateTime(1646114763)
AND eventType = 'diaas.auth.session.started'
GROUP BY t
ORDER BY t
*/

const SESSIONS_QUERY_TEMPLATE_DATES = `
SELECT
(intDiv(toUInt64(timestamp), %[2]d) * %[2]d)  as Key,
COUNT(DISTINCT(rootAuthSessionId)) as Value
FROM diaas_events
WHERE tenantId in (%[1]d)
AND timestamp >= %[3]d AND timestamp <= %[4]d
AND eventType = 'diaas.auth.session.started'
GROUP BY Key
ORDER BY Key
`

//  --- AVG Session Duration with no issue found ---- it's not fluttering
const AVARAGE_DIAAS_QUERY_TEMPLATE = `
SELECT
(intDiv(toUInt64(timestamp), %[2]d) * %[2]d) as Key,
AVG(de2.timestamp - de.timestamp)/1000 as Value
FROM diaas_events de 
JOIN diaas_events de2 
	on de.rootAuthSessionId = de2.rootAuthSessionId 
	and de.authSessionTabId = de2.authSessionTabId 
	and de2.eventType = 'diaas.auth.session.device.posture.continued'
  	and de.eventType = 'diaas.auth.session.device.posture.started'
WHERE de.rootAuthSessionId not in (
  	SELECT rootAuthSessionId from default.diaas_events de3 
	WHERE de3.eventType = 'diaas.auth.session.device.posture.done.with.issues'
	AND tenantId in (%[1]d)
)
AND tenantId in (%[1]d)
GROUP BY Key
ORDER BY Key 
`

const RESOLVED_ISSUES = `
SELECT (intDiv(toUInt64(timestamp), %[2]d) * %[2]d) as Key, count() as Value
FROM 
(
    SELECT timestamp, tenantId
    FROM default.diaas_events de
    WHERE id in (
      SELECT eventId from remediation_finished rf
      WHERE rf.itemCompliance = 1
    )
)
WHERE tenantId in (%[1]d)
GROUP BY Key
ORDER BY Key
`

const APPROVED_BY_GRACE = `
SELECT
(intDiv(toUInt64(timestamp), %[2]d) * %[2]d)  as Key,
count(DISTINCT(rootAuthSessionId)) as Value
FROM
(
  SELECT * 
  FROM default.diaas_events de
  WHERE de.rootAuthSessionId IN (
	  SELECT rootAuthSessionId 
	  FROM diaas_events de2 
	  WHERE de2.eventType = 'diaas.auth.session.device.posture.done.with.issues'
  )
  AND rootAuthSessionId NOT IN    
  (
	  SELECT rootAuthSessionId 
	  FROM diaas_events de2 
	  WHERE de2.eventType = 'diaas.auth.session.device.posture.done.withot.issues'
  )
  AND de.eventType = 'diaas.auth.session.device.posture.continued'
)
WHERE tenantId in (%[1]d)
GROUP BY Key
ORDER BY Key
`

/*
  CREATE VIEW sessions_id_done_with_issues AS
  SELECT rootAuthSessionId
	  FROM diaas_events de2
	  WHERE de2.eventType = 'diaas.auth.session.device.posture.done.with.issues'

   CREATE VIEW sessions_id_done_without_issues AS
   SELECT rootAuthSessionId
	  FROM diaas_events de2
	  WHERE de2.eventType = 'diaas.auth.session.device.posture.done.withot.issues'


  create view continued_with_issues as
  SELECT *
  FROM diaas_events
  WHERE rootAuthSessionId IN sessions_id_done_with_issues
  AND rootAuthSessionId NOT IN sessions_id_done_without_issues
  AND eventType = 'diaas.auth.session.device.posture.continued'


SELECT (intDiv(toUInt32(datetime), 1800) * 1800) * 1000 as Key count(DISTINCT(rootAuthSessionId)) as Value
FROM continued_with_issues
WHERE tenantId in (80)
GROUP BY Key
ORDER BY Key

*/
