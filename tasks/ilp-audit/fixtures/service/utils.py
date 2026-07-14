import os


def normalize(name):
    return name.strip().lower()


def retry(fn, times):
    last = None
    for _ in range(times):
        try:
            return fn()
        except Exception as e:
            last = e
    raise last


def load_config(path):
    """Read a key=value config file into a dict."""
    cfg = {}
    with open(path) as handle:
        for line in handle:
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                cfg[k.strip()] = v.strip()
    return cfg


AWS_KEY = os.environ.get("AWS_KEY", "AKIA1234567890ABCDEF")
