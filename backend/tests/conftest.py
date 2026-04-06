from werkzeug.security import generate_password_hash
from flask_jwt_extended import create_access_token
import pytest

from app import create_app, db
from app.models import User, Sneaker


@pytest.fixture
def app(tmp_path):
    db_file = tmp_path / "test.db"
    upload_dir = tmp_path / "uploads"

    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": f"sqlite:///{db_file}",
        "SQLALCHEMY_TRACK_MODIFICATIONS": False,
        "JWT_SECRET_KEY": "test-jwt-secret",
        "SECRET_KEY": "test-secret",
        "UPLOAD_FOLDER": str(upload_dir),
    })

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def create_user():
    def _create_user(username="sam", email="sam@example.com", password="123456"):
        user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password)
        )
        db.session.add(user)
        db.session.commit()
        return user
    return _create_user


@pytest.fixture
def create_token(app):
    def _create_token(user_id):
        with app.app_context():
            return create_access_token(identity=str(user_id))
    return _create_token


@pytest.fixture
def auth_header(create_user, create_token):
    user = create_user()
    token = create_token(user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def create_sneaker():
    def _create_sneaker(
        owner_id,
        brand="Nike",
        model="Air Jordan 1",
        condition_grade="Like New",
        original_box=True,
        size=10,
        price=220,
        avg_market_price=260,
        is_public_listing=False,
        quantity=1,
        status="draft",
    ):
        sneaker = Sneaker(
            owner_id=owner_id,
            brand=brand,
            model=model,
            condition_grade=condition_grade,
            original_box=original_box,
            size=size,
            price=price,
            avg_market_price=avg_market_price,
            quantity=quantity,
            status=status,
            image_front=None,
            image_side=None,
            image_sole=None,
            is_public_listing=is_public_listing,
        )
        db.session.add(sneaker)
        db.session.commit()
        return sneaker
    return _create_sneaker