from datetime import datetime
from app import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    sneakers = db.relationship("Sneaker", backref="owner", lazy=True)

    def to_dict(self):
        return {
        "id": self.id,
        "username": self.username,
        "email": self.email
        }


class Sneaker(db.Model):
    __tablename__ = "sneakers"

    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    brand = db.Column(db.String(100), nullable=False)
    model = db.Column(db.String(100), nullable=False)
    condition_grade = db.Column(db.String(50), nullable=False)
    original_box = db.Column(db.Boolean, default=False)
    size = db.Column(db.Float, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    avg_market_price = db.Column(db.Numeric(10, 2), nullable=True)

    image_front = db.Column(db.String(255), nullable=True)
    image_side = db.Column(db.String(255), nullable=True)
    image_sole = db.Column(db.String(255), nullable=True)

    is_public_listing = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "brand": self.brand,
            "model": self.model,
            "condition": self.condition_grade,
            "originalBox": self.original_box,
            "size": self.size,
            "price": float(self.price),
            "avgMarketPrice": float(self.avg_market_price) if self.avg_market_price is not None else None,
            "images": {
                "front": self.image_front,
                "side": self.image_side,
                "sole": self.image_sole
            },
            "isPublic": self.is_public_listing
        }