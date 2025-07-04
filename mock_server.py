import random
import time
from datetime import datetime, timedelta
from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

readings = []

@app.route("/")
def index():
    return "✅ Mock Sensor Server Running"

@app.route("/data")
def latest_data():
    if readings:
        return jsonify(readings[-1])
    return jsonify({"error": "No data available"})

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
        "total_energy": round(total_power / 1000, 2),
        "anomaly_count": anomalies
    })

@app.route("/history")
def get_history():
    return jsonify(readings[-50:])

@app.route("/export/csv")
def export_csv():
    csv = "timestamp,co_in,co_out,efficiency,predicted_efficiency,voltage,current,power,anomaly,recommendation\n"
    for r in readings:
        csv += ",".join(str(r[k]) for k in r) + "\n"
    return csv, 200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=sensor_data_mock.csv'
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

    if health_score >= 80:
        status = "excellent"
    elif health_score >= 60:
        status = "good"
    elif health_score >= 40:
        status = "warning"
    else:
        status = "critical"

    return jsonify({
        "health_score": round(health_score, 1),
        "status": status,
        "avg_efficiency": round(avg_eff, 1),
        "anomaly_ratio": round(anomaly_ratio * 100, 1)
    })

@socketio.on("connect")
def on_connect():
    print("🖥 Frontend connected.")

def emit_fake_data():
    print("🚀 Mock data emitter started...")
    while True:
        co_in = round(random.uniform(30, 160), 2)
        co_out = round(co_in - random.uniform(5, 30), 2)
        efficiency = round(((co_in - co_out) / co_in) * 100, 2)
        pred_eff = round(efficiency + random.uniform(-5, 5), 2)
        voltage = round(random.uniform(1.5, 5), 2)
        current = round(random.uniform(20, 150), 2)
        power = round(voltage * current, 2)
        anomaly = int(efficiency < 25 or co_in > 140)
        recommendation = "⚠️ Clean catalytic mesh" if anomaly else "✅ System nominal"

        data = {
            "timestamp": datetime.now().isoformat(),
            "co_in": co_in,
            "co_out": co_out,
            "efficiency": efficiency,
            "predicted_efficiency": pred_eff,
            "voltage": voltage,
            "current": current,
            "power": power,
            "anomaly": anomaly,
            "recommendation": recommendation
        }

        readings.append(data)
        socketio.emit("sensor_data", data)
        print(f"📡 Emitted: CO_IN={co_in}, Eff={efficiency}, Anomaly={anomaly}")
        time.sleep(2)

if __name__ == "__main__":
    import threading
    t = threading.Thread(target=emit_fake_data)
    t.daemon = True
    t.start()

    # 👇 Force Flask + SocketIO to run on port 5001
    socketio.run(app, port=5001, host="0.0.0.0")  # or host="localhost"

