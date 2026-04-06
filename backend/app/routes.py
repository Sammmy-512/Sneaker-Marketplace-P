import os
from werkzeug.utils import secure_filename
from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash

from app import db
from app.models import User, Sneaker, Notification, WishlistCriteria, PriceAlert

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
        owner_id=current_user_id
    ).all()

    return jsonify([sneaker.to_dict() for sneaker in sneakers]), 200


@main.route("/api/vault", methods=["POST"])
@jwt_required()
def add_to_vault():
    current_user_id = int(get_jwt_identity())
    
    brand = request.form.get("brand")
    model = request.form.get("model")
    condition = request.form.get("condition")
    size = request.form.get("size")
    price = request.form.get("price")
    avg_market_price = request.form.get("avgMarketPrice")
    quantity = request.form.get("quantity", 1, type=int) # NEW: Capture quantity
    
    original_box_str = request.form.get("originalBox", "false")
    original_box = original_box_str.lower() == "true"

    if not brand or not model or condition is None or size is None or price is None:
        return jsonify({"message": "Missing required sneaker fields"}), 400

    def save_image(image_file):
        if image_file and image_file.filename:
            filename = secure_filename(image_file.filename)
            unique_filename = f"{current_user_id}_{filename}"
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
            image_file.save(filepath)
            return f"http://localhost:5000/static/uploads/{unique_filename}"
        return None

    image_front = save_image(request.files.get("image_front"))
    image_side = save_image(request.files.get("image_side"))
    image_sole = save_image(request.files.get("image_sole"))

    sneaker = Sneaker(
        owner_id=current_user_id,
        brand=brand,
        model=model,
        condition_grade=condition,
        original_box=original_box,
        size=size,
        price=price,
        avg_market_price=avg_market_price,
        quantity=quantity, # NEW FEATURE
        status="draft",    # NEW FEATUTRE
        image_front=image_front,
        image_side=image_side,
        image_sole=image_sole,
        is_public_listing=False
    )

    db.session.add(sneaker)
    db.session.commit()

    return jsonify(sneaker.to_dict()), 201


@main.route("/api/vault/<int:sneaker_id>/list", methods=["PUT"])
@jwt_required()
def list_sneaker(sneaker_id):
    current_user_id = int(get_jwt_identity())

    sneaker = Sneaker.query.filter_by(id=sneaker_id, owner_id=current_user_id).first()

    if not sneaker:
        return jsonify({"message": "Sneaker not found or unauthorized"}), 404

    sneaker.is_public_listing = True
    sneaker.status = "active" # NEW: Update status when listed

    # Notify the seller
    seller_notif = Notification(
        user_id=current_user_id,
        message=f"Your {sneaker.brand} {sneaker.model} (Size {sneaker.size}) is now live on the marketplace!",
        sneaker_id=sneaker.id
    )
    db.session.add(seller_notif)

    # Notify buyers whose wishlist criteria match this sneaker
    all_criteria = WishlistCriteria.query.filter(WishlistCriteria.user_id != current_user_id).all()
    for criteria in all_criteria:
        if criteria.brand and criteria.brand.lower() != sneaker.brand.lower():
            continue
        if criteria.model_keyword and criteria.model_keyword.lower() not in sneaker.model.lower():
            continue
        if criteria.min_size and sneaker.size < criteria.min_size:
            continue
        if criteria.max_size and sneaker.size > criteria.max_size:
            continue
        if criteria.min_price and float(sneaker.price) < float(criteria.min_price):
            continue
        if criteria.max_price and float(sneaker.price) > float(criteria.max_price):
            continue
        buyer_notif = Notification(
            user_id=criteria.user_id,
            message=f"New match for your wishlist \"{criteria.label}\": {sneaker.brand} {sneaker.model}, Size {sneaker.size}, ${float(sneaker.price):.2f}",
            sneaker_id=sneaker.id
        )
        db.session.add(buyer_notif)

    db.session.commit()

    return jsonify({"message": "Sneaker successfully listed", "sneaker": sneaker.to_dict()}), 200

# NEW: Cancel Listing
@main.route("/api/vault/<int:sneaker_id>/cancel", methods=["PUT"])
@jwt_required()
def cancel_sneaker(sneaker_id):
    current_user_id = int(get_jwt_identity())
    sneaker = Sneaker.query.filter_by(id=sneaker_id, owner_id=current_user_id).first()
    
    if not sneaker:
        return jsonify({"message": "Sneaker not found or unauthorized"}), 404
        
    sneaker.is_public_listing = False
    sneaker.status = "cancelled"
    db.session.commit()
    
    return jsonify({"message": "Listing cancelled", "sneaker": sneaker.to_dict()}), 200

