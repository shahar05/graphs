package metrics

import (
	"eagle-server/management/search"
	"eagle-server/shared/general"
	"eagle-server/shared/management/core"

	"github.com/kataras/golog"
	"github.com/kataras/iris/v12"
)

func RegisterMetricsRouter(server *iris.Application, context *core.AppContext) {
	svc := New(context)

	a := server.Party(core.AppRoutePrefix + "/metrics")
	{
		a.Post("/", func(ctx iris.Context) { // Get Metrics
			golog.Info("Get Metrics")
			tenantID := general.GetTenantID(ctx)
			queryModel := &GetMetricsRequestModel{}

			if !core.ReadAndValidate(ctx, queryModel) {
				golog.Errorf("incorrect query model")
				return
			}

			golog.Debugf("handling api call /m/metrics %+v", queryModel)

			met := svc.GetMetrics(tenantID, queryModel)
			res := search.QueryResponseModel{
				Total: len(met),
				Items: met,
			}

			golog.Debugf("result for /m/metrics with %+v is %+v", queryModel, res)

			ctx.JSON(res)

		})

		a.Get("/metadata", func(ctx iris.Context) { // Get All MetaData of Metrics
			golog.Info("Get Metric MetaData")
			metricsModel, err := svc.getMetricMetadata()

			if err != nil {
				golog.Error(err)
				return
			}

			ctx.JSON(metricsModel)
		})

		a.Post("/metadata", func(ctx iris.Context) { // Create Metric
			golog.Info("Create Metric Metadata")
			createMetricModel := &MetricMetadata{}
			if !core.ReadAndValidate(ctx, createMetricModel) {
				return
			}

			err := svc.CreateNewMetric(createMetricModel)

			ctx.JSON(err)
		})

	}
}
