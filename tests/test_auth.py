# tests/test_auth.py

import unittest
from backend.api.auth import login

class TestAuth(unittest.TestCase):
    def test_login_success(self):
        response = login({"username": "admin", "password": "admin"})
        self.assertEqual(response.status_code, 200)
        self.assertIn('access_token', response.json)
    
    def test_login_failure(self):
        response = login({"username": "admin", "password": "wrong"})
        self.assertEqual(response.status_code, 401)
