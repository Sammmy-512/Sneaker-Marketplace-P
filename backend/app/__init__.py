import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.config import Config

# NEW FEATURE: Import Mail
from flask_mail import Mail

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail() # NEW FEATURE: Initialize Mail

def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_object(Config)

    # NEW FEATURE: Basic Email Configuration 
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME', 'dummy123@example.com')
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD', 'dummy_password')

    if test_config:
        app.config.update(test_config)
    CORS(app)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app) # NEW FEATURE: Bind Mail to App

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    from app import models
    from app.routes import main
    app.register_blueprint(main)

    return app