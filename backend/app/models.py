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
    notifications = db.relationship("Notification", backref="user", lazy=True)
    wishlist_criteria = db.relationship("WishlistCriteria", backref="user", lazy=True)

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

    # NEW: Inventory Relisting Fields
    quantity = db.Column(db.Integer, default=1)
    status = db.Column(db.String(20), default="draft") # draft, active, expired, cancelled

    image_front = db.Column(db.String(255), nullable=True)
    image_side = db.Column(db.String(255), nullable=True)
    image_sole = db.Column(db.String(255), nullable=True)

    is_public_listing = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "ownerId": self.owner_id,
            "brand": self.brand,
            "model": self.model,
            "condition": self.condition_grade,
            "originalBox": self.original_box,
            "size": self.size,
            "price": float(self.price),
            "avgMarketPrice": float(self.avg_market_price) if self.avg_market_price is not None else None,
            "quantity": self.quantity,  # NEW STUFF
            "status": self.status,      # NEW STUFF
            "images": {
                "front": self.image_front,
                "side": self.image_side,
                "sole": self.image_sole
            },
            "isPublic": self.is_public_listing
        }


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    message = db.Column(db.String(500), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    sneaker_id = db.Column(db.Integer, db.ForeignKey("sneakers.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "message": self.message,
            "isRead": self.is_read,
            "sneakerId": self.sneaker_id,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }


class PriceAlert(db.Model):
    __tablename__ = "price_alerts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    sneaker_id = db.Column(db.Integer, db.ForeignKey("sneakers.id"), nullable=True)
    model_keyword = db.Column(db.String(100), nullable=True)
    target_price = db.Column(db.Numeric(10, 2), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "sneakerId": self.sneaker_id,
            "modelKeyword": self.model_keyword,
            "targetPrice": float(self.target_price) if self.target_price is not None else None,
            "isActive": self.is_active,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }


class WishlistCriteria(db.Model):
    __tablename__ = "wishlist_criteria"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    label = db.Column(db.String(100), nullable=False)
    brand = db.Column(db.String(100), nullable=True)
    model_keyword = db.Column(db.String(100), nullable=True)
    min_size = db.Column(db.Float, nullable=True)
    max_size = db.Column(db.Float, nullable=True)
    min_price = db.Column(db.Numeric(10, 2), nullable=True)
    max_price = db.Column(db.Numeric(10, 2), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "label": self.label,
            "brand": self.brand,
            "modelKeyword": self.model_keyword,
            "minSize": self.min_size,
            "maxSize": self.max_size,
            "minPrice": float(self.min_price) if self.min_price is not None else None,
            "maxPrice": float(self.max_price) if self.max_price is not None else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }