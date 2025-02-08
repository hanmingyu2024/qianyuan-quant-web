# tests/test_strategies.py

import unittest
from backend.api.strategies import create_strategy

class TestStrategies(unittest.TestCase):
    def test_create_strategy(self):
        response = create_strategy({"name": "Test Strategy", "symbol": "BTCUSD"})
        self.assertEqual(response.status_code, 201)
