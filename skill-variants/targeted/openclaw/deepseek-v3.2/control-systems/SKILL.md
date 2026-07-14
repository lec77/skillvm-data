---
name: control-systems
description: Implement PID controllers, vehicle dynamics simulations, and feedback control systems. Use when building cruise control, temperature regulation, or any closed-loop control system.
---

## When to Use

Use this skill when you need to:
- Build a feedback controller that drives a plant output to a desired setpoint
- Simulate vehicle motion or thermal systems over discrete timesteps
- Tune PID/PI gains systematically from plant parameters
- Implement adaptive control modes (cruise, follow, emergency, etc.)

---

## Discrete-Time PID Controller

A PID controller computes a control signal `u` from the error `e = setpoint - measurement`.

### Python Class Pattern

```python
class PIDController:
    def __init__(self, Kp, Ki, Kd, output_min, output_max, integral_limit=None):
        self.Kp = Kp
        self.Ki = Ki
        self.Kd = Kd
        self.output_min = output_min
        self.output_max = output_max
        self.integral_limit = integral_limit  # anti-windup clamp on integral
        self._integral = 0.0
        self._prev_error = None

    def update(self, setpoint, measurement, dt):
        error = setpoint - measurement
        # Proportional
        P = self.Kp * error
        # Integral with anti-windup
        self._integral += error * dt
        if self.integral_limit is not None:
            self._integral = max(-self.integral_limit,
                                 min(self.integral_limit, self._integral))
        I = self.Ki * self._integral
        # Derivative (skip on first call)
        if self._prev_error is None:
            D = 0.0
        else:
            D = self.Kd * (error - self._prev_error) / dt
        self._prev_error = error
        # Sum and clamp output
        u = P + I + D
        return max(self.output_min, min(self.output_max, u))

    def reset(self):
        self._integral = 0.0
        self._prev_error = None
```

Key implementation notes:
- **Anti-windup**: clamp `_integral` before multiplying by `Ki` to prevent runaway accumulation when the output saturates
- **Output clamping**: always clamp the final `u` to `[output_min, output_max]`
- **First-step derivative**: set `D = 0` when `_prev_error` is `None` to avoid a derivative spike

---

## Vehicle Dynamics (Kinematic Model)

For longitudinal (1-D) motion at each timestep `dt`:

```python
# Apply acceleration limit
accel = max(max_decel, min(max_accel, desired_accel))
# Euler integration
speed += accel * dt
speed = max(0.0, speed)          # no reverse driving
position += speed * dt
```

**Gap tracking** (ego vehicle following a lead vehicle):

```python
# lead_position advances by lead_speed * dt each step
lead_position += lead_speed * dt
gap = lead_position - ego_position
```

---

## Safe Following Distance (Time-Headway Model)

```python
safe_gap = min_gap + speed * headway_time
```

- `min_gap` — absolute minimum spacing (metres), e.g. 10 m
- `headway_time` — seconds of reaction/braking buffer, e.g. 1.5 s
- At 25 m/s the safe gap is `10 + 25*1.5 = 47.5 m`

### Adaptive Cruise Control Mode Logic

```python
EMERGENCY_RATIO = 0.5   # gap < 50% of safe → emergency brake
FOLLOW_RATIO    = 1.0   # gap < 100% of safe → follow mode
                        # otherwise → cruise (track target speed)

if gap < safe_gap * EMERGENCY_RATIO:
    mode = "emergency"
    desired_speed = 0.0
elif gap < safe_gap * FOLLOW_RATIO:
    mode = "follow"
    desired_speed = lead_speed * (gap / safe_gap)
else:
    mode = "cruise"
    desired_speed = target_speed

desired_accel = pid.update(desired_speed, ego_speed, dt)
```

---

## IMC Tuning Rules (First-Order Systems)

For a first-order plant `G(s) = K / (tau*s + 1)`, Internal Model Control tuning gives a PI controller:

```
Kp = tau / (K * lambda)
Ki = Kp / tau          # equivalently: Ti = tau
Kd = 0                 # pure PI for first-order
```

Where `lambda` is the closed-loop time constant you choose:
- `lambda = tau` — moderate response (recommended default)
- `lambda = tau / 2` — faster, slightly more aggressive
- `lambda = 2 * tau` — slower, more robust

```python
def imc_pi_tuning(plant_gain, plant_tau, lambda_factor=1.0):
    lam = lambda_factor * plant_tau
    Kp = plant_tau / (plant_gain * lam)
    Ki = Kp / plant_tau
    return Kp, Ki
```

---

## Thermal Plant Simulation

First-order thermal model (Euler discretisation):

```python
dT_dt = (1.0 / plant_tau) * (-T + ambient_temp + plant_gain * u)
T += dT_dt * dt
```

Where `u` is heater power clamped to `[0, max_power]`.

**Disturbance handling**: at the disturbance step simply update `ambient_temp`:

```python
if step == disturbance_start:
    ambient_temp += disturbance_magnitude
```

The integrator in the PI controller will automatically reject the constant disturbance at steady state.

---

## Complete Simulation Loop Skeleton

```python
import json

def run_simulation(scenario_path, output_path):
    with open(scenario_path) as f:
        s = json.load(f)

    # --- initialise state ---
    temps, controls, errors = [], [], []
    T = s["initial_temp"]
    ambient = s["ambient_temp"]
    Kp, Ki = imc_pi_tuning(s["plant_gain"], s["plant_tau"], lambda_factor=0.5)
    ctrl = PIDController(Kp, Ki, 0.0, 0.0, s["max_power"])

    for step in range(s["total_steps"]):
        if step == s["disturbance_start"]:
            ambient += s["disturbance_magnitude"]
        u = ctrl.update(s["setpoint"], T, s["dt"])
        dT = (1.0 / s["plant_tau"]) * (-T + ambient + s["plant_gain"] * u)
        T += dT * s["dt"]
        temps.append(T)
        controls.append(u)
        errors.append(s["setpoint"] - T)

    with open(output_path, "w") as f:
        json.dump({"temperatures": temps, "control_signals": controls, "errors": errors}, f)

run_simulation("scenario.json", "thermal_output.json")
```

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| Forgetting anti-windup | Clamp `_integral` every step, not just when output saturates |
| Derivative spike on first call | Guard with `if _prev_error is None: D = 0` |
| Negative speed after braking | Clamp speed to `max(0, speed)` |
| Lead position not advanced | Update `lead_position += lead_speed * dt` before computing gap |
| Wrong IMC formula | `Kp = tau / (K * lambda)`, NOT `K / (tau * lambda)` |
| Integral accumulating during saturation | Check anti-windup is applied before, not after, multiplying by Ki |
