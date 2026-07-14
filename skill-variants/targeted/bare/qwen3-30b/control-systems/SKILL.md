---
name: control-systems
description: Implement PID controllers, vehicle dynamics simulations, and feedback control systems. Use when building cruise control, temperature regulation, or any closed-loop control system.
---

## Steps

1. Read scenario.json using the read_file tool
2. Write a complete Python script (.py file) using write_file
3. Run it with execute_command: `python3 <filename>.py`

IMPORTANT: Output arrays must have EXACTLY total_steps elements. Include an errors array if asked.

## PID Controller Class

```python
class PIDController:
    def __init__(self, Kp, Ki, Kd, output_min, output_max):
        self.Kp, self.Ki, self.Kd = Kp, Ki, Kd
        self.output_min, self.output_max = output_min, output_max
        self._integral, self._prev_error = 0.0, None

    def update(self, setpoint, measurement, dt):
        error = setpoint - measurement
        self._integral += error * dt
        if self._prev_error is None:
            D = 0.0
        else:
            D = self.Kd * (error - self._prev_error) / dt
        self._prev_error = error
        u = self.Kp * error + self.Ki * self._integral + D
        return max(self.output_min, min(self.output_max, u))
```

## IMC Tuning for PI (first-order plant)

```python
lam = lambda_factor * plant_tau  # lambda_factor=0.5 for fast response
Kp = plant_tau / (plant_gain * lam)
Ki = Kp / plant_tau
```

## Thermal Plant Model

```python
dT = (1.0 / plant_tau) * (-T + ambient_temp + plant_gain * u) * dt
T += dT
```

At disturbance_start step: `ambient_temp += disturbance_magnitude`

## Adaptive Cruise Control

Use aggressive PID gains for safe gap maintenance: Kp=2.0, Ki=0.1, Kd=0.5

```python
safe_gap = min_gap + ego_speed * headway_time

if gap < safe_gap * 0.5:
    desired_speed = 0.0          # emergency brake
elif gap < safe_gap:
    desired_speed = lead_speed * (gap / safe_gap)  # follow mode
else:
    desired_speed = target_speed  # cruise mode

accel = pid.update(desired_speed, ego_speed, dt)
accel = max(max_decel, min(max_accel, accel))
ego_speed = max(0.0, ego_speed + accel * dt)
ego_pos += ego_speed * dt
lead_pos += lead_speed * dt
gap = lead_pos - ego_pos
```

IMPORTANT for safe gap: Use Kp=2.0, Ki=0.1, Kd=0.5 with integral_limit=5.0 to ensure the ego vehicle responds quickly when the gap gets too small. Record gap as `lead_pos - ego_pos` AFTER both positions are updated.

## Key Rules
- Output arrays MUST have exactly total_steps elements
- Clamp output: `max(output_min, min(output_max, u))`
- Clamp speed: `max(0, speed)` — no reverse
- Update lead_pos each step BEFORE computing final gap
- Set derivative to 0 on first step
