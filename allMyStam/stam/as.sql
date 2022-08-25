Succeed

SELECT * FROM
(SELECT (toUnixTimestamp(arrayJoin(timeSlots(toDateTime('%[5]s'), toUInt32(((%[4]d - %[3]d) )), %[2]d))) * 1000)   AS Key) as a_times
LEFT JOIN (
SELECT
( (intDiv(toUInt64(timestamp), %[2]d * 1000 ) * %[2]d * 1000 )) as Key,
toFloat64(COUNT()) as Value
FROM (
	SELECT DISTINCT ON (rootAuthSessionId)
	timestamp
	FROM default.diaas_events de
  WHERE tenantId in (%[1]d)
	AND eventType = 'diaas.auth.session.device.posture.done.without.issues'
)
WHERE timestamp >= (%[3]d * 1000) AND timestamp <= (%[4]d * 1000)
GROUP BY Key
ORDER BY Key) as b_session_no_issues
using Key






Issues Found

SELECT * FROM
(SELECT (toUnixTimestamp(arrayJoin(timeSlots(toDateTime('%[5]s'), toUInt32(((%[4]d - %[3]d) )), %[2]d))) * 1000)   AS Key) as a_times
LEFT JOIN
(
SELECT
(intDiv(toUInt64(timestamp), %[2]d * 1000) *%[2]d * 1000) as Key,
AVG(de2.timestamp - de.timestamp)/1000 as Value

FROM diaas_events de 

JOIN diaas_events de2 
	on de.rootAuthSessionId = de2.rootAuthSessionId 
	and de.authSessionTabId = de2.authSessionTabId 
	and de2.eventType = 'diaas.auth.session.device.posture.continued'
  and de.eventType = 'diaas.auth.session.device.posture.started'

WHERE de.rootAuthSessionId in (

  SELECT rootAuthSessionId from default.diaas_events de3 
	WHERE de3.eventType = 'diaas.auth.session.device.posture.done.with.issues'
	AND tenantId in (%[1]d)

)
AND tenantId in (%[1]d) 
AND timestamp >= (%[3]d  * 1000) AND timestamp <= (%[4]d  * 1000)
GROUP BY Key
ORDER BY Key 
) as query
using Key


issues
SELECT * FROM
(SELECT (toUnixTimestamp(arrayJoin(timeSlots(toDateTime('%[5]s'), toUInt32(((%[4]d - %[3]d) )), %[2]d))) * 1000)   AS Key) as a_times
LEFT JOIN (
SELECT
( (intDiv(toUInt64(timestamp), %[2]d * 1000 ) * %[2]d * 1000 )) as Key,
toFloat64(COUNT()) as Value
FROM (
	SELECT DISTINCT ON (rootAuthSessionId)
	timestamp
	FROM default.diaas_events de
  WHERE tenantId in (%[1]d)
	AND eventType = 'diaas.auth.session.device.posture.done.with.issues'
)
WHERE timestamp >= (%[3]d * 1000) AND timestamp <= (%[4]d * 1000)
GROUP BY Key
ORDER BY Key) as b_session_issues
using Key


Sessions-started

SELECT * FROM
(SELECT (toUnixTimestamp(arrayJoin(timeSlots(toDateTime('%[5]s'), toUInt32(((%[4]d - %[3]d))), %[2]d ))) * 1000)   AS Key) as a_times
LEFT JOIN (
SELECT
(intDiv(toUInt64(timestamp),  %[2]d * 1000 ) *  %[2]d  * 1000 )  as Key,
COUNT(DISTINCT(rootAuthSessionId)) as Value
FROM diaas_events
WHERE tenantId in ( %[1]d)
AND timestamp >=  (%[3]d  * 1000) AND timestamp <=  (%[4]d  * 1000)
AND eventType = 'diaas.auth.session.started'
GROUP BY Key
ORDER BY Key
) as b_session_issues
using Key




No-Issues-Found

SELECT * FROM
(SELECT (toUnixTimestamp(arrayJoin(timeSlots(toDateTime('%[5]s'), toUInt32(((%[4]d - %[3]d) )), %[2]d))) * 1000)   AS Key) as a_times
LEFT JOIN
(
SELECT
(intDiv(toUInt64(timestamp), %[2]d * 1000) * %[2]d * 1000) as Key,
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
AND timestamp >= (%[3]d  * 1000) AND timestamp <= (%[4]d  * 1000)
GROUP BY Key
ORDER BY Key 
) as query
using Key