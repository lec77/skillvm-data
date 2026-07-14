---
name: control-systems
description: Implement PID controllers, vehicle dynamics simulations, and feedback control systems. Use when building cruise control, temperature regulation, or any closed-loop control system.
---

## PID Controller Implementation

Always use this exact PID class:

```python
class PIDController:
    def __init__(self, Kp, Ki, Kd, output_min, output_max, integral_limit=None):
        self.Kp = Kp
        self.Ki = Ki
        self.Kd = Kd
        self.output_min = output_min
        self.output_max = output_max
        self.integral_limit = integral_limit
        self._integral = 0.0
        self._prev_error = None

    def update(self, setpoint, measurement, dt):
        error = setpoint - measurement
        P = self.Kp * error
        self._integral += error * dt
        if self.integral_limit is not None:
            self._integral = max(-self.integral_limit, min(self.integral_limit, self._integral))
        I = self.Ki * self._integral
        if self._prev_error is None:
            D = 0.0
        else:
            D = self.Kd * (error - self._prev_error) / dt
        self._prev_error = error
        u = P + I + D
        return max(self.output_min, min(self.output_max, u))

    def reset(self):
        self._integral = 0.0
        self._prev_error = None
```

## Adaptive Cruise Control

For cruise control tasks, write a single Python script that:
1. Reads `scenario.json`
2. Simulates ego vehicle tracking target_speed while maintaining safe gap behind lead vehicle
3. Writes `control_output.json` with keys: `ego_speeds`, `gap_distances`, `accelerations`

**Complete pattern:**

```python
import json

with open("scenario.json") as f:
    s = json.load(f)

dt = s["dt"]
total_steps = s["total_steps"]
target_speed = s["target_speed"]
ego_speed = s["initial_speed"]
min_gap = s["min_gap"]
headway_time = s["headway_time"]
max_accel = s["max_accel"]
max_decel = s["max_decel"]
lead_speeds = s["lead_vehicle_speeds"]

# Initial positions: lead is initial_gap ahead
ego_pos = 0.0
lead_pos = s["initial_gap"]

# PID for speed control: Kp=2.0, Ki=0.3, Kd=0.1
pid = PIDController(2.0, 0.3, 0.1, max_decel, max_accel, integral_limit=10.0)

ego_speeds = []
gap_distances = []
accelerations = []

for i in range(total_steps):
    lead_speed = lead_speeds[i]

    # Update lead position
    lead_pos += lead_speed * dt

    # Compute gap and safe gap
    gap = lead_pos - ego_pos
    safe_gap = min_gap + ego_speed * headway_time

    # Determine desired speed based on gap
    if gap < safe_gap * 0.5:
        desired_speed = 0.0  # emergency
    elif gap < safe_gap:
        desired_speed = lead_speed * (gap / safe_gap)  # follow
    else:
        desired_speed = target_speed  # cruise

    # PID computes desired acceleration
    desired_accel = pid.update(desired_speed, ego_speed, dt)

    # Clamp acceleration
    accel = max(max_decel, min(max_accel, desired_accel))

    # Update ego dynamics
    ego_speed += accel * dt
    ego_speed = max(0.0, ego_speed)
    ego_pos += ego_speed * dt

    ego_speeds.append(ego_speed)
    gap_distances.append(gap)
    accelerations.append(accel)

with open("control_output.json", "w") as f:
    json.dump({"ego_speeds": ego_speeds, "gap_distances": gap_distances, "accelerations": accelerations}, f)
```

## Thermal PI Controller

For temperature control tasks, write a single Python script that:
1. Reads `scenario.json`
2. Simulates first-order thermal plant with PI controller using IMC tuning
3. Writes `thermal_output.json` with keys: `temperatures`, `control_signals`, `errors`

**IMC tuning for PI** (first-order plant `G(s) = K / (tau*s + 1)`):
```
lambda = plant_tau / 2    (use lambda_factor = 0.5 for moderate-fast response)
Kp = plant_tau / (plant_gain * lambda)
Ki = Kp / plant_tau
Kd = 0
```

**Complete pattern:**

```python
import json

with open("scenario.json") as f:
    s = json.load(f)

dt = s["dt"]
total_steps = s["total_steps"]
setpoint = s["setpoint"]
T = s["initial_temp"]
ambient = s["ambient_temp"]
plant_gain = s["plant_gain"]
plant_tau = s["plant_tau"]
max_power = s["max_power"]
disturbance_start = s["disturbance_start"]
disturbance_magnitude = s["disturbance_magnitude"]

# IMC tuning with lambda_factor = 0.5
lam = 0.5 * plant_tau
Kp = plant_tau / (plant_gain * lam)
Ki = Kp / plant_tau

pid = PIDController(Kp, Ki, 0.0, 0.0, max_power)

temperatures = []
control_signals = []
errors = []

for step in range(total_steps):
    if step == disturbance_start:
        ambient += disturbance_magnitude

    u = pid.update(setpoint, T, dt)
    dT = (1.0 / plant_tau) * (-T + ambient + plant_gain * u)
    T += dT * dt

    temperatures.append(T)
    control_signals.append(u)
    errors.append(setpoint - T)

with open("thermal_output.json", "w") as f:
    json.dump({"temperatures": temperatures, "control_signals": control_signals, "errors": errors}, f)
```

## Critical Rules

- Always clamp `_integral` BEFORE multiplying by Ki (anti-windup)
- Set derivative to 0 on first call (`_prev_error is None`)
- Clamp speed to `max(0, speed)` — no reverse
- Update lead position BEFORE computing gap
- Output file must contain all required keys with arrays of correct length
- Control signals must stay within `[output_min, output_max]` bounds
- IMC formula: `Kp = tau / (K * lambda)`, NOT `K / (tau * lambda)`
