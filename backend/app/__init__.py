import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_object(Config)

    if test_config:
        app.config.update(test_config)
    CORS(app)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    from app import models
    from app.routes import main
    app.register_blueprint(main)

    return app