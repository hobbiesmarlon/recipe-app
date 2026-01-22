from typing import Optional
from pydantic import BaseModel

class StepCreate(BaseModel):
    step_number: int
    instruction: str
    estimated_minutes: Optional[int] = None

class StepRead(StepCreate):
    id: int

    class Config:
        from_attributes = True
