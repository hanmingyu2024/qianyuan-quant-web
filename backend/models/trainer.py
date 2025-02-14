import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
import joblib
import logging

class ModelTrainer:
    def __init__(self, model_path: str = 'models/saved_models/'):
        self.model_path = model_path
        self.model = None
        self.logger = logging.getLogger(__name__)

    def build_lstm_model(self, input_shape):
        """构建LSTM模型"""
        model = Sequential([
            LSTM(units=50, return_sequences=True, input_shape=input_shape),
            Dropout(0.2),
            LSTM(units=50, return_sequences=False),
            Dropout(0.2),
            Dense(units=25, activation='relu'),
            Dense(units=1, activation='sigmoid')
        ])
        
        model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
        return model

    def train_model(self, X: np.ndarray, y: np.ndarray, validation_split=0.2):
        """训练模型"""
        try:
            X_train, X_val, y_train, y_val = train_test_split(
                X, y, test_size=validation_split, shuffle=False
            )

            self.model = self.build_lstm_model(input_shape=(X.shape[1], X.shape[2]))

            callbacks = [
                EarlyStopping(
                    monitor='val_loss',
                    patience=5,
                    restore_best_weights=True
                ),
                ModelCheckpoint(
                    filepath=f"{self.model_path}/best_model.h5",
                    monitor='val_loss',
                    save_best_only=True
                )
            ]

            history = self.model.fit(
                X_train, y_train,
                epochs=100,
                batch_size=32,
                validation_data=(X_val, y_val),
                callbacks=callbacks,
                verbose=1
            )

            self.save_model()
            return history

        except Exception as e:
            self.logger.error(f"Model training failed: {str(e)}")
            raise

    def save_model(self):
        """保存模型"""
        if self.model is not None:
            self.model.save(f"{self.model_path}/model.h5")
            self.logger.info("Model saved successfully")

    def load_model(self, model_name: str):
        """加载模型"""
        try:
            self.model = joblib.load(f"{self.model_path}/{model_name}")
            return self.model
        except Exception as e:
            self.logger.error(f"Failed to load model: {str(e)}")
            raise

    def evaluate_model(self, X_test: np.ndarray, y_test: np.ndarray):
        """评估模型"""
        if self.model is None:
            raise ValueError("Model not trained or loaded")
            
        loss, accuracy = self.model.evaluate(X_test, y_test)
        return {
            'loss': loss,
            'accuracy': accuracy
        }

    def predict(self, X: np.ndarray):
        """模型预测"""
        if self.model is None:
            raise ValueError("Model not trained or loaded")
            
        return self.model.predict(X) 