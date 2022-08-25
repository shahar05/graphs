curl -sLX POST 'http://localhost:8010/admin/tenants/create' \
--header 'Content-Type: application/json' \
--data-raw '{
	"name": "a9"
}'





template: `
<mat-card class="line-graph d-flex flex-column" [ngClass]="config.graph.size" >
  <div class="header">
    <div class="bold-header">
      <span class="text">{{header.text}} - </span>
      <span class="bold">{{header.count}} {{header.countText}}</span>
    </div>
    <div class="sub-header">
        {{header.subText}}
    </div>
  </div>
  <line-graph *ngIf="graphHasData else noDataTemplate" [config]="graphData" ></line-graph>
</mat-card>



<ng-template #noDataTemplate >
    No Data 
</ng-template>

`,