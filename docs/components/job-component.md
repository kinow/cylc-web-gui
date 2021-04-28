# Job component

The job status icon implemented as an inline-block level object
which can sit in text.

## Example

::: demo
<div id="app" class="job_theme--default">
  <job status="submitted" />
  <job status="running" />
  <job status="succeeded" />
  <job status="failed" />
  <job status="submit-failed" />
</div>
:::

## Source Code

<SourceCode>
<<< src/components/cylc/Job.vue
</SourceCode>
