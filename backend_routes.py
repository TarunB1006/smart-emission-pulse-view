
# Add these routes to your existing Flask backend

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
        csv_content = "timestamp,co_in,co_out,efficiency,predicted_eff,voltage,current,power,anomaly,recommendation\n"
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
