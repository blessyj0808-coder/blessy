from __future__ import annotations

from datetime import datetime

from flask import Flask, jsonify, render_template, request

from .database import Contact, get_session, get_stat, increment_stat


app = Flask(
    __name__,
    template_folder="templates",
    static_folder="static",
    static_url_path="/static",
)


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/admin")
def admin():
    with get_session() as session:
        contacts = session.query(Contact).order_by(Contact.created_at.desc()).all()
        visitors = get_stat(session, "visitors")

    rows = [
        {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "message": c.message,
            "created_at": c.created_at,
        }
        for c in contacts
    ]
    return render_template("admin.html", contacts=rows, visitors=visitors)


@app.get("/api/health")
def api_health():
    return jsonify({"ok": True, "time": datetime.utcnow().isoformat() + "Z"})


@app.post("/api/contact")
def api_contact():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip()
    message = str(data.get("message", "")).strip()

    if not name or not email or not message:
        return jsonify({"ok": False, "error": "name, email, and message are required"}), 400
    if "@" not in email or "." not in email.split("@")[-1]:
        return jsonify({"ok": False, "error": "invalid email"}), 400

    with get_session() as session:
        c = Contact(name=name, email=email, message=message)
        session.add(c)
        session.commit()
        session.refresh(c)

    return jsonify({"ok": True, "id": c.id})


@app.get("/api/contacts")
def api_contacts():
    with get_session() as session:
        contacts = session.query(Contact).order_by(Contact.created_at.desc()).all()
    return jsonify(
        {
            "ok": True,
            "contacts": [
                {
                    "id": c.id,
                    "name": c.name,
                    "email": c.email,
                    "message": c.message,
                    "created_at": c.created_at.isoformat() + "Z",
                }
                for c in contacts
            ],
        }
    )


@app.post("/api/visit")
def api_visit():
    with get_session() as session:
        n = increment_stat(session, "visitors", 1)
    return jsonify({"ok": True, "visitors": n})


@app.get("/api/visitors")
def api_visitors():
    with get_session() as session:
        n = get_stat(session, "visitors")
    return jsonify({"ok": True, "visitors": n})

