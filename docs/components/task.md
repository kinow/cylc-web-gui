# Task

The task status icon implemented as an inline-block level object
which can sit in text.

## Example

::: demo
<div id="app" class="job_theme--default">
  <task status="held" />
  <!-- task status="queued" / -->
  <task status="waiting" />
  <task status="expired" />
  <task status="preparing" />
  <task status="submitted" />
  <task status="running" />
  <task status="succeeded" />
  <task status="failed" />
  <task status="submit-failed" />
  <task status="unknown" />
  <task status="" />
</div>
:::

## Source Code

<SourceCode>
<<< src/components/cylc/Task.vue
</SourceCode>
