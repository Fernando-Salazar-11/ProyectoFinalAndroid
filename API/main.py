from contextlib import asynccontextmanager
from typing import Generator

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from sqlalchemy import Float, ForeignKey, String, Text, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, sessionmaker
import socket

# SQLite se guarda en el mismo directorio que main.py.
DATABASE_URL = "sqlite:///./catalogo.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    image_url: Mapped[str] = mapped_column(Text, default="")

    products: Mapped[list["Product"]] = relationship(
        back_populates="category",
        cascade="all, delete-orphan",
    )


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    price: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    image_url: Mapped[str] = mapped_column(Text, default="")

    category: Mapped[Category] = relationship(back_populates="products")


# Esquemas de respuesta: definen qué información recibe React Native.
class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str
    image_url: str


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category_id: int
    name: str
    description: str
    price: float
    image_url: str


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_database() -> None:
    """Inserta datos de ejemplo únicamente si la tabla categories está vacía."""
    with SessionLocal() as db:
        if db.scalar(select(Category.id).limit(1)) is not None:
            return

        catalog = [
            {
                "name": "Tecnología",
                "description": "Dispositivos y accesorios tecnológicos.",
                "image_url": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800",
                "products": [
                    ("Audífonos inalámbricos", "Audífonos Bluetooth con estuche de carga.", 899.00,
                     "https://images.unsplash.com/photo-150tf1634-5f8c7c1f8f3b?w=800"),
                    ("Teclado mecánico", "Teclado mecánico para trabajo y videojuegos.", 1299.00,
                     "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800"),
                    ("Cámara digital", "Cámara compacta para fotografía cotidiana.", 5499.00,
                     "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800"),
                ],
            },
            {
                "name": "Libros",
                "description": "Lecturas de distintos géneros y autores.",
                "image_url": "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800",
                "products": [
                    ("Cien años de soledad", "Novela de Gabriel García Márquez.", 349.00,
                     "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800"),
                    ("El principito", "Clásico literario de Antoine de Saint-Exupéry.", 189.00,
                     "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800"),
                    ("Hábitos atómicos", "Libro sobre hábitos y mejora personal.", 299.00,
                     "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800"),
                ],
            },
            {
                "name": "Videojuegos",
                "description": "Juegos y entretenimiento interactivo.",
                "image_url": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
                "products": [
                    ("Control inalámbrico", "Control para videojuegos compatible con PC.", 1199.00,
                     "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800"),
                    ("Consola de videojuegos", "Consola para entretenimiento en casa.", 8999.00,
                     "https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42?w=800"),
                    ("Mouse gamer", "Mouse óptico con botones programables.", 699.00,
                     "https://images.unsplash.com/photo-1527814050087-3793815479db?w=800"),
                ],
            },
            {
                "name": "Películas",
                "description": "Películas para disfrutar en casa.",
                "image_url": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",
                "products": [
                    ("Interestelar", "Película de ciencia ficción.", 249.00,
                     "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800"),
                    ("El viaje de Chihiro", "Película de animación y fantasía.", 229.00,
                     "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800"),
                    ("Trilogía clásica", "Colección de películas clásicas.", 499.00,
                     "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800"),
                ],
            },
            {
                "name": "Muebles",
                "description": "Muebles y artículos para el hogar.",
                "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
                "products": [
                    ("Silla de oficina", "Silla ergonómica para escritorio.", 2499.00,
                     "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800"),
                    ("Lámpara de escritorio", "Lámpara moderna para área de trabajo.", 599.00,
                     "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800"),
                    ("Mesa de centro", "Mesa minimalista para sala.", 1899.00,
                     "https://images.unsplash.com/photo-1499933374294-4584851497cc?w=800"),
                ],
            },
            {
                "name": "Deportes",
                "description": "Equipo y accesorios deportivos.",
                "image_url": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800",
                "products": [
                    ("Balón de fútbol", "Balón para entrenamiento y recreación.", 499.00,
                     "https://images.unsplash.com/photo-1614632537423-1e6c2e7e0b0b?w=800"),
                    ("Mancuernas", "Par de mancuernas para entrenamiento.", 799.00,
                     "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800"),
                    ("Tenis deportivos", "Calzado deportivo para uso diario.", 1599.00,
                     "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"),
                ],
            },
        ]

        for category_data in catalog:
            products_data = category_data.pop("products")
            category = Category(**category_data)
            for name, description, price, image_url in products_data:
                category.products.append(
                    Product(
                        name=name,
                        description=description,
                        price=price,
                        image_url=image_url,
                    )
                )
            db.add(category)

        db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_database()

    local_ip = get_local_ip()

    print("\n" + "=" * 50)
    print("       API DE CATALOGO INICIADA")
    print("=" * 50)
    print(" Local:   http://localhost:8000")
    print(f" Network: http://{local_ip}:8000")
    print(f" Docs:    http://{local_ip}:8000/docs")
    print("=" * 50 + "\n", flush=True)

    yield


app = FastAPI(
    title="API de Catálogo",
    description="API para consultar categorías y productos de la aplicación móvil.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["General"])
def root():
    return {"message": "API de Catálogo funcionando", "docs": "/docs"}


@app.get("/categories", response_model=list[CategoryOut], tags=["Categorías"])
def get_categories(db: Session = Depends(get_db)):
    return db.scalars(select(Category).order_by(Category.id)).all()


@app.get(
    "/categories/{category_id}/products",
    response_model=list[ProductOut],
    tags=["Productos"],
)
def get_products_by_category(category_id: int, db: Session = Depends(get_db)):
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    statement = (
        select(Product)
        .where(Product.category_id == category_id)
        .order_by(Product.id)
    )
    return db.scalars(statement).all()


@app.get("/products/{product_id}", response_model=ProductOut, tags=["Productos"])
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product



def get_local_ip():
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.connect(("8.8.8.8", 80))
        ip = sock.getsockname()[0]
        sock.close()
        return ip
    except OSError:
        return "127.0.0.1"
