import enum
from sqlalchemy import Enum
from sqlalchemy import Column, BigInteger, Text, Float
from app.core.db import Base, TimestampMixin

class UnitType(str, enum.Enum):
    WEIGHT = "weight"
    VOLUME = "volume"
    COUNT = "count"
    OTHER = "other"

unit_type = Column(Enum(UnitType, name="unit_type", native_enum=True))

class Unit(Base, TimestampMixin):
    __tablename__ = "units"

    id = Column(BigInteger, primary_key=True)
    name = Column(Text, unique=True, nullable=False)
    symbol = Column(Text)
    unit_type = Column(
        Enum(
            UnitType,
            native_enum=False,
            values_callable=lambda x: [e.value for e in x]
        ),
        default=UnitType.OTHER
    )
    conversion_to_base = Column(Float) # double precision
