import sqlite3
import json
import sys
from datetime import datetime
import os

if len(sys.argv) < 2:
    print("❌ Please provide path to SQLite database")
    print("Usage: python extract-sqlite.py <path-to-db>")
    sys.exit(1)

db_path = sys.argv[1]

if not os.path.exists(db_path):
    print(f"❌ File not found: {db_path}")
    sys.exit(1)

print(f"🔍 Opening database: {db_path}\n")

try:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = [row[0] for row in cursor.fetchall()]
    
    print(f"📊 Found {len(tables)} tables:\n")
    for table in tables:
        print(f"  - {table}")
    
    export_data = {
        "exportDate": datetime.now().isoformat(),
        "sourceFile": db_path,
        "tables": {}
    }
    
    print("\n📦 Extracting data...\n")
    
    for table in tables:
        try:
            cursor.execute(f"SELECT * FROM {table}")
            rows = cursor.fetchall()
            export_data["tables"][table] = [dict(row) for row in rows]
            print(f"  {table}: {len(rows)} rows")
        except Exception as e:
            print(f"  {table}: Error - {str(e)}")
    
    conn.close()
    
    # Save to JSON
    timestamp = datetime.now().isoformat().replace(':', '-').replace('.', '-')
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backup_dir = os.path.join(os.path.dirname(script_dir), 'backups')
    os.makedirs(backup_dir, exist_ok=True)
    
    output_file = os.path.join(backup_dir, f"sqlite-export-{timestamp}.json")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(export_data, f, indent=2, ensure_ascii=False)
    
    file_size = os.path.getsize(output_file) / 1024
    
    print(f"\n✅ Data exported successfully!")
    print(f"📁 Location: {output_file}")
    print(f"📊 Size: {file_size:.2f} KB\n")
    
except Exception as error:
    print(f"❌ Error: {str(error)}")
    sys.exit(1)
