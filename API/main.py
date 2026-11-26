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
                     "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6qjFeFqrQZoXQXxCtVz1ZzIIW4v6IH7VNSVRv0lzI74YC9cuOH_H51Ss&s=10"),
                    ("Teclado mecánico", "Teclado mecánico para trabajo y videojuegos.", 1299.00,
                     "https://cougargaming.com/global/img/products/keyboards/600k/product-image.png"),
                    ("Cámara digital", "Cámara compacta para fotografía cotidiana.", 5499.00,
                     "https://resources.sanborns.com.mx/imagenes-sanborns-ii/1200/13803331936.jpg?scale=500&qlty=75"),
                ],
            },
            {
                "name": "Libros",
                "description": "Lecturas de distintos géneros y autores.",
                "image_url": "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800",
                "products": [
                    ("Cien años de soledad", "Novela de Gabriel García Márquez.", 349.00,
                     "https://m.media-amazon.com/images/I/81rEWmLXliL._AC_UF1000,1000_QL80_.jpg"),
                    ("El principito", "Clásico literario de Antoine de Saint-Exupéry.", 189.00,
                     "https://m.media-amazon.com/images/I/713nEf55PkL._AC_UF1000,1000_QL80_.jpg"),
                    ("Hábitos atómicos", "Libro sobre hábitos y mejora personal.", 299.00,
                     "https://product-media.cdn.t1.com/product-channel/250330/2025/10/9/3e2037c7a0df5f635c4c30dff9cf8cd6.png"),
                ],
            },
            {
                "name": "Videojuegos",
                "description": "Juegos y entretenimiento interactivo.",
                "image_url": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
                "products": [
                    ("Control inalámbrico PS5", "Control para videojuegos para consola PS5.", 1199.00,
                     "https://gmedia.playstation.com/is/image/SIEPDC/dualsense-controller-product-thumbnail-01-en-14sep21?$facebook$"),
                    ("Nintendo Switch 2", "La consola mas nueva de nintendo para jugar donde sea.", 8999.00,
                     "https://m.media-amazon.com/images/I/714-Fh3ngmL._AC_UF350,350_QL80_.jpg"),
                    ("Mouse gamer Logitech", "Mouse óptico con botones programables.", 699.00,
                     "https://sp628.liverpool.com.mx/i/1100986384.jpg"),
                ],
            },
            {
                "name": "Películas",
                "description": "Películas para disfrutar en casa.",
                "image_url": "https://media.revistaad.es/photos/60c21fe5b84a603be2210a0d/master/w_1600%2Cc_limit/296311.jpg",
                "products": [
                    ("Interestelar", "Película de ciencia ficción.", 249.00,
                     "https://m.media-amazon.com/images/S/pv-target-images/f107300cb4d2d53f3951a5f4ab3ceac04247d773ba40ed4cf09260ee782db3ba.jpg"),
                    ("El viaje de Chihiro", "Película de animación y fantasía.", 229.00,
                     "https://m.media-amazon.com/images/M/MV5BM2E2YzcwMTQtNWRlMC00ZGZlLWJhZTEtMDU4ZGIzMWI0NzJmXkEyXkFqcGc@._V1_.jpg"),
                    ("Trilogía Batman", "Colección de películas clásicas de Batman.", 499.00,
                     "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNZg1UkO3bOKyYPrts0MXaVHtvSHvcK1XuUHOfUFFzpB-s9uYwgNh1i4g&s=10"),
                ],
            },
            {
                "name": "Muebles",
                "description": "Muebles y artículos para el hogar.",
                "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9HcuXPHB7fVMUcXatzzG1f9eJoD8xaZiCbqQHFELjjeyXmsO_w2falLI&s=10",
                "products": [
                    ("Silla de oficina", "Silla ergonómica para escritorio.", 2499.00,
                     "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzNb4-Ek0pPbZnTvAaGdspLt6z1BfNLx-Fa1y3oDf4qV2Enj45-nOAXn0&s=10"),
                    ("Lámpara de escritorio", "Lámpara moderna para área de trabajo.", 599.00,
                     "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjE1ZKjqT3zEgn96BRlQ5t7dSEyFjZApqB3SZAI40q4bN7t6-0GBnHboeh&s=10"),
                    ("Mesa de centro", "Mesa minimalista para sala.", 1899.00,
                     "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnGkHCH93DcxO37uT2DFfbUhAis85E2Y8RQImIJNC0BnTpnbnpvuSm7d1x&s=10"),
                ],
            },
            {
                "name": "Deportes",
                "description": "Equipo y accesorios deportivos.",
                "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHlHooqppd9Pmy5N55wAGqKvoe5G1dPjHwdJwtVrn20FzJ1B3UwTjtXi0&s=10",
                "products": [
                    ("Balón de fútbol", "Balón para entrenamiento y recreación.", 499.00,
                     "https://lamarinamx.vtexassets.com/arquivos/ids/1365830-800-auto?v=638889846107700000&width=800&height=auto&aspect=true"),
                    ("Mancuernas", "Par de mancuernas para entrenamiento.", 799.00,
                     "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIkCzsV3J4cDPHOn6Vm2HbCJppat9JNB-E9eJ2RKDABA&s=10"),
                    ("Tenis de correr", "Calzado deportivo ideal para correr la máxima distancia.", 1599.00,
                     "https://www.endondecorrer.com/wp-content/uploads/2021/12/tenis-para-correr.jpg"),
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
