---
name: control-systems
description: Implement PID controllers, vehicle dynamics simulations, and feedback control systems. Use when building cruise control, temperature regulation, or any closed-loop control system.
---

## PID Controller

Always write a complete Python script. Use this PID class:

```python
class PIDController:
    def __init__(self, Kp, Ki, Kd, output_min, output_max, integral_limit=None):
        self.Kp, self.Ki, self.Kd = Kp, Ki, Kd
        self.output_min, self.output_max = output_min, output_max
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
```

## IMC Tuning (First-Order Plant)

For `G(s) = K / (tau*s + 1)`, use lambda_factor (default 0.5 for moderate-fast):
```python
lam = lambda_factor * plant_tau
Kp = plant_tau / (plant_gain * lam)   # NOT K/(tau*lambda)
Ki = Kp / plant_tau
Kd = 0  # pure PI for first-order
```

## Thermal Plant Simulation Pattern

Complete script for first-order thermal system with PI control:

```python
import json

with open("scenario.json") as f:
    s = json.load(f)

T = s["initial_temp"]
ambient = s["ambient_temp"]

# IMC tuning: lambda = plant_tau * 0.5
lam = 0.5 * s["plant_tau"]
Kp = s["plant_tau"] / (s["plant_gain"] * lam)
Ki = Kp / s["plant_tau"]
pid = PIDController(Kp, Ki, 0.0, 0.0, s["max_power"])

temperatures, control_signals, errors = [], [], []
for step in range(s["total_steps"]):
    if step == s["disturbance_start"]:
        ambient += s["disturbance_magnitude"]
    u = pid.update(s["setpoint"], T, s["dt"])
    dT = (1.0 / s["plant_tau"]) * (-T + ambient + s["plant_gain"] * u)
    T += dT * s["dt"]
    temperatures.append(T)
    control_signals.append(u)
    errors.append(s["setpoint"] - T)

with open("thermal_output.json", "w") as f:
    json.dump({"temperatures": temperatures, "control_signals": control_signals, "errors": errors}, f)
```

## Adaptive Cruise Control Pattern

Complete script for ego vehicle following lead with safe gap:

```python
import json

with open("scenario.json") as f:
    s = json.load(f)

ego_speed = s["initial_speed"]
ego_pos = 0.0
lead_pos = s["initial_gap"]

pid = PIDController(2.0, 0.3, 0.1, s["max_decel"], s["max_accel"], integral_limit=10.0)

ego_speeds, gap_distances, accelerations = [], [], []
for i in range(s["total_steps"]):
    lead_speed = s["lead_vehicle_speeds"][i]
    lead_pos += lead_speed * s["dt"]
    gap = lead_pos - ego_pos
    safe_gap = s["min_gap"] + ego_speed * s["headway_time"]

    # Mode selection
    if gap < safe_gap * 0.5:
        desired_speed = 0.0                            # emergency
    elif gap < safe_gap:
        desired_speed = lead_speed * (gap / safe_gap)  # follow
    else:
        desired_speed = s["target_speed"]              # cruise

    accel = max(s["max_decel"], min(s["max_accel"], pid.update(desired_speed, ego_speed, s["dt"])))
    ego_speed = max(0.0, ego_speed + accel * s["dt"])
    ego_pos += ego_speed * s["dt"]

    ego_speeds.append(ego_speed)
    gap_distances.append(gap)
    accelerations.append(accel)

with open("control_output.json", "w") as f:
    json.dump({"ego_speeds": ego_speeds, "gap_distances": gap_distances, "accelerations": accelerations}, f)
```

## Critical Rules

- Clamp `_integral` BEFORE multiplying by Ki (anti-windup)
- First-call derivative = 0 (guard `_prev_error is None`)
- `speed = max(0, speed)` — no reverse driving
- Update lead position BEFORE computing gap
- `Kp = tau / (K * lambda)`, NOT `K / (tau * lambda)`
- Output all required keys with arrays of correct length