# NEW: Relist Inventory
@main.route("/api/vault/<int:sneaker_id>/relist", methods=["PUT"])
@jwt_required()
def relist_sneaker(sneaker_id):
    current_user_id = int(get_jwt_identity())
    sneaker = Sneaker.query.filter_by(id=sneaker_id, owner_id=current_user_id).first()
    
    if not sneaker:
        return jsonify({"message": "Sneaker not found or unauthorized"}), 404

    data = request.get_json()
    new_quantity = data.get("quantity", 1)

    sneaker.quantity = int(new_quantity)
    sneaker.is_public_listing = True
    sneaker.status = "active"
    
    db.session.commit()
    
    return jsonify({"message": "Sneaker relisted successfully", "sneaker": sneaker.to_dict()}), 200

# Route to delete a sneaker from the vault
@main.route("/api/vault/<int:sneaker_id>", methods=["DELETE"])
@jwt_required()
def delete_sneaker(sneaker_id):
    current_user_id = int(get_jwt_identity())
    
    sneaker = Sneaker.query.filter_by(id=sneaker_id, owner_id=current_user_id).first()
    
    if not sneaker:
        return jsonify({"message": "Sneaker not found or unauthorized"}), 404

    # Cleanup
    for attr in ['image_front', 'image_side', 'image_sole']:
        img_url = getattr(sneaker, attr)
        if img_url:
            filename = img_url.split('/')[-1]
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            if os.path.exists(filepath):
                os.remove(filepath)

    db.session.delete(sneaker)
    db.session.commit()
    
    return jsonify({"message": "Sneaker deleted successfully"}), 200


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


@main.route("/api/notifications", methods=["GET"])
@jwt_required()
def get_notifications():
    current_user_id = int(get_jwt_identity())
    notifications = Notification.query.filter_by(user_id=current_user_id).order_by(Notification.created_at.desc()).all()
    return jsonify([n.to_dict() for n in notifications]), 200


@main.route("/api/notifications/<int:notif_id>/read", methods=["PUT"])
@jwt_required()
def mark_notification_read(notif_id):
    current_user_id = int(get_jwt_identity())
    notif = Notification.query.filter_by(id=notif_id, user_id=current_user_id).first()
    if not notif:
        return jsonify({"message": "Notification not found"}), 404
    notif.is_read = True
    db.session.commit()
    return jsonify({"message": "Marked as read"}), 200


@main.route("/api/notifications/read-all", methods=["PUT"])
@jwt_required()
def mark_all_notifications_read():
    current_user_id = int(get_jwt_identity())
    Notification.query.filter_by(user_id=current_user_id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "All notifications marked as read"}), 200


@main.route("/api/wishlist", methods=["GET"])
@jwt_required()
def get_wishlist():
    current_user_id = int(get_jwt_identity())
    criteria = WishlistCriteria.query.filter_by(user_id=current_user_id).order_by(WishlistCriteria.created_at.desc()).all()
    return jsonify([c.to_dict() for c in criteria]), 200


@main.route("/api/wishlist", methods=["POST"])
@jwt_required()
def add_wishlist():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    label = data.get("label", "").strip()
    if not label:
        return jsonify({"message": "Label is required"}), 400
    criteria = WishlistCriteria(
        user_id=current_user_id,
        label=label,
        brand=data.get("brand") or None,
        model_keyword=data.get("modelKeyword") or None,
        min_size=data.get("minSize") or None,
        max_size=data.get("maxSize") or None,
        min_price=data.get("minPrice") or None,
        max_price=data.get("maxPrice") or None,
    )
    db.session.add(criteria)
    db.session.commit()
    return jsonify(criteria.to_dict()), 201


@main.route("/api/wishlist/<int:criteria_id>", methods=["DELETE"])
@jwt_required()
def delete_wishlist(criteria_id):
    current_user_id = int(get_jwt_identity())
    criteria = WishlistCriteria.query.filter_by(id=criteria_id, user_id=current_user_id).first()
    if not criteria:
        return jsonify({"message": "Criteria not found"}), 404
    db.session.delete(criteria)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200


