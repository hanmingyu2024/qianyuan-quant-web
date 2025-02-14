import pytest
import asyncio

# 标记所有测试为异步
pytest.mark.asyncio(autouse=True)

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close() 