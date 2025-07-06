
# Add these routes to your existing Flask backend

import serial
import json
import sqlite3
from datetime import datetime
from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO

SERIAL_PORT = 'COM21'  # 👈 Replace with your COM port if you're on Windows (e.g., 'COM3')
BAUD_RATE = 9600

print(f"Connecting to serial port {SERIAL_PORT} at {BAUD_RATE} baud...")
ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
print("Serial connection established.\n")

# Flask + SocketIO
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# SQLite setup
print("Connecting to SQLite database: sensor_data.db")
conn = sqlite3.connect('sensor_data.db', check_same_thread=False)
cursor = conn.cursor()
cursor.execute('''
CREATE TABLE IF NOT EXISTS readings (
    timestamp TEXT,
    co_in REAL,
    co_out REAL,
    efficiency REAL,
    voltage REAL,
    current REAL,
    power REAL
)
''')
conn.commit()
print("Database setup completed.\n")

@app.route("/data")
def latest_data():
    cursor.execute("SELECT * FROM readings ORDER BY timestamp DESC LIMIT 1")
    row = cursor.fetchone()
    if row:
        return jsonify({
            "timestamp": row[0],
            "co_in": row[1],
            "co_out": row[2],
            "efficiency": row[3],
            "voltage": row[4],
            "current": row[5],
            "power": row[6]
        })
    return jsonify({"error": "No data"})

@app.route("/stats/daily")
def get_daily_stats():
    """Get daily statistics from the database"""
    try:
        today = datetime.now().strftime('%Y-%m-%d')
        
        # Max CO_IN today
        cursor.execute("SELECT MAX(co_in) FROM readings WHERE DATE(timestamp) = ?", (today,))
        max_co_in = cursor.fetchone()[0] or 0
        
        # Average efficiency today
        cursor.execute("SELECT AVG(efficiency) FROM readings WHERE DATE(timestamp) = ?", (today,))
        avg_efficiency = cursor.fetchone()[0] or 0
        
        # Total energy generated today (sum of power readings)
        cursor.execute("SELECT SUM(power) FROM readings WHERE DATE(timestamp) = ?", (today,))
        total_energy = cursor.fetchone()[0] or 0
        
        # Anomalies detected today
        cursor.execute("SELECT COUNT(*) FROM readings WHERE DATE(timestamp) = ? AND anomaly = 1", (today,))
        anomaly_count = cursor.fetchone()[0] or 0
        
        return jsonify({
            "max_co_in": round(max_co_in, 2),
            "avg_efficiency": round(avg_efficiency, 2),
            "total_energy": round(total_energy / 1000, 2),  # Convert to watts
            "anomaly_count": anomaly_count
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/history")
def get_historical_data():
    """Get historical data for charts (last 50 readings)"""
    try:
        cursor.execute("""
            SELECT timestamp, co_in, co_out, efficiency, power 
            FROM readings 
            ORDER BY timestamp DESC 
            LIMIT 50
        """)
        rows = cursor.fetchall()
        
        data = []
        for row in rows:
            data.append({
                "timestamp": row[0],
                "co_in": row[1],
                "co_out": row[2],
                "efficiency": row[3],
                "power": row[4]
            })
        
        # Reverse to get chronological order
        return jsonify(data[::-1])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/export/csv")
def export_csv():
    """Export last 24h of data as CSV"""
    try:
        from datetime import timedelta
        yesterday = (datetime.now() - timedelta(days=1)).isoformat()
        
        cursor.execute("""
            SELECT * FROM readings 
            WHERE timestamp >= ? 
            ORDER BY timestamp DESC
        """, (yesterday,))
        
        rows = cursor.fetchall()
        
        # Create CSV content
        csv_content = "timestamp,co_in,co_out,efficiency,voltage,current\n"
        for row in rows:
            csv_content += ",".join(str(x) for x in row) + "\n"
        
        return csv_content, 200, {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename=sensor_data_24h.csv'
        }
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/system/health")
def get_system_health():
    """Get overall system health score"""
    try:
        # Get last 10 readings for health calculation
        cursor.execute("""
            SELECT efficiency, anomaly, power 
            FROM readings 
            ORDER BY timestamp DESC 
            LIMIT 10
        """)
        rows = cursor.fetchall()
        
        if not rows:
            return jsonify({"health_score": 0, "status": "no_data"})
        
        # Calculate health score based on efficiency and anomalies
        avg_efficiency = sum(row[0] for row in rows) / len(rows)
        anomaly_ratio = sum(row[1] for row in rows) / len(rows)
        avg_power = sum(row[2] for row in rows) / len(rows)
        
        # Health score calculation (0-100)
        health_score = max(0, min(100, 
            (avg_efficiency * 0.6) + 
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
            "avg_efficiency": round(avg_efficiency, 1),
            "anomaly_ratio": round(anomaly_ratio * 100, 1)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def read_serial_data():
    print("🟢 Started listening to serial data from Pico...\n")
    while True:
        try:
            line = ser.readline().decode('utf-8').strip()
            if not line or not line.startswith("{"):
                continue

            print("📥 Raw JSON line from Pico:", line)
            data = json.loads(line)

            co_in = data.get("CO_IN", 0)
            co_out = data.get("CO_OUT", 0)
            voltage = data.get("V_bus", 0)
            current = data.get("current", 0)
            power = data.get("power", 0)
            timestamp = datetime.now().isoformat()

            efficiency = ((co_in - co_out) / co_in * 100) if co_in > 0 else 0
            print(f"✅ Parsed: CO_IN={co_in}, CO_OUT={co_out}, Efficiency={efficiency:.2f}%")

            # Save to DB
            cursor.execute("INSERT INTO readings VALUES (?, ?, ?, ?, ?, ?, ?)",
                           (timestamp, co_in, co_out, efficiency, voltage, current, power))
            conn.commit()
            print("💾 Saved to database.")

            # Emit to dashboard
            socketio.emit("sensor_data", {
                "timestamp": timestamp,
                "co_in": co_in,
                "co_out": co_out,
                "efficiency": efficiency,
                "voltage": voltage,
                "current": current,
                "power": power
            })
            print("📡 Sent to dashboard via WebSocket.\n")

        except Exception as e:
            print("❌ Error parsing or processing serial data:", e)

@socketio.on("connect")
def on_connect():
    print("🖥 Web dashboard connected to server.\n")

if __name__ == "__main__":
    import threading
    t = threading.Thread(target=read_serial_data)
    t.daemon = True
    t.start()
    print("🚀 Flask + SocketIO server started on http://localhost:5000")
    socketio.run(app, port=5001)