@main.route("/api/vault/<int:sneaker_id>/price", methods=["PUT"])
@jwt_required()
def update_price(sneaker_id):
    current_user_id = int(get_jwt_identity())
    sneaker = Sneaker.query.filter_by(id=sneaker_id, owner_id=current_user_id).first()
    if not sneaker:
        return jsonify({"message": "Sneaker not found or unauthorized"}), 404

    data = request.get_json()
    new_price = data.get("price")
    if new_price is None:
        return jsonify({"message": "Price is required"}), 400

    try:
        new_price = float(new_price)
    except ValueError:
        return jsonify({"message": "Invalid price"}), 400

    old_price = float(sneaker.price)
    sneaker.price = new_price

    # Only trigger alerts if price dropped and sneaker is publicly listed
    if sneaker.is_public_listing and new_price < old_price:
        alerts = PriceAlert.query.filter(
            PriceAlert.user_id != current_user_id,
            PriceAlert.is_active == True
        ).all()
        for alert in alerts:
            # Match by specific sneaker
            if alert.sneaker_id and alert.sneaker_id != sneaker.id:
                continue
            # Match by model keyword
            if alert.model_keyword and alert.model_keyword.lower() not in sneaker.model.lower():
                continue
            # Check target price threshold
            if alert.target_price and new_price > float(alert.target_price):
                continue

            drop = old_price - new_price
            msg = (
                f"Price drop on {sneaker.brand} {sneaker.model} (Size {sneaker.size})! "
                f"${old_price:.2f} → ${new_price:.2f} (−${drop:.2f})"
            )
            if alert.target_price:
                msg += f" — reached your target of ${float(alert.target_price):.2f}!"

            db.session.add(Notification(
                user_id=alert.user_id,
                message=msg,
                sneaker_id=sneaker.id
            ))

    db.session.commit()
    return jsonify(sneaker.to_dict()), 200


@main.route("/api/price-alerts", methods=["GET"])
@jwt_required()
def get_price_alerts():
    current_user_id = int(get_jwt_identity())
    alerts = PriceAlert.query.filter_by(user_id=current_user_id).order_by(PriceAlert.created_at.desc()).all()

    result = []
    for alert in alerts:
        d = alert.to_dict()
        if alert.sneaker_id:
            sneaker = Sneaker.query.get(alert.sneaker_id)
            if sneaker:
                d["sneakerLabel"] = f"{sneaker.brand} {sneaker.model} (Size {sneaker.size}) — ${float(sneaker.price):.2f}"
        result.append(d)
    return jsonify(result), 200


@main.route("/api/price-alerts", methods=["POST"])
@jwt_required()
def add_price_alert():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    sneaker_id = data.get("sneakerId")
    model_keyword = data.get("modelKeyword") or None
    target_price = data.get("targetPrice") or None

    if not sneaker_id and not model_keyword:
        return jsonify({"message": "Either sneakerId or modelKeyword is required"}), 400

    # Prevent duplicate alert for same sneaker
    if sneaker_id:
        existing = PriceAlert.query.filter_by(user_id=current_user_id, sneaker_id=sneaker_id, is_active=True).first()
        if existing:
            return jsonify({"message": "Alert already exists for this sneaker"}), 409

    alert = PriceAlert(
        user_id=current_user_id,
        sneaker_id=sneaker_id,
        model_keyword=model_keyword,
        target_price=target_price
    )
    db.session.add(alert)
    db.session.commit()
    return jsonify(alert.to_dict()), 201


@main.route("/api/price-alerts/<int:alert_id>", methods=["DELETE"])
@jwt_required()
def delete_price_alert(alert_id):
    current_user_id = int(get_jwt_identity())
    alert = PriceAlert.query.filter_by(id=alert_id, user_id=current_user_id).first()
    if not alert:
        return jsonify({"message": "Alert not found"}), 404
    db.session.delete(alert)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200


@main.route("/api/brands", methods=["GET"])
def get_brands():
    brands = db.session.query(Sneaker.brand).filter_by(is_public_listing=True).distinct().all()
    brand_list = [brand[0] for brand in brands]
    return jsonify(brand_list), 200


@main.route("/api/sneakers/<int:sneaker_id>", methods=["GET"])
def get_sneaker(sneaker_id):
    sneaker = Sneaker.query.filter_by(id=sneaker_id, is_public_listing=True).first()
    if not sneaker:
        return jsonify({"message": "Sneaker not found"}), 404
    return jsonify(sneaker.to_dict()), 200




#test to see if the worklow automation will be triggered on the push