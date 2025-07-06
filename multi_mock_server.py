'''import random
import time
from datetime import datetime
from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import threading

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

readings = []

@app.route("/")
def index():
    return "✅ Final Bike Mock Server (High Efficiency, Low Power) Running"

@app.route("/data")
def latest_data():
    return jsonify(readings[-1]) if readings else jsonify({"error": "No data"})

@app.route("/history")
def get_history():
    return jsonify(readings[-50:])

@app.route("/stats/daily")
def get_daily_stats():
    today = datetime.now().strftime('%Y-%m-%d')
    today_readings = [r for r in readings if r["timestamp"].startswith(today)]
    if not today_readings:
        return jsonify({
            "max_co_in": 0,
            "avg_efficiency": 0,
            "total_energy": 0,
            "anomaly_count": 0
        })

    max_co = max(r["co_in"] for r in today_readings)
    avg_eff = sum(r["efficiency"] for r in today_readings) / len(today_readings)
    total_power = sum(r["power"] for r in today_readings)
    anomalies = sum(r["anomaly"] for r in today_readings)

    return jsonify({
        "max_co_in": round(max_co, 2),
        "avg_efficiency": round(avg_eff, 2),
        "total_energy": round(total_power / 1000, 4),  # Convert to Watts
        "anomaly_count": anomalies
    })

@app.route("/export/csv")
def export_csv():
    csv = "timestamp,co_in,co_out,efficiency,predicted_efficiency,voltage,current,power,anomaly,recommendation,vehicle\n"
    for r in readings:
        csv += ",".join(str(r[k]) for k in r) + "\n"
    return csv, 200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=sensor_data_bike.csv'
    }

@app.route("/system/health")
def system_health():
    last_10 = readings[-10:]
    if not last_10:
        return jsonify({"health_score": 0, "status": "no_data"})

    avg_eff = sum(r["efficiency"] for r in last_10) / len(last_10)
    anomaly_ratio = sum(r["anomaly"] for r in last_10) / len(last_10)
    avg_power = sum(r["power"] for r in last_10) / len(last_10)

    health_score = max(0, min(100,
        (avg_eff * 0.6) +
        ((1 - anomaly_ratio) * 30) +
        (min(avg_power / 100, 1) * 10)
    ))

    status = (
        "excellent" if health_score >= 80 else
        "good" if health_score >= 60 else
        "warning" if health_score >= 40 else
        "critical"
    )

    return jsonify({
        "health_score": round(health_score, 1),
        "status": status,
        "avg_efficiency": round(avg_eff, 1),
        "anomaly_ratio": round(anomaly_ratio * 100, 1)
    })

@socketio.on("connect")
def on_connect():
    print("🖥️ Frontend connected.")

def emit_bike_data():
    print("🚀 Emitting clean bike data with high efficiency and low power...")
    step = 0

    while True:
        # CO profile and efficiency pattern
        if step < 3:
            co_in = round(0.25, 2)
            efficiency = 0
        elif step == 3:
            co_in = 2800
            efficiency = 85
        elif step == 4:
            co_in = 3200
            efficiency = 88
        elif 5 <= step <= 10:
            co_in = 3749
            efficiency = 92
        elif step == 11:
            co_in = 2800
            efficiency = 90
        elif step == 12:
            co_in = 1800
            efficiency = 88
        elif step == 13:
            co_in = 1100
            efficiency = 86
        elif step == 14:
            co_in = 800
            efficiency = 85
        else:
            co_in = round(0.25, 2)
            efficiency = 85  # Maintain minimum requirement

        co_out = round(co_in * (1 - efficiency / 100), 2)

        # Controlled voltage + current to keep power low
        voltage = round(random.uniform(2.5, 3.0), 2)
        current = round(random.uniform(270, 290), 2)  # mA
        power = round((voltage * (current / 1000)) * 1000, 2)  # mW

        # Check anomaly
        anomaly = int(efficiency < 50 or co_in > 4000)
        recommendation = "⚠️ Clean catalytic mesh" if anomaly else "✅ System nominal"

        # Final payload
        data = {
            "timestamp": datetime.now().isoformat(),
            "co_in": co_in,
            "co_out": co_out,
            "efficiency": efficiency,
            "predicted_efficiency": round(efficiency + 1.2, 2),
            "voltage": voltage,
            "current": current,
            "power": power,
            "anomaly": anomaly,
            "recommendation": recommendation,
            "vehicle": "bike"
        }

        readings.append(data)
        socketio.emit("sensor_data", data)

        print(f"[{step}] CO_IN={co_in}, CO_OUT={co_out}, Eff={efficiency}%, V={voltage}V, I={current}mA, P={power}mW")

        step += 1
        time.sleep(8)

if __name__ == "__main__":
    thread = threading.Thread(target=emit_bike_data)
    thread.daemon = True
    thread.start()
    socketio.run(app, port=5001, host="0.0.0.0")'''

