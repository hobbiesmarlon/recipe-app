async def mock_match_ingredient(name: str) -> int | None:
    canonical = {
        "salt": 1,
        "sugar": 2,
        "butter": 3,
    }
    return canonical.get(name.lower())
