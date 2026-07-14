#!/bin/bash
# Fetch current weather for multiple cities using Open-Meteo API
# Usage: bash weather-compare.sh "City1:lat:lon" "City2:lat:lon" ...
# Example: bash weather-compare.sh "Tokyo:35.6762:139.6503" "London:51.5074:-0.1278" "New York:40.7128:-74.0060"

set -euo pipefail

WMO_CODES='{"0":"Clear sky","1":"Mainly clear","2":"Partly cloudy","3":"Overcast","45":"Fog","48":"Rime fog","51":"Light drizzle","53":"Moderate drizzle","55":"Dense drizzle","56":"Freezing drizzle","57":"Dense freezing drizzle","61":"Slight rain","63":"Moderate rain","65":"Heavy rain","66":"Freezing rain","67":"Heavy freezing rain","71":"Slight snow","73":"Moderate snow","75":"Heavy snow","77":"Snow grains","80":"Slight rain showers","81":"Moderate rain showers","82":"Violent rain showers","85":"Slight snow showers","86":"Heavy snow showers","95":"Thunderstorm","96":"Thunderstorm with hail","99":"Thunderstorm with heavy hail"}'

if [ $# -eq 0 ]; then
  echo "Usage: bash weather-compare.sh \"City:lat:lon\" ..."
  echo "Example: bash weather-compare.sh \"Tokyo:35.6762:139.6503\" \"London:51.5074:-0.1278\" \"New York:40.7128:-74.0060\""
  exit 1
fi

# Build header
header="| Metric |"
separator="|--------|"
for entry in "$@"; do
  city=$(echo "$entry" | cut -d: -f1)
  header="$header $city |"
  separator="$separator--------|"
done
echo "$header"
echo "$separator"

# Collect data for all cities
declare -a temps_c temps_f humidities winds conditions
i=0
for entry in "$@"; do
  city=$(echo "$entry" | cut -d: -f1)
  lat=$(echo "$entry" | cut -d: -f2)
  lon=$(echo "$entry" | cut -d: -f3)

  data=$(curl -s --max-time 15 "https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&temperature_unit=celsius&wind_speed_unit=kmh")

  temp_c=$(echo "$data" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['current']['temperature_2m'])")
  temp_f=$(echo "$temp_c" | python3 -c "import sys; c=float(sys.stdin.read()); print(round(c*9/5+32,1))")
  humidity=$(echo "$data" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['current']['relative_humidity_2m'])")
  wind_kmh=$(echo "$data" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['current']['wind_speed_10m'])")
  wind_mph=$(echo "$wind_kmh" | python3 -c "import sys; k=float(sys.stdin.read()); print(round(k*0.621371,1))")
  wind_dir=$(echo "$data" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['current']['wind_direction_10m'])")
  code=$(echo "$data" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['current']['weather_code'])")
  condition=$(python3 -c "import json; codes=$WMO_CODES; print(codes.get('$code','Unknown'))")
  feels_c=$(echo "$data" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['current']['apparent_temperature'])")
  feels_f=$(echo "$feels_c" | python3 -c "import sys; c=float(sys.stdin.read()); print(round(c*9/5+32,1))")

  temps_c[$i]="$temp_c"
  temps_f[$i]="$temp_f"
  humidities[$i]="$humidity"
  winds[$i]="$wind_kmh km/h ($wind_mph mph)"
  conditions[$i]="$condition"

  i=$((i+1))
done

# Print rows
echo -n "| Temperature |"
for j in $(seq 0 $((i-1))); do echo -n " ${temps_c[$j]}°C (${temps_f[$j]}°F) |"; done
echo

echo -n "| Humidity |"
for j in $(seq 0 $((i-1))); do echo -n " ${humidities[$j]}% |"; done
echo

echo -n "| Wind Speed |"
for j in $(seq 0 $((i-1))); do echo -n " ${winds[$j]} |"; done
echo

echo -n "| Conditions |"
for j in $(seq 0 $((i-1))); do echo -n " ${conditions[$j]} |"; done
echo

echo ""
echo "*Data source: Open-Meteo API (https://open-meteo.com) — fetched at $(date -u '+%Y-%m-%d %H:%M UTC')*"