import random
import time
from datetime import datetime
from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import threading

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

readings = []

@app.route("/")
def index():
    return "✅ Final Car Mock Server Running"

@app.route("/data")
def latest_data():
    return jsonify(readings[-1]) if readings else jsonify({"error": "No data"})

@app.route("/history")
def get_history():
    return jsonify(readings[-50:])

@app.route("/stats/daily")
def get_daily_stats():
    today = datetime.now().strftime('%Y-%m-%d')
    today_readings = [r for r in readings if r["timestamp"].startswith(today)]
    if not today_readings:
        return jsonify({
            "max_co_in": 0,
            "avg_efficiency": 0,
            "total_energy": 0,
            "anomaly_count": 0
        })

    max_co = max(r["co_in"] for r in today_readings)
    avg_eff = sum(r["efficiency"] for r in today_readings) / len(today_readings)
    total_power = sum(r["power"] for r in today_readings)
    anomalies = sum(r["anomaly"] for r in today_readings)

    return jsonify({
        "max_co_in": round(max_co, 2),
        "avg_efficiency": round(avg_eff, 2),
        "total_energy": round(total_power / 1000, 4),  # W
        "anomaly_count": anomalies
    })

@app.route("/export/csv")
def export_csv():
    csv = "timestamp,co_in,co_out,efficiency,predicted_efficiency,voltage,current,power,anomaly,recommendation,vehicle\n"
    for r in readings:
        csv += ",".join(str(r[k]) for k in r) + "\n"
    return csv, 200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=sensor_data_car.csv'
    }

@app.route("/system/health")
def system_health():
    last_10 = readings[-10:]
    if not last_10:
        return jsonify({"health_score": 0, "status": "no_data"})

    avg_eff = sum(r["efficiency"] for r in last_10) / len(last_10)
    anomaly_ratio = sum(r["anomaly"] for r in last_10) / len(last_10)
    avg_power = sum(r["power"] for r in last_10) / len(last_10)

    health_score = max(0, min(100,
        (avg_eff * 0.6) +
        ((1 - anomaly_ratio) * 30) +
        (min(avg_power / 100, 1) * 10)
    ))

    status = (
        "excellent" if health_score >= 80 else
        "good" if health_score >= 60 else
        "warning" if health_score >= 40 else
        "critical"
    )

    return jsonify({
        "health_score": round(health_score, 1),
        "status": status,
        "avg_efficiency": round(avg_eff, 1),
        "anomaly_ratio": round(anomaly_ratio * 100, 1)
    })

@socketio.on("connect")
def on_connect():
    print("🖥️ Frontend connected.")

def emit_car_data():
    print("🚗 Emitting car sensor stream with high efficiency and low power...")
    step = 0

    while True:
        # Emission logic
        if step < 2:
            co_in = 2200
            efficiency = 88
        elif step < 5:
            co_in = 2800
            efficiency = 90
        elif 5 <= step <= 10:
            co_in = 2950
            efficiency = 92
        elif step <= 12:
            co_in = 2400
            efficiency = 90
        elif step <= 14:
            co_in = 1800
            efficiency = 88
        else:
            co_in = 800
            efficiency = 85

        co_out = round(co_in * (1 - efficiency / 100), 2)

        voltage = round(random.uniform(2.5, 3.0), 2)
        current = round(random.uniform(270, 290), 2)  # mA
        power = round((voltage * (current / 1000)) * 1000, 2)  # mW

        anomaly = int(efficiency < 50 or co_in > 4000)
        recommendation = "⚠️ Clean catalytic mesh" if anomaly else "✅ System nominal"

        data = {
            "timestamp": datetime.now().isoformat(),
            "co_in": co_in,
            "co_out": co_out,
            "efficiency": efficiency,
            "predicted_efficiency": round(efficiency + 1.2, 2),
            "voltage": voltage,
            "current": current,
            "power": power,
            "anomaly": anomaly,
            "recommendation": recommendation,
            "vehicle": "car"
        }

        readings.append(data)
        socketio.emit("sensor_data", data)
        print(f"[{step}] CO_IN={co_in}, CO_OUT={co_out}, Eff={efficiency}%, V={voltage}V, I={current}mA, P={power}mW")
        step += 1
        time.sleep(8)

if __name__ == "__main__":
    thread = threading.Thread(target=emit_car_data)
    thread.daemon = True
    thread.start()
    socketio.run(app, port=5001, host="0.0.0.0")
