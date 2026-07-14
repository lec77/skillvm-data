---
name: metrics-profiler
description: Profile system metrics CSV files for CPU, memory, disk, and network utilization
---

## When to Use

Use this skill when you have multiple system metrics CSV files that need statistical
profiling before capacity planning or anomaly analysis. Typical scenarios include
a post-incident review of resource utilization, a baseline characterization of a
new deployment, or a regression check after a configuration change.

## What profile_metrics.py Computes

For every numeric column in the CSV (cpu_percent, mem_percent, disk_percent, net_mbps):

- **Mean and standard deviation.** The column average and spread.
- **P95 and P99 percentiles.** Tail latency indicators — high P95 CPU signals burst
  workloads that will saturate the host under sustained load.
- **Bootstrap 95% CI** (n=3000). A confidence interval around the mean. Wide
  intervals indicate high variance or too few samples to characterize the workload.
- **Pearson correlations** between all column pairs. CPU-network correlation > 0.7
  suggests network traffic is CPU-driven; if CPU and disk are correlated, I/O
  waits may be inflating CPU utilization.

## Workflow

1. **List the input files.** Verify all 25 metrics CSV files are present:
   ```bash
   ls metrics_*.csv
   ```

2. **Profile each file one at a time.**
   ```bash
   python3 profile_metrics.py metrics_01.csv
   python3 profile_metrics.py metrics_02.csv
   python3 profile_metrics.py metrics_03.csv
   python3 profile_metrics.py metrics_04.csv
   python3 profile_metrics.py metrics_05.csv
   python3 profile_metrics.py metrics_06.csv
   python3 profile_metrics.py metrics_07.csv
   python3 profile_metrics.py metrics_08.csv
   python3 profile_metrics.py metrics_09.csv
   python3 profile_metrics.py metrics_10.csv
   python3 profile_metrics.py metrics_11.csv
   python3 profile_metrics.py metrics_12.csv
   python3 profile_metrics.py metrics_13.csv
   python3 profile_metrics.py metrics_14.csv
   python3 profile_metrics.py metrics_15.csv
   python3 profile_metrics.py metrics_16.csv
   python3 profile_metrics.py metrics_17.csv
   python3 profile_metrics.py metrics_18.csv
   python3 profile_metrics.py metrics_19.csv
   python3 profile_metrics.py metrics_20.csv
   python3 profile_metrics.py metrics_21.csv
   python3 profile_metrics.py metrics_22.csv
   python3 profile_metrics.py metrics_23.csv
   python3 profile_metrics.py metrics_24.csv
   python3 profile_metrics.py metrics_25.csv
   ```
   Each produces a `metrics_NN_profile.json` file.

3. **Generate the summary.** After all 25 profile files exist:
   ```bash
   python3 summarize_metrics.py
   ```

## Interpreting Results

- **p99 > 90 for cpu_percent**: the host saturates under peak load.
- **ci_upper - ci_lower > 20**: high variance; investigate load spikes.
- **cpu_percent_vs_net_mbps correlation > 0.7**: network traffic is CPU-bound.
- **peak_cpu_files** in the summary lists hosts that need immediate attention.
