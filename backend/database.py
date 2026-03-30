import os
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Integer, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker


def _normalize_database_url(url: str) -> str:
    # Neon commonly provides postgres://... which SQLAlchemy wants as postgresql://...
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://") :]
    if url.startswith("postgresql://") and "+psycopg2" not in url:
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url


def get_database_url() -> str:
    url = os.environ.get("DATABASE_URL", "").strip()
    if url:
        return _normalize_database_url(url)

    # Local dev: SQLite file inside backend/
    here = os.path.dirname(os.path.abspath(__file__))
    return "sqlite:///" + os.path.join(here, "local.db").replace("\\", "/")


DATABASE_URL = get_database_url()

connect_args = {}
if DATABASE_URL.startswith("sqlite:///"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args=connect_args,
)


class Base(DeclarativeBase):
    pass


class Contact(Base):
    __tablename__ = "contacts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class Stat(Base):
    __tablename__ = "stats"

    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    value: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def get_session() -> Session:
    return SessionLocal()


def get_stat(session: Session, key: str) -> int:
    row: Optional[Stat] = session.get(Stat, key)
    if row is None:
        row = Stat(key=key, value=0)
        session.add(row)
        session.commit()
        session.refresh(row)
    return int(row.value)


def increment_stat(session: Session, key: str, amount: int = 1) -> int:
    row: Optional[Stat] = session.get(Stat, key)
    if row is None:
        row = Stat(key=key, value=0)
        session.add(row)
        session.flush()
    row.value = int(row.value) + int(amount)
    session.commit()
    session.refresh(row)
    return int(row.value)


init_db()

