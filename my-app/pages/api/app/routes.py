from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash

from app import db
from app.models import User, Sneaker

main = Blueprint("main", __name__)

@main.route("/")
def home():
    sneaker = Sneaker.query.first()
    return jsonify({"message": "server is running"}) 

@main.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"message": "Missing required fields"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"message": "Email already exists"}), 409

    hashed_password = generate_password_hash(password)

    user = User(
        username=username,
        email=email,
        password_hash=hashed_password
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully",
        "user": user.to_dict() if hasattr(user, "to_dict") else {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }), 201


@main.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"message": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "access_token": access_token
    }), 200


@main.route("/api/vault", methods=["GET"])
@jwt_required()
def get_vault():
    current_user_id = int(get_jwt_identity())

    sneakers = Sneaker.query.filter_by(
        owner_id=current_user_id,
        is_public_listing=False
    ).all()

    return jsonify([sneaker.to_dict() for sneaker in sneakers]), 200


@main.route("/api/vault", methods=["POST"])
@jwt_required()
def add_to_vault():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()

    brand = data.get("brand")
    model = data.get("model")
    condition = data.get("condition")
    size = data.get("size")
    price = data.get("price")
    avg_market_price = data.get("avgMarketPrice")
    original_box = data.get("originalBox", False)

    images = data.get("images", {})
    image_front = images.get("front")
    image_side = images.get("side")
    image_sole = images.get("sole")

    if not brand or not model or condition is None or size is None or price is None:
        return jsonify({"message": "Missing required sneaker fields"}), 400

    sneaker = Sneaker(
        owner_id=current_user_id,
        brand=brand,
        model=model,
        condition_grade=condition,
        original_box=original_box,
        size=size,
        price=price,
        avg_market_price=avg_market_price,
        image_front=image_front,
        image_side=image_side,
        image_sole=image_sole,
        is_public_listing=False
    )

    db.session.add(sneaker)
    db.session.commit()

    return jsonify(sneaker.to_dict()), 201

@main.route("/api/sneakers", methods=["GET"])
def get_sneakers():
    model = request.args.get("model")
    size = request.args.get("size")
    min_price = request.args.get("minPrice")
    max_price = request.args.get("maxPrice")
    brands = request.args.get("brands")

    query = Sneaker.query.filter_by(is_public_listing=True)

    if model:
        query = query.filter(Sneaker.model.ilike(f"%{model}%"))

    if size:
        try:
            size_value = float(size)
            query = query.filter(Sneaker.size == size_value)
        except ValueError:
            return jsonify({"message": "Invalid size value"}), 400

    if min_price:
        try:
            min_price_value = float(min_price)
            query = query.filter(Sneaker.price >= min_price_value)
        except ValueError:
            return jsonify({"message": "Invalid minPrice value"}), 400

    if max_price:
        try:
            max_price_value = float(max_price)
            query = query.filter(Sneaker.price <= max_price_value)
        except ValueError:
            return jsonify({"message": "Invalid maxPrice value"}), 400

    if brands:
        brand_list = [brand.strip() for brand in brands.split(",") if brand.strip()]
        if brand_list:
            query = query.filter(Sneaker.brand.in_(brand_list))

    sneakers = query.all()

    return jsonify([sneaker.to_dict() for sneaker in sneakers]), 200


@main.route("/api/brands", methods=["GET"])
def get_brands():
    brands = db.session.query(Sneaker.brand).filter_by(is_public_listing=True).distinct().all()
    brand_list = [brand[0] for brand in brands]
    return jsonify(brand_list), 200
        

