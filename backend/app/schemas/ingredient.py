from typing import Optional
from pydantic import BaseModel

class IngredientCreate(BaseModel):
    name_text: str
    quantity: Optional[float] = None
    quantity_text: Optional[str] = None
    unit_id: Optional[int] = None
    preparation_notes: Optional[str] = None
    display_order: int = 0

class IngredientRead(IngredientCreate):
    id: int
    ingredient_id: Optional[int] = None

    class Config:
        from_attributes = True
